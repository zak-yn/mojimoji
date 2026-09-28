// scripts/apply_japanese_strokes.js - v2
// Rebuilds characters.ts using the complete Japanese stroke data
// + re-using English/Polish CHAR arrays directly from build_full_datasets.js
import fs from 'fs';

const strokeData = JSON.parse(fs.readFileSync('scripts/japanese_strokes_complete.json', 'utf8'));

// Read build_full_datasets.js and extract ENGLISH_CHARS and POLISH_CHARS via eval trick
const datasetSrc = fs.readFileSync('scripts/build_full_datasets.js', 'utf8');

// Extract the ENGLISH_CHARS array literal using regex
const enMatch = /const ENGLISH_CHARS\s*=\s*(\[[\s\S]*?\n\])\s*;/.exec(datasetSrc);
const plMatch = /const POLISH_CHARS\s*=\s*(\[[\s\S]*?\n\])\s*;/.exec(datasetSrc);

if (!enMatch || !plMatch) {
  console.error('Could not find ENGLISH_CHARS or POLISH_CHARS in build_full_datasets.js');
  process.exit(1);
}

// Parse them using Function constructor (safe since it's our own source file)
const ENGLISH_CHARS = Function(`"use strict"; return ${enMatch[1]}`)();
const POLISH_CHARS  = Function(`"use strict"; return ${plMatch[1]}`)();

console.log(`Loaded ${ENGLISH_CHARS.length} English chars, ${POLISH_CHARS.length} Polish chars`);

const newContent = `// Comprehensive Multilingual Character Dataset for mojimoji
// KanjiVG stroke paths (CC BY-SA 3.0) + Pure Phonics (Zero Katakana Phonetic Bias)
import type { CharacterSet, LanguageType } from '../types';

export const CHARACTER_SETS: Record<LanguageType, CharacterSet> = {
  hiragana: {
    id: 'hiragana',
    title: 'ひらがな',
    subtitle: '50おんの きほん (46もじ)',
    langCode: 'ja-JP',
    characters: ${JSON.stringify(strokeData.hiragana, null, 2)}
  },
  katakana: {
    id: 'katakana',
    title: 'カタカナ',
    subtitle: 'ことばの はばを ひろげよう (46もじ)',
    langCode: 'ja-JP',
    characters: ${JSON.stringify(strokeData.katakana, null, 2)}
  },
  english: {
    id: 'english',
    title: 'ABC えいご',
    subtitle: 'Alphabet & Phonics (A-Z 26もじ)',
    langCode: 'en-US',
    characters: ${JSON.stringify(ENGLISH_CHARS, null, 2)}
  },
  polish: {
    id: 'polish',
    title: 'Polski ポーランドご',
    subtitle: 'Polski alfabet i głoski (26もじ)',
    langCode: 'pl-PL',
    characters: ${JSON.stringify(POLISH_CHARS, null, 2)}
  }
};
`;

fs.writeFileSync('src/data/characters.ts', newContent);

const hiraOk = strokeData.hiragana.filter(c => c.strokes.length > 0).length;
const kataOk = strokeData.katakana.filter(c => c.strokes.length > 0).length;
const totalStrokes = strokeData.hiragana.reduce((s, c) => s + c.strokes.length, 0)
  + strokeData.katakana.reduce((s, c) => s + c.strokes.length, 0);

console.log(`✅ characters.ts rebuilt!`);
console.log(`  Hiragana: ${hiraOk}/46 with strokes`);
console.log(`  Katakana: ${kataOk}/46 with strokes`);
console.log(`  Total Japanese stroke paths: ${totalStrokes}`);
console.log(`  English: ${ENGLISH_CHARS.length} chars, Polish: ${POLISH_CHARS.length} chars`);
