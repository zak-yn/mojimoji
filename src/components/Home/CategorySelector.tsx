import React from 'react';
import { CHARACTER_SETS } from '../../data/characters';
import type { LanguageType, UserProgress } from '../../types';
import { sound } from '../../sound/audioEngine';
import { speech } from '../../speech/tts';
import { BookOpen, Shuffle, Award, ArrowRight } from 'lucide-react';

interface CategorySelectorProps {
  progress: UserProgress;
  orderMode: 'sequential' | 'random';
  onToggleOrderMode: (mode: 'sequential' | 'random') => void;
  onSelectCategory: (lang: LanguageType) => void;
  onStartQuiz: (lang: LanguageType) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  progress,
  orderMode,
  onToggleOrderMode,
  onSelectCategory,
  onStartQuiz
}) => {
  const [langFilter, setLangFilter] = React.useState<'all' | 'ja' | 'num' | 'en' | 'pl'>('all');

  const categories: { id: LanguageType; sample: string; desc: string; color: string; accent: string }[] = [
    {
      id: 'hiragana',
      sample: 'あいうえお',
      desc: 'にほんごの きほん (46もじ)',
      color: '#FFF9F5',
      accent: '#D96B43'
    },
    {
      id: 'katakana',
      sample: 'アイウエオ',
      desc: 'ことばの はばを ひろげよう (46もじ)',
      color: '#F6F9F6',
      accent: '#5A826D'
    },
    {
      id: 'numbers',
      sample: '1 2 3 4 5',
      desc: '0から9までの すうじ (10もじ)',
      color: '#FFFDF0',
      accent: '#D99E1F'
    },
    {
      id: 'english',
      sample: 'A B C D E',
      desc: 'ABC えいごの おおもじ (26もじ)',
      color: '#F6F8FB',
      accent: '#47688A'
    },
    {
      id: 'english_lower',
      sample: 'a b c d e',
      desc: 'abc えいごの こもじ (26もじ)',
      color: '#F4F8FA',
      accent: '#3E7B8E'
    },
    {
      id: 'polish',
      sample: 'A Ą B C Ć',
      desc: 'Polski ポーランドごの おおもじ (26もじ)',
      color: '#FCF8F3',
      accent: '#C76A75'
    },
    {
      id: 'polish_lower',
      sample: 'a ą b c ć',
      desc: 'polski ポーランドごの こもじ (26もじ)',
      color: '#FAF5F5',
      accent: '#B85866'
    }
  ];

  const filteredCategories = categories.filter(cat => {
    if (langFilter === 'ja') return cat.id === 'hiragana' || cat.id === 'katakana';
    if (langFilter === 'num') return cat.id === 'numbers';
    if (langFilter === 'en') return cat.id === 'english' || cat.id === 'english_lower';
    if (langFilter === 'pl') return cat.id === 'polish' || cat.id === 'polish_lower';
    return true;
  });

  const handleCardClick = (lang: LanguageType) => {
    sound.playTap();
    const set = CHARACTER_SETS[lang];
    if (set) {
      speech.speak(set.title, set.langCode);
    }
    onSelectCategory(lang);
  };

  const handleQuizClick = (e: React.MouseEvent, lang: LanguageType) => {
    e.stopPropagation();
    sound.playTap();
    onStartQuiz(lang);
  };

  return (
    <div className="home-container">
      {/* Welcome Hero Card */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <h1 className="welcome-title">
            <span className="child-greeting">こんにちは！</span>
            <span className="welcome-main">きょうは どの文字を かいてみる？</span>
          </h1>
          <p className="welcome-desc">
            ゆびで なぞって、きれいな もじを おぼえよう！
          </p>
        </div>

        {/* Order Mode Switcher (50音順 vs ランダム) */}
        <div className="mode-toggle-card">
          <span className="mode-toggle-label">ならびじゅん:</span>
          <div className="mode-buttons-group">
            <button
              id="btn-mode-sequential"
              className={`mode-pill-btn ${orderMode === 'sequential' ? 'active' : ''}`}
              onClick={() => {
                sound.playTap();
                onToggleOrderMode('sequential');
              }}
            >
              <BookOpen size={17} strokeWidth={2.2} />
              <span>じゅんばん</span>
            </button>
            <button
              id="btn-mode-random"
              className={`mode-pill-btn ${orderMode === 'random' ? 'active' : ''}`}
              onClick={() => {
                sound.playTap();
                onToggleOrderMode('random');
              }}
            >
              <Shuffle size={17} strokeWidth={2.2} />
              <span>まぜこぜ</span>
            </button>
          </div>
        </div>
      </section>

      {/* Language Filter Chips */}
      <div className="category-filter-chips">
        <button
          id="btn-filter-all"
          className={`filter-chip ${langFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            sound.playTap();
            setLangFilter('all');
          }}
        >
          すべて
        </button>
        <button
          id="btn-filter-ja"
          className={`filter-chip ${langFilter === 'ja' ? 'active' : ''}`}
          onClick={() => {
            sound.playTap();
            setLangFilter('ja');
          }}
        >
          にほんご
        </button>
        <button
          id="btn-filter-num"
          className={`filter-chip ${langFilter === 'num' ? 'active' : ''}`}
          onClick={() => {
            sound.playTap();
            setLangFilter('num');
          }}
        >
          すうじ
        </button>
        <button
          id="btn-filter-en"
          className={`filter-chip ${langFilter === 'en' ? 'active' : ''}`}
          onClick={() => {
            sound.playTap();
            setLangFilter('en');
          }}
        >
          えいご
        </button>
        <button
          id="btn-filter-pl"
          className={`filter-chip ${langFilter === 'pl' ? 'active' : ''}`}
          onClick={() => {
            sound.playTap();
            setLangFilter('pl');
          }}
        >
          ポーランドご
        </button>
      </div>

      {/* Language Category Cards Grid */}
      <section className="category-grid">
        {filteredCategories.map(cat => {
          const charSet = CHARACTER_SETS[cat.id];
          const totalChars = charSet.characters.length;
          const completedCount = charSet.characters.filter(
            c => (progress.completedChars[c.id] || 0) > 0
          ).length;

          return (
            <div
              key={cat.id}
              id={`cat-card-${cat.id}`}
              className="category-card"
              style={{
                backgroundColor: cat.color,
                borderTop: `4px solid ${cat.accent}`
              }}
              onClick={() => handleCardClick(cat.id)}
            >
              <div className="card-top">
                <span className="card-badge" style={{ color: cat.accent, borderColor: `${cat.accent}40` }}>
                  {charSet.title}
                </span>
                <span className="progress-badge">
                  {completedCount} / {totalChars} もじ
                </span>
              </div>

              <div className="card-sample-letters" style={{ color: cat.accent }}>
                {cat.sample}
              </div>

              <div className="card-meta">
                <span className="card-desc">{cat.desc}</span>
              </div>

              <div className="card-actions">
                <button
                  id={`btn-study-${cat.id}`}
                  className="btn-study-main"
                  style={{ backgroundColor: cat.accent }}
                  onClick={() => handleCardClick(cat.id)}
                >
                  <span>れんしゅうする</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>

                <button
                  id={`btn-quiz-${cat.id}`}
                  className="btn-quiz-sub"
                  title="テストであそぶ"
                  onClick={e => handleQuizClick(e, cat.id)}
                >
                  <Award size={18} strokeWidth={2.2} />
                  <span>テスト</span>
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
