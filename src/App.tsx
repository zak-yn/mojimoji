import React, { useState, useEffect, useMemo } from 'react';
import type { LanguageType, UserProgress, PlacedSticker } from './types';
import { CHARACTER_SETS } from './data/characters';
import {
  loadLocalProgress,
  recordCharacterCompletion,
  recordTestPassed,
  savePlacedStickers,
  syncWithCloud
} from './services/storage';
import { sound } from './sound/audioEngine';
import { Navbar } from './components/Navigation/Navbar';
import { CategorySelector } from './components/Home/CategorySelector';
import { StrokeTracer } from './components/Tracer/StrokeTracer';
import { QuizMode } from './components/Quiz/QuizMode';
import { StickerBook } from './components/StickerBook/StickerBook';
import { SyncModal } from './components/SyncModal/SyncModal';

export const App: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>(loadLocalProgress());
  const [currentView, setCurrentView] = useState<'home' | 'tracer' | 'quiz' | 'stickers'>('home');
  const [selectedLang, setSelectedLang] = useState<LanguageType>('hiragana');
  const [orderMode, setOrderMode] = useState<'sequential' | 'random'>('sequential');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getIsMuted());

  // Check URL query parameters for ?sync=xxx (e.g. from camera QR code scan)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const syncParam = params.get('sync');
    if (syncParam) {
      syncWithCloud(syncParam, progress).then(updated => {
        setProgress(updated);
        // Clear query param cleanly without reload
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, []);

  // Listen to multi-tab local storage changes
  useEffect(() => {
    const handleStorageUpdate = () => {
      setProgress(loadLocalProgress());
    };
    window.addEventListener('mojimoji_progress_updated', handleStorageUpdate);
    return () => window.removeEventListener('mojimoji_progress_updated', handleStorageUpdate);
  }, []);

  // Characters list for current language based on order mode
  const activeCharacters = useMemo(() => {
    const set = CHARACTER_SETS[selectedLang];
    if (!set) return [];
    if (orderMode === 'random') {
      return [...set.characters].sort(() => 0.5 - Math.random());
    }
    return set.characters;
  }, [selectedLang, orderMode]);

  // Handle character completion
  const handleCharacterCompleted = (charId: string) => {
    const res = recordCharacterCompletion(charId);
    setProgress(loadLocalProgress());
    return res;
  };

  // Handle quiz passed
  const handlePassTest = (charId: string) => {
    const res = recordTestPassed(charId);
    setProgress(loadLocalProgress());
    return res;
  };

  // Handle sticker updates in book
  const handleUpdateStickers = (placed: PlacedSticker[], theme: UserProgress['currentBoardTheme']) => {
    savePlacedStickers(placed, theme);
    setProgress(loadLocalProgress());
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    sound.setMuted(next);
    setIsMuted(next);
  };

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={view => setCurrentView(view)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        stickerCount={progress.earnedStickers.length}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {currentView === 'home' && (
          <CategorySelector
            progress={progress}
            orderMode={orderMode}
            onToggleOrderMode={setOrderMode}
            onSelectCategory={lang => {
              setSelectedLang(lang);
              setCurrentView('tracer');
            }}
            onStartQuiz={lang => {
              setSelectedLang(lang);
              setCurrentView('quiz');
            }}
          />
        )}

        {currentView === 'tracer' && (
          <StrokeTracer
            characters={activeCharacters}
            initialIndex={0}
            onBack={() => setCurrentView('home')}
            onCharacterCompleted={handleCharacterCompleted}
          />
        )}

        {currentView === 'quiz' && (
          <QuizMode
            characters={CHARACTER_SETS[selectedLang].characters}
            langType={selectedLang}
            onBack={() => setCurrentView('home')}
            onPassTest={handlePassTest}
            onGoToStickers={() => setCurrentView('stickers')}
          />
        )}

        {currentView === 'stickers' && (
          <StickerBook
            progress={progress}
            onBack={() => setCurrentView('home')}
            onUpdateStickers={handleUpdateStickers}
          />
        )}
      </main>

      {/* Sync Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        progress={progress}
        onProgressSynced={updated => setProgress(updated)}
      />
    </div>
  );
};

export default App;
