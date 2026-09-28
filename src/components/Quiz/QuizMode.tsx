import React, { useState, useEffect, useCallback } from 'react';
import type { CharacterItem, LanguageType } from '../../types';
import { sound } from '../../sound/audioEngine';
import { speech } from '../../speech/tts';
import { StickerIcon } from '../Icons/StickerIcons';
import { STICKER_LIST } from '../../data/stickers';
import confetti from 'canvas-confetti';
import { Volume2, Award, ArrowLeft, ArrowRight, Check, X } from 'lucide-react';

interface QuizModeProps {
  characters: CharacterItem[];
  langType: LanguageType;
  onBack: () => void;
  onPassTest: (charId: string) => { earnedSticker?: string };
  onGoToStickers: () => void;
}

interface Question {
  target: CharacterItem;
  options: CharacterItem[];
}

export const QuizMode: React.FC<QuizModeProps> = ({
  characters,
  onBack,
  onPassTest,
  onGoToStickers
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);
  const [newlyEarnedSticker, setNewlyEarnedSticker] = useState<string | null>(null);

  // Generate 5 questions randomly
  useEffect(() => {
    if (characters.length < 3) return;

    const shuffledChars = [...characters].sort(() => 0.5 - Math.random());
    const generated: Question[] = [];

    const numQuestions = Math.min(5, shuffledChars.length);
    for (let i = 0; i < numQuestions; i++) {
      const target = shuffledChars[i];
      // Pick 2 distractor characters
      const distractors = characters
        .filter(c => c.id !== target.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      const options = [target, ...distractors].sort(() => 0.5 - Math.random());
      generated.push({ target, options });
    }

    setQuestions(generated);
    setCurrentStep(0);
    setScore(0);
    setIsQuizComplete(false);
    setNewlyEarnedSticker(null);
  }, [characters]);

  const currentQ = questions[currentStep];

  // Play target sound
  const playTargetSound = useCallback(() => {
    if (!currentQ) return;
    speech.speakPart(currentQ.target, 'name');
  }, [currentQ]);

  // Auto play voice when step changes
  useEffect(() => {
    if (!isQuizComplete && currentQ) {
      setIsAnswered(false);
      setSelectedCharId(null);
      const timer = setTimeout(() => {
        playTargetSound();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStep, currentQ, isQuizComplete, playTargetSound]);

  const handleSelectOption = (option: CharacterItem) => {
    if (isAnswered || !currentQ) return;

    sound.playTap();
    setSelectedCharId(option.id);
    setIsAnswered(true);

    const correct = option.id === currentQ.target.id;

    if (correct) {
      sound.playSuccess();
      setScore(prev => prev + 1);

      // Record pass & reward sticker
      const reward = onPassTest(currentQ.target.id);
      if (reward.earnedSticker) {
        setNewlyEarnedSticker(reward.earnedSticker);
      }
    } else {
      sound.playStroke(1);
    }
  };

  const handleNextQuestion = () => {
    sound.playTap();
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsQuizComplete(true);
      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 }
      });
    }
  };

  if (!currentQ && !isQuizComplete) {
    return <div className="quiz-loading">もんだいを じゅんび中...</div>;
  }

  // Quiz summary screen
  if (isQuizComplete) {
    const earnedStickerDef = newlyEarnedSticker
      ? STICKER_LIST.find(s => s.id === newlyEarnedSticker)
      : null;

    return (
      <div className="quiz-result-root">
        <div className="result-card">
          <Award size={64} color="#D99E1F" strokeWidth={2.2} />
          <h2 className="result-title">テスト おしまい！</h2>
          <p className="result-score">
            {score} / {questions.length} もん せいかい！
          </p>

          {earnedStickerDef ? (
            <div className="result-new-sticker">
              <span className="sticker-sparkle-label">あたらしい シールを ゲット！</span>
              <div className="sticker-preview-box">
                <StickerIcon type={earnedStickerDef.svgType} size={72} />
                <span className="sticker-name">{earnedStickerDef.name}</span>
              </div>
            </div>
          ) : (
            <p className="result-encourage">よくがんばったね！ はなまる！</p>
          )}

          <div className="result-actions">
            <button id="btn-see-stickers" className="btn-see-stickers" onClick={onGoToStickers}>
              <span>シールちょうを みる</span>
            </button>
            <button id="btn-finish-quiz" className="btn-finish-quiz" onClick={onBack}>
              <span>カテゴリへ もどる</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-root">
      {/* Quiz Top bar */}
      <div className="quiz-header">
        <button id="btn-quit-quiz" className="quiz-back-btn" onClick={onBack}>
          <ArrowLeft size={20} strokeWidth={2.5} />
          <span>やめる</span>
        </button>

        <div className="quiz-progress-text">
          だい {currentStep + 1} もん / {questions.length} もん
        </div>

        <div className="quiz-score-pill">
          <Award size={18} />
          <span>{score} てん</span>
        </div>
      </div>

      {/* Target Audio Prompt */}
      <div className="quiz-question-box">
        <h2 className="quiz-prompt-title">きこえた もじは どれかな？</h2>
        <button
          id="btn-quiz-replay-audio"
          className="quiz-audio-bubble"
          onClick={() => {
            sound.playTap();
            playTargetSound();
          }}
          aria-label="もういちどきく"
        >
          <Volume2 size={36} strokeWidth={2.4} color="#FFFFFF" />
          <span className="audio-bubble-label">もういちど きく</span>
        </button>
      </div>

      {/* 3 Option Cards */}
      <div className="quiz-options-grid">
        {currentQ.options.map(opt => {
          let cardStatusClass = '';
          if (isAnswered) {
            if (opt.id === currentQ.target.id) {
              cardStatusClass = 'correct-card';
            } else if (opt.id === selectedCharId) {
              cardStatusClass = 'wrong-card';
            }
          }

          return (
            <button
              key={opt.id}
              id={`quiz-opt-${opt.id}`}
              className={`quiz-opt-card ${cardStatusClass}`}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
            >
              <span className="opt-char">{opt.char}</span>
              {isAnswered && opt.id === currentQ.target.id && (
                <Check size={28} className="opt-status-icon correct-icon" />
              )}
              {isAnswered && opt.id === selectedCharId && opt.id !== currentQ.target.id && (
                <X size={28} className="opt-status-icon wrong-icon" />
              )}
            </button>
          );
        })}
      </div>

      {/* Next question button */}
      {isAnswered && (
        <div className="quiz-footer-action">
          <button id="btn-quiz-next" className="quiz-next-btn" onClick={handleNextQuestion}>
            <span>{currentStep < questions.length - 1 ? 'つぎの もんだいへ' : 'けっかをごらん'}</span>
            <ArrowRight size={22} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};
