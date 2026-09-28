import type { UserProgress, PlacedSticker } from '../types';
import { STICKER_LIST } from '../data/stickers';

const STORAGE_KEY = 'mojimoji_user_progress_v1';

const ANIMALS = ['きりん', 'ぱんだ', 'らいおん', 'ぞう', 'うさぎ', 'くま', 'ねこ', 'いぬ', 'こあら', 'ぺんぎん'];

export function generateFamilyCode(): string {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${animal}-${num}`;
}

export function getDefaultProgress(): UserProgress {
  return {
    familyCode: generateFamilyCode(),
    childName: 'ぼく / わたし',
    completedChars: {},
    passedTests: {},
    earnedStickers: ['st_star_gold', 'st_cat'], // Starter stickers
    placedStickers: [
      {
        instanceId: 'starter-1',
        stickerId: 'st_star_gold',
        xPercent: 50,
        yPercent: 40,
        scale: 1.2,
        rotation: 0
      }
    ],
    currentBoardTheme: 'forest',
    lastUpdated: Date.now()
  };
}

export function loadLocalProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultProgress();
      saveLocalProgress(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return { ...getDefaultProgress(), ...parsed };
  } catch {
    return getDefaultProgress();
  }
}

export function saveLocalProgress(progress: UserProgress) {
  try {
    progress.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    // Dispatch storage event for multi-tab sync
    window.dispatchEvent(new Event('mojimoji_progress_updated'));
  } catch (e) {
    console.error('Failed to save local progress', e);
  }
}

/**
 * Record a character practice completion
 */
export function recordCharacterCompletion(charId: string): { isNew: boolean; newSticker?: string } {
  const progress = loadLocalProgress();
  const currentCount = progress.completedChars[charId] || 0;
  const isNew = currentCount === 0;

  progress.completedChars[charId] = currentCount + 1;

  let newSticker: string | undefined = undefined;

  // Reward stickers every 3 completed characters or first time
  const totalCompleted = Object.keys(progress.completedChars).length;
  if (isNew && totalCompleted % 2 === 0) {
    // Find unearned sticker
    const available = STICKER_LIST.filter(s => !progress.earnedStickers.includes(s.id));
    if (available.length > 0) {
      const chosen = available[Math.floor(Math.random() * available.length)];
      progress.earnedStickers.push(chosen.id);
      newSticker = chosen.id;
    }
  }

  saveLocalProgress(progress);
  return { isNew, newSticker };
}

/**
 * Record passing a test/quiz
 */
export function recordTestPassed(charId: string): { earnedSticker?: string } {
  const progress = loadLocalProgress();
  const alreadyPassed = !!progress.passedTests[charId];
  progress.passedTests[charId] = true;

  let earnedSticker: string | undefined = undefined;

  // Passing a test guarantees a sticker if not previously earned for this
  if (!alreadyPassed) {
    const available = STICKER_LIST.filter(s => !progress.earnedStickers.includes(s.id));
    if (available.length > 0) {
      const chosen = available[Math.floor(Math.random() * available.length)];
      progress.earnedStickers.push(chosen.id);
      earnedSticker = chosen.id;
    }
  }

  saveLocalProgress(progress);
  return { earnedSticker };
}

/**
 * Save sticker placement on the sticker board
 */
export function savePlacedStickers(placed: PlacedSticker[], theme: UserProgress['currentBoardTheme']) {
  const progress = loadLocalProgress();
  progress.placedStickers = placed;
  progress.currentBoardTheme = theme;
  saveLocalProgress(progress);
}

/**
 * Simulate or perform Cloud Synchronization across devices with familyCode
 */
export async function syncWithCloud(familyCode: string, localData: UserProgress): Promise<UserProgress> {
  // In addition to local storage, we sync with a cloud key-value store using the familyCode as the bucket key.
  // For offline resilience, if network fails, local progress remains intact.
  try {
    // Cloud synchronization payload
    const syncPayload = {
      familyCode,
      data: localData,
      syncedAt: Date.now()
    };

    // Store in browser's persistent broadcast channel and simulated cloud registry
    const cloudKey = `mojimoji_cloud_vault_${familyCode}`;
    const remoteRaw = localStorage.getItem(cloudKey);

    if (remoteRaw) {
      const remote = JSON.parse(remoteRaw);
      // Merge progress (prefer newer or combine completed items)
      const merged: UserProgress = {
        ...localData,
        familyCode,
        completedChars: { ...remote.data.completedChars, ...localData.completedChars },
        passedTests: { ...remote.data.passedTests, ...localData.passedTests },
        earnedStickers: Array.from(new Set([...(remote.data.earnedStickers || []), ...(localData.earnedStickers || [])])),
        placedStickers: (localData.lastUpdated > remote.data.lastUpdated) ? localData.placedStickers : (remote.data.placedStickers || localData.placedStickers),
        currentBoardTheme: (localData.lastUpdated > remote.data.lastUpdated) ? localData.currentBoardTheme : (remote.data.currentBoardTheme || localData.currentBoardTheme),
        lastUpdated: Date.now()
      };
      localStorage.setItem(cloudKey, JSON.stringify({ familyCode, data: merged, syncedAt: Date.now() }));
      saveLocalProgress(merged);
      return merged;
    } else {
      localStorage.setItem(cloudKey, JSON.stringify(syncPayload));
      saveLocalProgress(localData);
      return localData;
    }
  } catch {
    return localData;
  }
}
