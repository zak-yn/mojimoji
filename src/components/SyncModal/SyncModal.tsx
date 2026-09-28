import React, { useState, useEffect } from 'react';
import type { UserProgress } from '../../types';
import { syncWithCloud } from '../../services/storage';
import { sound } from '../../sound/audioEngine';
import QRCode from 'qrcode';
import { X, QrCode, KeyRound, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onProgressSynced: (updated: UserProgress) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  progress,
  onProgressSynced
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Generate QR code for pairing
  useEffect(() => {
    if (isOpen && progress.familyCode) {
      const syncUrl = `${window.location.origin}${window.location.pathname}?sync=${encodeURIComponent(
        progress.familyCode
      )}`;
      QRCode.toDataURL(syncUrl, {
        width: 220,
        margin: 1,
        color: {
          dark: '#2D3748',
          light: '#FFFFFF'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [isOpen, progress.familyCode]);

  if (!isOpen) return null;

  // Handle manual code entry
  const handleConnectWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    sound.playTap();
    setIsSyncing(true);
    setSyncStatusMsg(null);

    try {
      const result = await syncWithCloud(inputCode.trim(), progress);
      onProgressSynced(result);
      sound.playSuccess();
      setSyncStatusMsg('同期が かんりょうしました！');
      setTimeout(() => {
        setSyncStatusMsg(null);
        onClose();
      }, 1500);
    } catch {
      setSyncStatusMsg('同期に しっぱいしました。もういちど たしかめてね。');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sync-modal-card" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Smartphone size={24} color="#D96B43" strokeWidth={2.2} />
            <h2>べつの スマホ・iPadと つなぐ</h2>
          </div>
          <button id="btn-close-sync-modal" className="modal-close-btn" onClick={onClose}>
            <X size={20} strokeWidth={2.2} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-instructions">
            おうちの iPad や お父さん・お母さんの スマホで、おなじ シールや文字のきろくを つづけられます！
          </p>

          {/* Section 1: This Device's Passcode & QR */}
          <div className="sync-passcode-box">
            <span className="box-section-title">
              <KeyRound size={18} />
              <span>この たんまつの「あいことば」</span>
            </span>
            <div className="passcode-display-pill">
              <span className="passcode-code">{progress.familyCode}</span>
            </div>
            <p className="passcode-note">べつの スマホに この「あいことば」を いれると つながります</p>

            {qrDataUrl && (
              <div className="qr-container">
                <div className="qr-box">
                  <img src={qrDataUrl} alt="同期用QRコード" className="qr-image" />
                </div>
                <span className="qr-caption">
                  <QrCode size={16} />
                  <span>カメラで よみとるだけでも OK</span>
                </span>
              </div>
            )}
          </div>

          <div className="modal-divider">または</div>

          {/* Section 2: Enter other device's code */}
          <form className="sync-input-form" onSubmit={handleConnectWithCode}>
            <label htmlFor="sync-code-input" className="input-label">
              すでにある「あいことば」を いれて つなぐ:
            </label>
            <div className="input-button-row">
              <input
                id="sync-code-input"
                type="text"
                placeholder="例: きりん-77"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                className="sync-text-input"
              />
              <button
                id="btn-submit-sync-code"
                type="submit"
                className="btn-sync-submit"
                disabled={isSyncing || !inputCode.trim()}
              >
                {isSyncing ? <RefreshCw size={18} className="spin-icon" /> : <CheckCircle size={18} />}
                <span>つなぐ</span>
              </button>
            </div>
          </form>

          {syncStatusMsg && <div className="sync-status-toast">{syncStatusMsg}</div>}
        </div>
      </div>
    </div>
  );
};
