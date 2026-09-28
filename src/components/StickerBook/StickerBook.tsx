import React, { useState, useRef } from 'react';
import type { UserProgress, PlacedSticker } from '../../types';
import { STICKER_LIST, BOARD_THEMES } from '../../data/stickers';
import type { BoardTheme } from '../../data/stickers';
import { StickerIcon } from '../Icons/StickerIcons';
import { sound } from '../../sound/audioEngine';
import { Sparkles, Trash2, ArrowLeft, Plus } from 'lucide-react';

interface StickerBookProps {
  progress: UserProgress;
  onBack: () => void;
  onUpdateStickers: (placed: PlacedSticker[], theme: UserProgress['currentBoardTheme']) => void;
}

export const StickerBook: React.FC<StickerBookProps> = ({
  progress,
  onBack,
  onUpdateStickers
}) => {
  const [currentThemeId, setCurrentThemeId] = useState<UserProgress['currentBoardTheme']>(
    progress.currentBoardTheme || 'forest'
  );
  const [placedList, setPlacedList] = useState<PlacedSticker[]>(progress.placedStickers || []);
  const [selectedStickerToPlace, setSelectedStickerToPlace] = useState<string | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);

  const currentTheme = BOARD_THEMES.find(t => t.id === currentThemeId) || BOARD_THEMES[0];

  // Earned stickers list
  const earnedStickerDefs = STICKER_LIST.filter(s => progress.earnedStickers.includes(s.id));

  // Change theme
  const handleSelectTheme = (themeId: UserProgress['currentBoardTheme']) => {
    sound.playTap();
    setCurrentThemeId(themeId);
    onUpdateStickers(placedList, themeId);
  };

  // Click on board to place selected sticker
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedStickerToPlace || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    const yPercent = Math.max(5, Math.min(95, (y / rect.height) * 100));

    const newPlaced: PlacedSticker = {
      instanceId: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      stickerId: selectedStickerToPlace,
      xPercent,
      yPercent,
      scale: 1,
      rotation: Math.floor(Math.random() * 20) - 10 // gentle -10 to +10 deg tilt
    };

    sound.playStickerPop();
    const updated = [...placedList, newPlaced];
    setPlacedList(updated);
    onUpdateStickers(updated, currentThemeId);
  };

  // Remove a placed sticker
  const handleRemoveSticker = (e: React.MouseEvent, instanceId: string) => {
    e.stopPropagation();
    sound.playTap();
    const updated = placedList.filter(s => s.instanceId !== instanceId);
    setPlacedList(updated);
    onUpdateStickers(updated, currentThemeId);
  };

  // Clear all stickers from board
  const handleClearBoard = () => {
    sound.playTap();
    setPlacedList([]);
    onUpdateStickers([], currentThemeId);
  };

  return (
    <div className="stickerbook-root">
      {/* Top Header */}
      <div className="stickerbook-header">
        <button id="btn-back-from-stickers" className="stickerbook-nav-btn" onClick={onBack}>
          <ArrowLeft size={20} strokeWidth={2.5} />
          <span>もどる</span>
        </button>

        <div className="stickerbook-title">
          <Sparkles size={20} color="#D99E1F" />
          <h1>
            <span className="stickerbook-title-desktop">ぼくの・わたしの シールちょう</span>
            <span className="stickerbook-title-mobile">シールちょう</span>
          </h1>
        </div>

        <button
          id="btn-clear-board"
          className="stickerbook-clear-btn"
          onClick={handleClearBoard}
          title="ぜんぶはずす"
        >
          <Trash2 size={18} strokeWidth={2.2} />
          <span>はずす</span>
        </button>
      </div>

      {/* Theme Selector Tabs */}
      <div className="theme-tabs-row">
        {BOARD_THEMES.map((theme: BoardTheme) => (
          <button
            key={theme.id}
            id={`btn-theme-${theme.id}`}
            className={`theme-tab-pill ${currentThemeId === theme.id ? 'active' : ''}`}
            onClick={() => handleSelectTheme(theme.id)}
          >
            <span>{theme.title}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Sticker Canvas Board */}
      <div className="sticker-board-container">
        <div
          ref={boardRef}
          id="sticker-board"
          className="sticker-board"
          style={{ background: currentTheme.bgGradient }}
          onClick={handleBoardClick}
        >
          {/* Ground decoration */}
          <div
            className="board-ground-layer"
            style={{ backgroundColor: currentTheme.groundColor }}
          />

          {/* Prompt if empty */}
          {placedList.length === 0 && (
            <div className="board-empty-hint">
              <Plus size={32} strokeWidth={2} />
              <p>したの シールを えらんで、ここを タップして はってね！</p>
            </div>
          )}

          {/* Placed Stickers on the board */}
          {placedList.map(item => {
            const def = STICKER_LIST.find(s => s.id === item.stickerId);
            if (!def) return null;

            return (
              <div
                key={item.instanceId}
                className="placed-sticker-wrapper"
                style={{
                  left: `${item.xPercent}%`,
                  top: `${item.yPercent}%`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="sticker-glow-badge">
                  <StickerIcon type={def.svgType} size={64} />
                  <button
                    className="btn-remove-individual-sticker"
                    onClick={e => handleRemoveSticker(e, item.instanceId)}
                    title="はがす"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticker Drawer Tray */}
      <div className="sticker-drawer">
        <div className="drawer-header">
          <span className="drawer-title">あつめた シール ({earnedStickerDefs.length} こ)</span>
          <span className="drawer-hint">すきなシールを タップしてから だいしを タッチ！</span>
        </div>

        <div className="drawer-stickers-list">
          {earnedStickerDefs.map(s => {
            const isSelected = selectedStickerToPlace === s.id;
            return (
              <button
                key={s.id}
                id={`drawer-sticker-${s.id}`}
                className={`drawer-sticker-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  sound.playTap();
                  setSelectedStickerToPlace(s.id);
                }}
              >
                <StickerIcon type={s.svgType} size={48} />
                <span className="drawer-sticker-name">{s.name}</span>
                {isSelected && <span className="selection-dot" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
