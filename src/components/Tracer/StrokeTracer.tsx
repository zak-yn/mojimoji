import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CharacterItem, StrokeData } from '../../types';
import { sound } from '../../sound/audioEngine';
import { speech } from '../../speech/tts';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Volume2, VolumeX, ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface StrokeTracerProps {
  characters: CharacterItem[];
  initialIndex: number;
  onBack: () => void;
  onCharacterCompleted: (charId: string) => { isNew: boolean; newSticker?: string };
  isMuted?: boolean;
  onToggleMute?: () => void;
}

function getStrokeStartPoint(d: string): { x: number; y: number } | null {
  const match = /^[Mm]\s*([0-9.]+)[,\s]+([0-9.]+)/.exec(d.trim());
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }
  return null;
}

/**
 * Validates whether user touch points adequately trace the target SVG stroke path.
 * Designed with a forgiving tolerance tailored for 6-year-old motor skills.
 */
function validateStrokeTrace(
  userPoints: { x: number; y: number }[],
  targetPathD: string,
  canvasRect: DOMRect
): { isValid: boolean; coverage: number; reason?: 'too_short' | 'wrong_start' | 'wrong_direction' | 'coverage_low' } {
  if (userPoints.length < 3) {
    return { isValid: false, coverage: 0, reason: 'too_short' };
  }

  // Create SVG path element for exact mathematical sampling
  const svgNS = 'http://www.w3.org/2000/svg';
  const pathEl = document.createElementNS(svgNS, 'path');
  pathEl.setAttribute('d', targetPathD);
  const totalPathLen = pathEl.getTotalLength();

  // If path length is tiny (e.g., small accent dot)
  if (totalPathLen <= 4) {
    return { isValid: true, coverage: 1.0 };
  }

  // Convert user canvas points to SVG 109x109 viewBox space
  const scaleX = 109 / (canvasRect.width || 1);
  const scaleY = 109 / (canvasRect.height || 1);
  const normalizedUserPts = userPoints.map(p => ({
    x: p.x * scaleX,
    y: p.y * scaleY
  }));

  // Calculate total drawn distance by user
  let userDrawnDist = 0;
  for (let i = 1; i < normalizedUserPts.length; i++) {
    const dx = normalizedUserPts[i].x - normalizedUserPts[i - 1].x;
    const dy = normalizedUserPts[i].y - normalizedUserPts[i - 1].y;
    userDrawnDist += Math.sqrt(dx * dx + dy * dy);
  }

  // If drawn path is under 40% of target length, it's a tap or scribble
  if (userDrawnDist < totalPathLen * 0.40) {
    return { isValid: false, coverage: userDrawnDist / totalPathLen, reason: 'too_short' };
  }

  // --- Start-Point Check ---
  // Child must begin drawing within START_TOLERANCE units of stroke's first point
  const strokeStart = pathEl.getPointAtLength(0);
  const firstUserPt = normalizedUserPts[0];
  const START_TOLERANCE_SQ = 32.0 * 32.0; // ~32 SVG units ≈ ~90px on tablet
  const startDx = firstUserPt.x - strokeStart.x;
  const startDy = firstUserPt.y - strokeStart.y;
  const startDistSq = startDx * startDx + startDy * startDy;
  if (startDistSq > START_TOLERANCE_SQ) {
    return { isValid: false, coverage: 0, reason: 'wrong_start' };
  }

  // --- Directional Agreement Check ---
  // The overall vector of user drawing must roughly agree with stroke direction
  const strokeEnd = pathEl.getPointAtLength(totalPathLen);
  const lastUserPt = normalizedUserPts[normalizedUserPts.length - 1];
  const targetDirX = strokeEnd.x - strokeStart.x;
  const targetDirY = strokeEnd.y - strokeStart.y;
  const userDirX = lastUserPt.x - firstUserPt.x;
  const userDirY = lastUserPt.y - firstUserPt.y;
  // Only apply directional check when stroke has significant linear component (not a circle/curve)
  const targetLinearDist = Math.sqrt(targetDirX * targetDirX + targetDirY * targetDirY);
  if (targetLinearDist > 20) {
    const dotProduct = targetDirX * userDirX + targetDirY * userDirY;
    // Dot product negative = opposite direction → fail
    if (dotProduct < 0) {
      return { isValid: false, coverage: 0, reason: 'wrong_direction' };
    }
  }

  // --- Coverage Sampling ---
  const numSamples = Math.max(10, Math.min(26, Math.floor(totalPathLen / 4)));
  let coveredCount = 0;
  // Forgiving tolerance radius in 109-space (~20 units corresponds to ~60px on tablet/phone)
  const TOLERANCE_SQ = 20.0 * 20.0;

  for (let i = 0; i <= numSamples; i++) {
    const targetPt = pathEl.getPointAtLength((i / numSamples) * totalPathLen);
    let isNear = false;
    for (const up of normalizedUserPts) {
      const dx = up.x - targetPt.x;
      const dy = up.y - targetPt.y;
      if (dx * dx + dy * dy <= TOLERANCE_SQ) {
        isNear = true;
        break;
      }
    }
    if (isNear) {
      coveredCount++;
    }
  }

  const coverage = coveredCount / (numSamples + 1);
  // Pass if at least 55% of the target stroke path has nearby touches and minimum distance drawn
  const isValid = coverage >= 0.55 && userDrawnDist >= totalPathLen * 0.40;

  return { isValid, coverage, reason: isValid ? undefined : 'coverage_low' };
}

export const StrokeTracer: React.FC<StrokeTracerProps> = ({
  characters,
  initialIndex,
  onBack,
  onCharacterCompleted,
  isMuted = false,
  onToggleMute
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentChar = characters[currentIndex];

  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedStrokeIndex, setAnimatedStrokeIndex] = useState<number>(-1);
  const [userStrokeIndex, setUserStrokeIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);
  const [activePhonicsStep, setActivePhonicsStep] = useState<'name' | 'sound' | 'word' | null>(null);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [guidanceHint, setGuidanceHint] = useState<string | null>(null);
  const [isAudioFinished, setIsAudioFinished] = useState<boolean>(false);
  const audioFinishedSafetyTimerRef = useRef<number | null>(null);

  // Play full 3-step phonics rhythm (Name -> Sound -> Word)
  const playPhonicsChain = useCallback((onComplete?: () => void) => {
    if (!currentChar) {
      if (onComplete) onComplete();
      return;
    }
    speech.speakPhonicsChain(
      currentChar,
      step => setActivePhonicsStep(step),
      () => {
        if (onComplete) onComplete();
      }
    );
  }, [currentChar]);

  // Play an individual part of phonics
  const handlePlayPhonicsPart = (part: 'name' | 'sound' | 'word') => {
    sound.playTap();
    setActivePhonicsStep(part);
    speech.speakPart(currentChar, part, () => setActivePhonicsStep(null));
  };

  const animationTimerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const userStrokeIndexRef = useRef<number>(0);
  const userPathsRef = useRef<{ x: number; y: number }[][]>([]);
  const hasDrawnRef = useRef<boolean>(false);

  // Stop any active stroke animation
  const stopAnimation = useCallback(() => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    setIsAnimating(false);
    setAnimatedStrokeIndex(-1);
  }, []);

  // Play stroke order demo once
  const playStrokeAnimation = useCallback(() => {
    stopAnimation();
    if (!currentChar) return;

    setIsAnimating(true);
    setAnimatedStrokeIndex(0);
    sound.playStroke(0);

    let idx = 0;
    const totalStrokes = currentChar.strokes.length;

    animationTimerRef.current = window.setInterval(() => {
      idx += 1;
      if (idx < totalStrokes) {
        setAnimatedStrokeIndex(idx);
        sound.playStroke(idx);
      } else {
        stopAnimation();
      }
    }, 850);
  }, [currentChar, stopAnimation]);

  // Canvas size and context configuration
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  // Reset drawing canvas
  const resetCanvas = useCallback(() => {
    stopAnimation();
    if (audioFinishedSafetyTimerRef.current) {
      clearTimeout(audioFinishedSafetyTimerRef.current);
      audioFinishedSafetyTimerRef.current = null;
    }
    setIsAudioFinished(false);
    userStrokeIndexRef.current = 0;
    setUserStrokeIndex(0);
    setIsCompleted(false);
    setCelebrationBanner(null);
    setHasDrawn(false);
    hasDrawnRef.current = false;
    userPathsRef.current = [];
    setGuidanceHint(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setupCanvas();
  }, [stopAnimation, setupCanvas]);

  // Completion trigger helper
  const triggerCompletion = useCallback(() => {
    if (isCompleted) return;
    setIsCompleted(true);
    setIsAudioFinished(false);
    sound.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    if (audioFinishedSafetyTimerRef.current) {
      clearTimeout(audioFinishedSafetyTimerRef.current);
    }
    // Safety fallback: unlock button after 8s max in case audio fails or device hangs
    audioFinishedSafetyTimerRef.current = window.setTimeout(() => {
      setIsAudioFinished(true);
      audioFinishedSafetyTimerRef.current = null;
    }, 8000);

    setTimeout(() => {
      playPhonicsChain(() => {
        if (audioFinishedSafetyTimerRef.current) {
          clearTimeout(audioFinishedSafetyTimerRef.current);
          audioFinishedSafetyTimerRef.current = null;
        }
        setIsAudioFinished(true);
      });
    }, 400);

    const result = onCharacterCompleted(currentChar.id);
    if (result.newSticker) {
      setCelebrationBanner('シールを ゲットしたよ！');
    } else if (currentIndex === characters.length - 1) {
      setCelebrationBanner('さいごまで ぜんぶ かけたね！');
    } else {
      setCelebrationBanner('じょうずに かけたね！');
    }
  }, [isCompleted, currentChar, onCharacterCompleted, playPhonicsChain, currentIndex, characters.length]);

  // Initial load effect for a character (runs ONLY when currentIndex changes)
  useEffect(() => {
    resetCanvas();
    speech.cancel();

    // Small delay to prevent double-firing in React StrictMode dev environment
    const phonicsTimer = setTimeout(() => {
      playPhonicsChain();
    }, 80);

    const animTimer = setTimeout(() => {
      playStrokeAnimation();
    }, 580);

    return () => {
      if (audioFinishedSafetyTimerRef.current) {
        clearTimeout(audioFinishedSafetyTimerRef.current);
        audioFinishedSafetyTimerRef.current = null;
      }
      clearTimeout(phonicsTimer);
      clearTimeout(animTimer);
      stopAnimation();
      speech.cancel();
    };
  }, [currentIndex]); // STRICT DEPENDENCY: Only on currentIndex change

  // Window resize observer for canvas
  useEffect(() => {
    setupCanvas();
    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  // Pointer drawing handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isCompleted) return;

    // Immediately interrupt animation if child touches the canvas
    if (isAnimating) {
      stopAnimation();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}
    isDrawingRef.current = true;
    hasDrawnRef.current = true;
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentOrder = userStrokeIndexRef.current;
    userPathsRef.current[currentOrder] = [{ x, y }];
    sound.playStroke(currentOrder);

    // Immediate initial dot
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#D96B43';
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#D96B43';
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentOrder = userStrokeIndexRef.current;
    const currentStroke = userPathsRef.current[currentOrder] || [];
    currentStroke.push({ x, y });
    userPathsRef.current[currentOrder] = currentStroke;

    // Draw on canvas
    const ctx = canvas.getContext('2d');
    if (ctx && currentStroke.length > 1) {
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#D96B43'; // warm terracotta crayon
      ctx.beginPath();
      const prev = currentStroke[currentStroke.length - 2];
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const currentOrder = userStrokeIndexRef.current;
    const currentTargetStroke = currentChar?.strokes[currentOrder];
    const currentDrawnPath = userPathsRef.current[currentOrder] || [];
    const canvas = canvasRef.current;

    if (canvas && currentTargetStroke) {
      const rect = canvas.getBoundingClientRect();
      const { isValid, reason } = validateStrokeTrace(currentDrawnPath, currentTargetStroke.d, rect);

      if (isValid) {
        sound.playStroke(currentOrder);
        const nextIndex = currentOrder + 1;
        userStrokeIndexRef.current = nextIndex;
        setUserStrokeIndex(nextIndex);
        setGuidanceHint(null);

        // If all strokes drawn according to stroke count
        if (nextIndex >= currentChar.strokes.length) {
          triggerCompletion();
        }
      } else {
        // Child drew but didn't trace the target stroke adequately
        if (currentDrawnPath.length > 4) {
          let hint = `${currentOrder + 1}ばんの せんを なぞってみよう！`;
          if (reason === 'wrong_start') {
            hint = `${currentOrder + 1}ばんは ● からはじめよう！`;
          } else if (reason === 'wrong_direction') {
            hint = `${currentOrder + 1}ばんは → むきに かいてみよう！`;
          } else if (reason === 'too_short') {
            hint = `もうすこし おおきく かいてみよう！`;
          }
          setGuidanceHint(hint);
          window.setTimeout(() => setGuidanceHint(null), 2800);
        }
      }
    }
  };

  // Manual completion (Child taps "できた！")
  const handleManualComplete = () => {
    sound.playTap();
    triggerCompletion();
  };

  const isLastChar = currentIndex === characters.length - 1;

  // Navigate to previous / next character (or finish practice if at the last character)
  const handlePrev = () => {
    sound.playTap();
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (isLastChar) {
      sound.playSuccess();
      onBack();
    } else {
      sound.playTap();
      setCurrentIndex(prev => Math.min(characters.length - 1, prev + 1));
    }
  };

  const isNumber = currentChar.id.startsWith('num_');

  return (
    <div className="tracer-root">
      {/* Top action header */}
      <div className="tracer-header">
        <button id="btn-back-categories" className="tracer-sub-btn" onClick={onBack}>
          <ArrowLeft size={20} strokeWidth={2.5} />
          <span>もどる</span>
        </button>

        <div className="char-badge-info">
          <span className="char-position">
            {currentIndex + 1} / {characters.length}
          </span>
          <span className="char-phonetic">{currentChar.romajiOrPhonetic}</span>
        </div>

        <div className="tracer-header-actions">
          <button
            id="btn-repeat-speech"
            className="tracer-icon-btn"
            onClick={() => {
              sound.playTap();
              playPhonicsChain();
            }}
            title={isNumber ? "3つのことば（日・英・波）できく" : "3拍子の発音をきく"}
          >
            <Volume2 size={19} strokeWidth={2.2} />
          </button>

          <button
            id="btn-play-animation"
            className="tracer-icon-btn"
            onClick={() => {
              sound.playTap();
              playStrokeAnimation();
            }}
            title="書き順アニメーション"
          >
            <Play size={19} strokeWidth={2.2} />
          </button>

          <button
            id="btn-clear-canvas"
            className="tracer-icon-btn"
            onClick={() => {
              sound.playTap();
              resetCanvas();
            }}
            title="もういちど書く"
          >
            <RotateCcw size={19} strokeWidth={2.2} />
          </button>

          {onToggleMute && (
            <button
              id="btn-tracer-mute-toggle"
              className="tracer-icon-btn"
              onClick={onToggleMute}
              title={isMuted ? '音をならす' : '音をけす'}
            >
              {isMuted ? <VolumeX size={19} strokeWidth={2.2} /> : <Volume2 size={19} strokeWidth={2.2} />}
            </button>
          )}
        </div>
      </div>

      {/* Multilingual / Phonics Explorer Strip */}
      {isNumber ? (
        <div className="phonics-chain-strip">
          <button
            id="btn-number-ja"
            className={`phonics-pill ${activePhonicsStep === 'name' ? 'active-step' : ''}`}
            onClick={() => handlePlayPhonicsPart('name')}
            title="日本語のよみかた"
          >
            <span className="phonics-pill-tag">① にほんご</span>
            <strong className="phonics-pill-val">{currentChar.numberReadings?.ja || currentChar.letterName}</strong>
          </button>

          <button
            id="btn-number-en"
            className={`phonics-pill phonics-pill-sound ${activePhonicsStep === 'sound' ? 'active-step' : ''}`}
            onClick={() => handlePlayPhonicsPart('sound')}
            title="英語のよみかた"
          >
            <span className="phonics-pill-tag">② English</span>
            <strong className="phonics-pill-val">{currentChar.numberReadings?.en || 'one'}</strong>
          </button>

          <button
            id="btn-number-pl"
            className={`phonics-pill phonics-pill-word ${activePhonicsStep === 'word' ? 'active-step' : ''}`}
            onClick={() => handlePlayPhonicsPart('word')}
            title="ポーランド語のよみかた"
          >
            <span className="phonics-pill-tag">③ Polski</span>
            <strong className="phonics-pill-val">{currentChar.numberReadings?.pl || 'jeden'}</strong>
          </button>
        </div>
      ) : (
        <div className="phonics-chain-strip">
          <button
            id="btn-phonics-name"
            className={`phonics-pill ${activePhonicsStep === 'name' ? 'active-step' : ''}`}
            onClick={() => handlePlayPhonicsPart('name')}
            title="文字のなまえ"
          >
            <span className="phonics-pill-tag">① なまえ</span>
            <strong className="phonics-pill-val">{currentChar.letterName || currentChar.char}</strong>
          </button>

          {!currentChar.langCode.startsWith('ja') && (
            <button
              id="btn-phonics-sound"
              className={`phonics-pill phonics-pill-sound ${activePhonicsStep === 'sound' ? 'active-step' : ''}`}
              onClick={() => handlePlayPhonicsPart('sound')}
              title="文字の音 (耳できこう)"
            >
              <span className="phonics-pill-tag">② おと</span>
              <strong className="phonics-pill-val">{currentChar.letterSound || currentChar.char}</strong>
            </button>
          )}

          <button
            id="btn-phonics-word"
            className={`phonics-pill phonics-pill-word ${activePhonicsStep === 'word' ? 'active-step' : ''}`}
            onClick={() => handlePlayPhonicsPart('word')}
            title="使われている単語"
          >
            <span className="phonics-pill-tag">
              {currentChar.langCode.startsWith('ja') ? '② ことば' : '③ ことば'}
            </span>
            <strong className="phonics-pill-val">
              {currentChar.exampleWord}
              {currentChar.exampleTranslation && !currentChar.langCode.startsWith('ja') && (
                <span className="phonics-pill-trans"> ({currentChar.exampleTranslation})</span>
              )}
            </strong>
          </button>
        </div>
      )}

      {/* Main Tracing Stage */}
      <div className="tracer-stage-wrapper">
        <div className="tracer-stage">
          {/* Subtle Grid guides for 6yo child (crosshair reference) */}
          <div className="grid-crosshair" />

          {/* Background SVG Model with Stroke Order Animation & Numbered Start Badges */}
          <svg
            className="character-svg-model"
            viewBox="0 0 109 109"
            preserveAspectRatio="xMidYMid meet"
          >
            {currentChar.strokes.map((stroke: StrokeData, sIdx: number) => {
              const isCurrentlyPlaying = isAnimating && animatedStrokeIndex === sIdx;
              const hasBeenPlayed = isAnimating && animatedStrokeIndex > sIdx;
              const pt = getStrokeStartPoint(stroke.d);

              return (
                <g key={`stroke-${sIdx}`}>
                  {/* Subtle guide background trace */}
                  <path
                    d={stroke.d}
                    fill="none"
                    stroke="#E6E0D8"
                    strokeWidth="8.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Highlight animated stroke */}
                  {isCurrentlyPlaying && (
                    <path
                      pathLength={1}
                      d={stroke.d}
                      fill="none"
                      stroke="#5A826D"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="anim-stroke"
                    />
                  )}

                  {/* Fully displayed stroke during animation demo */}
                  {hasBeenPlayed && (
                    <path
                      d={stroke.d}
                      fill="none"
                      stroke="#8EAF9D"
                      strokeWidth="8.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Numbered Start Badge on the stroke's initial point */}
                  {pt && (() => {
                    const isCurrent = userStrokeIndex === sIdx;
                    const isPast = userStrokeIndex > sIdx;

                    if (isPast) {
                      return (
                        <circle
                          key={`pt-${sIdx}`}
                          cx={pt.x}
                          cy={pt.y}
                          r="2.8"
                          fill="#5A826D"
                          opacity="0.6"
                        />
                      );
                    }

                    if (isCurrent) {
                      return (
                        <g key={`pt-${sIdx}`} className="stroke-start-marker stroke-marker-active">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="8.5"
                            fill="none"
                            stroke="#D96B43"
                            strokeWidth="1.2"
                            className="marker-pulse-ring"
                          />
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="5.5"
                            fill="#D96B43"
                            stroke="#FFFFFF"
                            strokeWidth="1.4"
                          />
                          <text
                            x={pt.x}
                            y={pt.y + 1.9}
                            textAnchor="middle"
                            fontSize="5"
                            fontWeight="800"
                            fill="#FFFFFF"
                          >
                            {sIdx + 1}
                          </text>
                        </g>
                      );
                    }

                    // Future stroke: check if it overlaps with current stroke
                    const currentStroke = currentChar.strokes[userStrokeIndex];
                    const currentPt = currentStroke ? getStrokeStartPoint(currentStroke.d) : null;
                    const isOverlappingCurrent = currentPt && Math.hypot(pt.x - currentPt.x, pt.y - currentPt.y) < 14;

                    if (isOverlappingCurrent) {
                      return null;
                    }

                    return (
                      <g key={`pt-${sIdx}`} className="stroke-start-marker stroke-marker-future">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4.2"
                          fill="#FAF8F5"
                          stroke="#8EAF9D"
                          strokeWidth="1.2"
                        />
                        <text
                          x={pt.x}
                          y={pt.y + 1.5}
                          textAnchor="middle"
                          fontSize="4"
                          fontWeight="700"
                          fill="#5A826D"
                        >
                          {sIdx + 1}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </svg>

          {/* Interactive Touch/Mouse Canvas for Free Tracing */}
          <canvas
            ref={canvasRef}
            id="tracer-canvas"
            className="tracer-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />

          {/* Gentle interactive guidance hint for child */}
          {guidanceHint && (
            <div id="tracer-guidance-pill" className="tracer-guidance-pill">
              {guidanceHint}
            </div>
          )}

          {/* Success Overlay with Celebration */}
          {isCompleted && (
            <div className="success-overlay">
              <div className="success-modal">
                <CheckCircle2 size={54} color="#5A826D" strokeWidth={2.5} />
                <h3 className="success-text">{celebrationBanner}</h3>
                <div className="completed-char-display">{currentChar.char}</div>
                <p className="example-word-badge">
                  {isNumber && currentChar.numberReadings ? (
                    `日: ${currentChar.numberReadings.ja}  •  英: ${currentChar.numberReadings.en}  •  波: ${currentChar.numberReadings.pl}`
                  ) : (
                    `${currentChar.exampleWord} ${currentChar.exampleTranslation ? `(${currentChar.exampleTranslation})` : ''}`
                  )}
                </p>

                <div className="success-modal-buttons">
                  <button
                    id="btn-next-after-complete"
                    className={`modal-next-btn ${isLastChar ? 'modal-finish-btn' : ''} ${!isAudioFinished ? 'waiting' : 'ready'}`}
                    onClick={handleNext}
                    disabled={!isAudioFinished}
                  >
                    <span>
                      {!isAudioFinished
                        ? 'おとを きいてね...'
                        : isLastChar
                        ? 'れんしゅうを おわる'
                        : 'つぎの もじへ'}
                    </span>
                    {!isAudioFinished ? (
                      <Volume2 size={20} className="modal-audio-pulse" strokeWidth={2.5} />
                    ) : isLastChar ? (
                      <Sparkles size={20} strokeWidth={2.5} />
                    ) : (
                      <ArrowRight size={20} strokeWidth={2.5} />
                    )}
                  </button>
                  <button
                    id="btn-retry-after-complete"
                    className="modal-retry-btn"
                    onClick={resetCanvas}
                  >
                    <span>もう一回かく</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stroke Progress & Child-Friendly "できた！" Action Controls */}
      <div className="tracer-stroke-dock">
        <div className="stroke-count-indicator">
          <span className="stroke-count-label">かくすう: {currentChar.strokes.length}かく</span>
          <div className="stroke-count-pills">
            {currentChar.strokes.map((_, idx) => (
              <span
                key={`pill-${idx}`}
                className={`stroke-dot-pill ${userStrokeIndex > idx ? 'done' : userStrokeIndex === idx ? 'current' : ''}`}
              >
                {idx + 1}
              </span>
            ))}
          </div>
        </div>

        {/* できた！ (Done!) Action Button */}
        <button
          id="btn-finish-drawing"
          className={`btn-finish-drawing ${hasDrawn ? 'active' : 'disabled'}`}
          onClick={handleManualComplete}
          disabled={!hasDrawn || isCompleted}
          title="かけたよ！"
        >
          <Sparkles size={20} strokeWidth={2.5} />
          <span>できた！</span>
        </button>
      </div>

      {/* Bottom navigation */}
      <div className="tracer-bottom-nav">
        <button
          id="btn-prev-char"
          className="nav-page-btn"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          <span className="nav-btn-label-desktop">まえの もじ</span>
          <span className="nav-btn-label-mobile">まえ</span>
        </button>

        {isNumber ? (
          <div className="tracer-number-strip">
            <span className="num-chip-item">
              <span className="num-chip-label">日</span>
              <strong className="num-chip-val">{currentChar.numberReadings?.ja || currentChar.letterName}</strong>
            </span>
            <span className="num-chip-sep">•</span>
            <span className="num-chip-item">
              <span className="num-chip-label">英</span>
              <strong className="num-chip-val">{currentChar.numberReadings?.en || 'one'}</strong>
            </span>
            <span className="num-chip-sep">•</span>
            <span className="num-chip-item">
              <span className="num-chip-label">波</span>
              <strong className="num-chip-val">{currentChar.numberReadings?.pl || 'jeden'}</strong>
            </span>
          </div>
        ) : (
          <div className="tracer-example-word">
            <span className="word-label">ことば:</span>
            <strong className="word-text">{currentChar.exampleWord}</strong>
          </div>
        )}

        <button
          id="btn-next-char"
          className={`nav-page-btn nav-page-btn-next ${isLastChar ? 'nav-page-btn-finish' : ''}`}
          onClick={handleNext}
          title={isLastChar ? 'れんしゅうをおわる' : 'つぎのもじへ'}
        >
          <span className="nav-btn-label-desktop">{isLastChar ? 'おわる' : 'つぎの もじ'}</span>
          <span className="nav-btn-label-mobile">{isLastChar ? 'おわる' : 'つぎ'}</span>
          {isLastChar ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <ArrowRight size={18} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
};
