import React from 'react';
import { Home, Sparkles, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../../sound/audioEngine';

interface NavbarProps {
  currentView: 'home' | 'tracer' | 'quiz' | 'stickers';
  onNavigate: (view: 'home' | 'tracer' | 'quiz' | 'stickers') => void;
  onOpenSync: () => void;
  stickerCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSync,
  stickerCount,
  isMuted,
  onToggleMute
}) => {
  const handleHomeClick = () => {
    sound.playTap();
    onNavigate('home');
  };

  const handleStickersClick = () => {
    sound.playTap();
    onNavigate('stickers');
  };

  const handleSyncClick = () => {
    sound.playTap();
    onOpenSync();
  };

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {currentView !== 'home' ? (
          <button
            id="nav-home-btn"
            className="nav-btn nav-btn-home"
            onClick={handleHomeClick}
            aria-label="ホームへもどる"
          >
            <Home size={22} strokeWidth={2.2} />
            <span className="btn-label">もどる</span>
          </button>
        ) : (
          <div className="nav-logo">
            <span className="logo-dot logo-dot-terracotta" />
            <span className="logo-text">mojimoji</span>
            <span className="logo-sub">ことばの じかん</span>
          </div>
        )}

        <div className="nav-actions">
          {/* Sticker Book Button */}
          <button
            id="nav-stickers-btn"
            className={`nav-btn nav-btn-sticker ${currentView === 'stickers' ? 'active' : ''}`}
            onClick={handleStickersClick}
            aria-label="シールちょう"
          >
            <Sparkles size={20} strokeWidth={2.2} className="icon-sparkle" />
            <span className="btn-label">シールちょう</span>
            <span className="badge-count">{stickerCount}</span>
          </button>

          {/* Device Sync Button */}
          <button
            id="nav-sync-btn"
            className="nav-btn nav-btn-sync"
            onClick={handleSyncClick}
            aria-label="べつのスマホ・タブレットとつなぐ"
            title="合言葉で同期"
          >
            <RefreshCw size={19} strokeWidth={2.2} />
            <span className="btn-label-mobile-hide">つなぐ</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="nav-sound-toggle-btn"
            className="nav-btn nav-btn-icon-only"
            onClick={onToggleMute}
            aria-label={isMuted ? '音をならす' : '音をけす'}
          >
            {isMuted ? <VolumeX size={20} strokeWidth={2.2} /> : <Volume2 size={20} strokeWidth={2.2} />}
          </button>
        </div>
      </div>
    </header>
  );
};
