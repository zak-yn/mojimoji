// scripts/generate_accurate_characters.js
import fs from 'fs';

const kanjiData = JSON.parse(fs.readFileSync('scripts/kanjivg_output.json', 'utf8'));

const hiraganaChars = kanjiData.hiraList.map(item => ({
  id: item.id,
  char: item.char,
  romajiOrPhonetic: item.romaji,
  letterName: item.char,
  letterSound: item.char,
  phonicsSpokenText: item.char,
  exampleWord: item.word,
  exampleTranslation: `${item.trans} (${item.word})`,
  langCode: 'ja-JP',
  strokes: item.strokes
}));

const katakanaChars = kanjiData.kataList.map(item => ({
  id: item.id,
  char: item.char,
  romajiOrPhonetic: item.romaji,
  letterName: item.char,
  letterSound: item.char,
  phonicsSpokenText: item.char,
  exampleWord: item.word,
  exampleTranslation: `${item.trans}`,
  langCode: 'ja-JP',
  strokes: item.strokes
}));

const englishChars = [
  {
    id: 'en_a',
    char: 'A',
    romajiOrPhonetic: 'ei',
    letterName: 'A (エイ)',
    letterSound: '/æ/ (アッ)',
    phonicsSpokenText: 'ah',
    exampleWord: 'Apple',
    exampleTranslation: 'りんご (Apple)',
    langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 54.5 18 L 24 90' },
      { order: 2, d: 'M 54.5 18 L 85 90' },
      { order: 3, d: 'M 36 64 L 73 64' }
    ]
  },
  {
    id: 'en_b',
    char: 'B',
    romajiOrPhonetic: 'bi:',
    letterName: 'B (ビー)',
    letterSound: '/b/ (ブッ)',
    phonicsSpokenText: 'buh',
    exampleWord: 'Bear',
    exampleTranslation: 'くま (Bear)',
    langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 60 18 C 76 18 76 52 60 52 L 34 52' },
      { order: 3, d: 'M 34 52 L 64 52 C 82 52 82 90 64 90 L 34 90' }
    ]
  },
  {
    id: 'en_c',
    char: 'C',
    romajiOrPhonetic: 'si:',
    letterName: 'C (スィー)',
    letterSound: '/k/ (クッ)',
    phonicsSpokenText: 'kuh',
    exampleWord: 'Cat',
    exampleTranslation: 'ねこ (Cat)',
    langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 82 36 C 70 20 40 20 34 54 C 28 88 68 92 84 74' }
    ]
  },
  {
    id: 'en_d',
    char: 'D',
    romajiOrPhonetic: 'di:',
    letterName: 'D (ディー)',
    letterSound: '/d/ (ドゥッ)',
    phonicsSpokenText: 'duh',
    exampleWord: 'Dog',
    exampleTranslation: 'いぬ (Dog)',
    langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 56 18 C 84 18 84 90 56 90 L 34 90' }
    ]
  },
  {
    id: 'en_e',
    char: 'E',
    romajiOrPhonetic: 'i:',
    letterName: 'E (イー)',
    letterSound: '/e/ (エッ)',
    phonicsSpokenText: 'eh',
    exampleWord: 'Elephant',
    exampleTranslation: 'ぞう (Elephant)',
    langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 78 18' },
      { order: 3, d: 'M 34 54 L 68 54' },
      { order: 4, d: 'M 34 90 L 80 90' }
    ]
  },
  {
    id: 'en_f',
    char: 'F',
    romajiOrPhonetic: 'ef',
    letterName: 'F (エフ)',
    letterSound: '/f/ (フッ)',
    phonicsSpokenText: 'fuh',
    exampleWord: 'Fox',
    exampleTranslation: 'きつね (Fox)',
    langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 78 18' },
      { order: 3, d: 'M 34 54 L 66 54' }
    ]
  },
  {
    id: 'en_g',
    char: 'G',
    romajiOrPhonetic: 'dʒi:',
    letterName: 'G (ジー)',
    letterSound: '/ɡ/ (グッ)',
    phonicsSpokenText: 'guh',
    exampleWord: 'Giraffe',
    exampleTranslation: 'きりん (Giraffe)',
    langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 82 36 C 70 20 40 20 34 54 C 28 88 68 92 82 78 L 82 56 L 58 56' }
    ]
  }
];

const polishChars = [
  {
    id: 'pl_a',
    char: 'A',
    romajiOrPhonetic: 'a',
    letterName: 'A (ア)',
    letterSound: '/a/ (ア)',
    phonicsSpokenText: 'a',
    exampleWord: 'Ananas',
    exampleTranslation: 'パイナップル (Ananas)',
    langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 54.5 18 L 24 90' },
      { order: 2, d: 'M 54.5 18 L 85 90' },
      { order: 3, d: 'M 36 64 L 73 64' }
    ]
  },
  {
    id: 'pl_a_ogonek',
    char: 'Ą',
    romajiOrPhonetic: 'on (鼻音)',
    letterName: 'Ą (オウン)',
    letterSound: '/ɔw̃/ (オン)',
    phonicsSpokenText: 'on',
    exampleWord: 'Wąż',
    exampleTranslation: 'へび (Wąż / Ą)',
    langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 54.5 16 L 24 82' },
      { order: 2, d: 'M 54.5 16 L 85 82' },
      { order: 3, d: 'M 36 60 L 73 60' },
      { order: 4, d: 'M 80 82 C 84 94 72 102 62 96' } // Ogonek
    ]
  },
  {
    id: 'pl_b',
    char: 'B',
    romajiOrPhonetic: 'be',
    letterName: 'B (ベ)',
    letterSound: '/b/ (ブ)',
    phonicsSpokenText: 'b',
    exampleWord: 'Balon',
    exampleTranslation: 'ふうせん (Balon)',
    langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 60 18 C 76 18 76 52 60 52 L 34 52' },
      { order: 3, d: 'M 34 52 L 64 52 C 82 52 82 90 64 90 L 34 90' }
    ]
  },
  {
    id: 'pl_c',
    char: 'C',
    romajiOrPhonetic: 'tse',
    letterName: 'C (ツェ)',
    letterSound: '/ts/ (ツ)',
    phonicsSpokenText: 'ce',
    exampleWord: 'Cytryna',
    exampleTranslation: 'レモン (Cytryna)',
    langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 82 36 C 70 20 40 20 34 54 C 28 88 68 92 84 74' }
    ]
  },
  {
    id: 'pl_c_acute',
    char: 'Ć',
    romajiOrPhonetic: 'tɕi (チ)',
    letterName: 'Ć (チ / 軟音)',
    letterSound: '/tɕ/ (チ)',
    phonicsSpokenText: 'ći',
    exampleWord: 'Ćma',
    exampleTranslation: 'が (Ćma / 蛾)',
    langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 82 42 C 70 26 40 26 34 60 C 28 94 68 98 84 80' },
      { order: 2, d: 'M 48 24 L 66 12' } // Kreska
    ]
  },
  {
    id: 'pl_l_stroke',
    char: 'Ł',
    romajiOrPhonetic: 'w (ウ)',
    letterName: 'Ł (エウ)',
    letterSound: '/w/ (ウ)',
    phonicsSpokenText: 'w',
    exampleWord: 'Łódź',
    exampleTranslation: 'ふね (Łódź / ボート)',
    langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 36 18 L 36 90' },
      { order: 2, d: 'M 36 90 L 80 90' },
      { order: 3, d: 'M 24 58 L 52 46' } // Ukośnik
    ]
  },
  {
    id: 'pl_z_dot',
    char: 'Ż',
    romajiOrPhonetic: 'ʐ (ジェ)',
    letterName: 'Ż (ジェット)',
    letterSound: '/ʐ/ (ジェ)',
    phonicsSpokenText: 'że',
    exampleWord: 'Żyrafa',
    exampleTranslation: 'きりん (Żyrafa)',
    langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 32 L 76 32 L 34 88 L 78 88' },
      { order: 2, d: 'M 54 16 L 54 18' } // Kropka
    ]
  }
];

const tsContent = `// Auto-generated KanjiVG & Phonics Enhanced Character Data for mojimoji
import type { CharacterSet, LanguageType } from '../types';

export const CHARACTER_SETS: Record<LanguageType, CharacterSet> = {
  hiragana: {
    id: 'hiragana',
    title: 'ひらがな',
    subtitle: 'にほんごの きほん',
    langCode: 'ja-JP',
    characters: ${JSON.stringify(hiraganaChars, null, 2)}
  },
  katakana: {
    id: 'katakana',
    title: 'カタカナ',
    subtitle: 'ことばの はばを ひろげよう',
    langCode: 'ja-JP',
    characters: ${JSON.stringify(katakanaChars, null, 2)}
  },
  english: {
    id: 'english',
    title: 'ABC えいご',
    subtitle: 'English Alphabet & Phonics',
    langCode: 'en-US',
    characters: ${JSON.stringify(englishChars, null, 2)}
  },
  polish: {
    id: 'polish',
    title: 'Polski ポーランドご',
    subtitle: 'Polski alfabet i głoski',
    langCode: 'pl-PL',
    characters: ${JSON.stringify(polishChars, null, 2)}
  }
};
`;

fs.writeFileSync('src/data/characters.ts', tsContent);
console.log('Updated src/data/characters.ts with Phonics data!');
