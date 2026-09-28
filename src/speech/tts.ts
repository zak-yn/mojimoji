/**
 * Web Speech API + Authentic Pre-recorded Audio Engine.
 * Supports Japanese (ja-JP), English (en-US), Polish (pl-PL),
 * and the 3-step Phonics Chain (Letter Name -> Letter Sound -> Anchor Word).
 *
 * NOTE: Devices often lack Polish (pl-PL) TTS voice packs by default,
 * which causes SpeechSynthesis to fall back to a Japanese or English voice.
 * mojimoji solves this by providing 100% authentic native Polish audio in /audio/polish/
 * for all Polish letter names, phonemes (głoski), and vocabulary words.
 */

import type { CharacterItem } from '../types';

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private activeChainTimeout: number | null = null;
  private activeAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public cancel() {
    if (this.activeChainTimeout) {
      clearTimeout(this.activeChainTimeout);
      this.activeChainTimeout = null;
    }
    if (this.activeAudio) {
      // Null out callbacks BEFORE pausing to prevent onended from triggering chain steps
      this.activeAudio.onended = null;
      this.activeAudio.onerror = null;
      this.activeAudio.pause();
      this.activeAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Resolve Japanese audio file ID from character item ID.
   * characters.ts uses romanized IDs (hira_shi, hira_chi, hira_tsu, hira_fu)
   * but audio files use simplified Hepburn (ja_hira_si, ja_hira_ti, ja_hira_tu, ja_hira_hu).
   */
  private resolveJapaneseAudioId(itemId: string): string | null {
    // Normalize romanization differences between characters.ts IDs and audio file names
    const NORM: Record<string, string> = {
      'hira_shi': 'hira_si',
      'hira_chi': 'hira_ti',
      'hira_tsu': 'hira_tu',
      'hira_fu':  'hira_hu',
      'kata_shi': 'kata_si',
      'kata_chi': 'kata_ti',
      'kata_tsu': 'kata_tu',
      'kata_fu':  'kata_hu',
    };
    if (itemId.startsWith('hira_') || itemId.startsWith('kata_')) {
      const normalized = NORM[itemId] ?? itemId;
      return `ja_${normalized}`;
    }
    return null;
  }

  /**
   * Play an MP3 file via HTML5 Audio
   */
  public playAudioFile(url: string, onEnd?: () => void): boolean {
    // Stop any previously playing audio without triggering its onended callback
    if (this.activeAudio) {
      this.activeAudio.onended = null;
      this.activeAudio.onerror = null;
      this.activeAudio.pause();
      this.activeAudio = null;
    }
    try {
      const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;
      const audio = new Audio(fullUrl);
      this.activeAudio = audio;
      audio.onended = () => {
        this.activeAudio = null;
        if (onEnd) onEnd();
      };
      audio.onerror = () => {
        this.activeAudio = null;
        if (onEnd) onEnd();
      };
      audio.play().catch(() => {
        this.activeAudio = null;
        if (onEnd) onEnd();
      });
      return true;
    } catch {
      if (onEnd) onEnd();
      return false;
    }
  }

  /**
   * Speak a text string with appropriate voice and pitch via SpeechSynthesis
   */
  public speak(text: string, langCode: string, onEnd?: () => void, rate = 0.85) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = rate; // clear and friendly for 6-year-olds
      utterance.pitch = 1.05;

      if (this.voices.length > 0) {
        const matched = this.voices.find(v => v.lang.toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase()));
        if (matched) {
          utterance.voice = matched;
        }
      }

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      this.synth.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  /**
   * Play a specific phonics part ('name' | 'sound' | 'word') for a character
   */
  public speakPart(item: CharacterItem, part: 'name' | 'sound' | 'word', onEnd?: () => void) {
    this.cancel();

    // Japanese (Hiragana/Katakana): prefer pre-recorded MP3, fall back to Web Speech
    if (item.langCode.startsWith('ja')) {
      const audioId = this.resolveJapaneseAudioId(item.id);
      // Japanese has no separate 'sound' step — name and sound are identical
      const filePart = part === 'sound' ? 'name' : part;
      if (audioId) {
        const url = `/audio/japanese/${audioId}_${filePart}.mp3`;
        // Try MP3 first; if it fails (file not found), fall back to Web Speech
        const audio = new Audio(url);
        audio.onerror = () => {
          // Fallback: Web Speech API
          if (part === 'word') {
            this.speak(item.exampleWord, item.langCode, onEnd);
          } else {
            this.speak(item.char, item.langCode, onEnd);
          }
        };
        audio.onended = () => { if (onEnd) onEnd(); };
        this.activeAudio = audio;
        audio.play().catch(() => {
          if (part === 'word') {
            this.speak(item.exampleWord, item.langCode, onEnd);
          } else {
            this.speak(item.char, item.langCode, onEnd);
          }
        });
        return;
      }
      // No audio ID mapping: fallback to Web Speech
      if (part === 'word') {
        this.speak(item.exampleWord, item.langCode, onEnd);
      } else {
        this.speak(item.char, item.langCode, onEnd);
      }
      return;
    }

    // Check if authentic Polish pre-recorded audio is available
    if (item.langCode === 'pl-PL' && item.id.startsWith('pl_')) {
      const url = `/audio/polish/${item.id}_${part}.mp3`;
      this.playAudioFile(url, onEnd);
      return;
    }

    // Check if authentic English pre-recorded audio is available
    if (item.langCode === 'en-US' && item.id.startsWith('en_')) {
      const url = `/audio/english/${item.id}_${part}.mp3`;
      this.playAudioFile(url, onEnd);
      return;
    }

    // Default Web Speech synthesis
    if (part === 'name') {
      this.speak(item.char, item.langCode, onEnd);
    } else if (part === 'sound') {
      const soundText = item.phonicsSpokenText || item.letterSound || item.char;
      this.speak(soundText, item.langCode, onEnd, 0.78);
    } else {
      this.speak(item.exampleWord, item.langCode, onEnd);
    }
  }

  /**
   * 3-Step Phonics Rhythm Chain:
   * 1. Letter Name  (e.g., "A", "be")
   * 2. Letter Sound (e.g., "/æ/ (ah)", "[b] (by)")
   * 3. Anchor Word  (e.g., "Apple", "Balon")
   */
  public speakPhonicsChain(
    item: CharacterItem,
    onStepChange?: (step: 'name' | 'sound' | 'word' | null) => void,
    onComplete?: () => void
  ) {
    this.cancel();

    // Polish: play authentic native pre-recorded sequence
    if (item.langCode === 'pl-PL' && item.id.startsWith('pl_')) {
      if (onStepChange) onStepChange('name');
      this.playAudioFile(`/audio/polish/${item.id}_name.mp3`, () => {
        this.activeChainTimeout = window.setTimeout(() => {
          if (onStepChange) onStepChange('sound');
          this.playAudioFile(`/audio/polish/${item.id}_sound.mp3`, () => {
            this.activeChainTimeout = window.setTimeout(() => {
              if (onStepChange) onStepChange('word');
              this.playAudioFile(`/audio/polish/${item.id}_word.mp3`, () => {
                if (onStepChange) onStepChange(null);
                if (onComplete) onComplete();
              });
            }, 350);
          });
        }, 400);
      });
      return;
    }

    // English: play authentic native pre-recorded sequence
    if (item.langCode === 'en-US' && item.id.startsWith('en_')) {
      if (onStepChange) onStepChange('name');
      this.playAudioFile(`/audio/english/${item.id}_name.mp3`, () => {
        this.activeChainTimeout = window.setTimeout(() => {
          if (onStepChange) onStepChange('sound');
          this.playAudioFile(`/audio/english/${item.id}_sound.mp3`, () => {
            this.activeChainTimeout = window.setTimeout(() => {
              if (onStepChange) onStepChange('word');
              this.playAudioFile(`/audio/english/${item.id}_word.mp3`, () => {
                if (onStepChange) onStepChange(null);
                if (onComplete) onComplete();
              });
            }, 350);
          });
        }, 400);
      });
      return;
    }

    // Japanese (Hiragana/Katakana): prefer pre-recorded MP3, fall back to Web Speech
    if (item.langCode.startsWith('ja')) {
      const audioId = this.resolveJapaneseAudioId(item.id);
      if (audioId) {
        if (onStepChange) onStepChange('name');
        this.playAudioFile(`/audio/japanese/${audioId}_name.mp3`, () => {
          this.activeChainTimeout = window.setTimeout(() => {
            if (onStepChange) onStepChange('word');
            this.playAudioFile(`/audio/japanese/${audioId}_word.mp3`, () => {
              if (onStepChange) onStepChange(null);
              if (onComplete) onComplete();
            });
          }, 350);
        });
      } else {
        // Fallback: Web Speech API for unknown IDs
        if (onStepChange) onStepChange('name');
        this.speak(item.char, item.langCode, () => {
          this.activeChainTimeout = window.setTimeout(() => {
            if (onStepChange) onStepChange('word');
            this.speak(item.exampleWord, item.langCode, () => {
              if (onStepChange) onStepChange(null);
              if (onComplete) onComplete();
            });
          }, 350);
        });
      }
      return;
    }
  }
}

export const speech = new SpeechEngine();
