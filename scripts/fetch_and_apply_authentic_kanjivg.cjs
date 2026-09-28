const fs = require('fs');
const https = require('https');
const path = require('path');

function fetchSvg(hex) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
    https.get(url, { headers: { 'User-Agent': 'mojimoji-kanjivg-updater' } }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${hex}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseStrokes(svg) {
  const strokes = [];
  const matches = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"[^>]*>/g)];
  matches.forEach((m, idx) => {
    strokes.push({
      order: idx + 1,
      d: m[1]
    });
  });
  return strokes;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Reading characters.ts...');
  const charFilePath = path.join(__dirname, '../src/data/characters.ts');
  const content = fs.readFileSync(charFilePath, 'utf8');

  // Find the exact boundaries:
  // Hiragana starts at `hiragana: { ... characters: [`
  // Katakana starts at `katakana: { ... characters: [`
  // English starts at `english: { ... characters: [`
  // Polish starts at `polish: { ... characters: [`

  const hiraStartIdx = content.indexOf('hiragana: {');
  const kataStartIdx = content.indexOf('katakana: {');
  const englishStartIdx = content.indexOf('english: {');
  const polishStartIdx = content.indexOf('polish: {');

  if (hiraStartIdx === -1 || kataStartIdx === -1 || englishStartIdx === -1) {
    throw new Error('Could not find language section headers in characters.ts');
  }

  // Let's parse out the Hiragana and Katakana character objects without destroying their fields
  // In characters.ts, each character is a JSON-like object:
  // {
  //   "id": "...",
  //   "char": "...",
  //   "romajiOrPhonetic": "...",
  //   "letterName": "...",
  //   "letterSound": "...",
  //   "phonicsSpokenText": "...",
  //   "exampleWord": "...",
  //   "exampleTranslation": "...",
  //   "langCode": "ja-JP",
  //   "strokes": [ ... ]
  // }

  const hiraSlice = content.substring(hiraStartIdx, kataStartIdx);
  const kataSlice = content.substring(kataStartIdx, englishStartIdx);

  // Extract all character definitions with their metadata
  const charRegex = /{\s*"id":\s*"([^"]+)",\s*"char":\s*"([^"]+)",\s*"romajiOrPhonetic":\s*"([^"]+)",\s*"letterName":\s*"([^"]+)",\s*"letterSound":\s*"([^"]+)",\s*"phonicsSpokenText":\s*"([^"]+)",\s*"exampleWord":\s*"([^"]+)",\s*"exampleTranslation":\s*"([^"]+)",\s*"langCode":\s*"([^"]+)"/g;

  const hiraChars = [];
  for (const m of hiraSlice.matchAll(charRegex)) {
    hiraChars.push({
      id: m[1],
      char: m[2],
      romajiOrPhonetic: m[3],
      letterName: m[4],
      letterSound: m[5],
      phonicsSpokenText: m[6],
      exampleWord: m[7],
      exampleTranslation: m[8],
      langCode: m[9],
    });
  }

  const kataChars = [];
  for (const m of kataSlice.matchAll(charRegex)) {
    kataChars.push({
      id: m[1],
      char: m[2],
      romajiOrPhonetic: m[3],
      letterName: m[4],
      letterSound: m[5],
      phonicsSpokenText: m[6],
      exampleWord: m[7],
      exampleTranslation: m[8],
      langCode: m[9],
    });
  }

  console.log(`Parsed metadata: Hiragana=${hiraChars.length}, Katakana=${kataChars.length}`);
  if (hiraChars.length !== 46 || kataChars.length !== 46) {
    throw new Error(`Expected 46/46, got ${hiraChars.length} hiragana, ${kataChars.length} katakana`);
  }

  // Fetch strokes for Hiragana
  console.log('\nFetching authentic KanjiVG strokes for Hiragana (46 characters)...');
  for (const item of hiraChars) {
    const hex = '0' + item.char.charCodeAt(0).toString(16).toLowerCase();
    const svg = await fetchSvg(hex);
    const strokes = parseStrokes(svg);
    if (!strokes.length) {
      throw new Error(`Zero strokes for hiragana ${item.char} (${hex})`);
    }
    item.strokes = strokes;
    process.stdout.write(`${item.char}(${strokes.length}画) `);
    await sleep(50);
  }

  // Fetch strokes for Katakana
  console.log('\n\nFetching authentic KanjiVG strokes for Katakana (46 characters)...');
  for (const item of kataChars) {
    const hex = '0' + item.char.charCodeAt(0).toString(16).toLowerCase();
    const svg = await fetchSvg(hex);
    const strokes = parseStrokes(svg);
    if (!strokes.length) {
      throw new Error(`Zero strokes for katakana ${item.char} (${hex})`);
    }
    item.strokes = strokes;
    process.stdout.write(`${item.char}(${strokes.length}画) `);
    await sleep(50);
  }

  console.log('\n\nSaving kanjivg_verified_all.json...');
  fs.writeFileSync(
    path.join(__dirname, 'kanjivg_verified_all.json'),
    JSON.stringify({ hiraChars, kataChars }, null, 2),
    'utf8'
  );

  // Now reconstruct characters.ts cleanly
  // Header up to `characters: [` of hiragana
  const hiraHeader = content.substring(0, content.indexOf('characters: [', hiraStartIdx) + 'characters: ['.length);

  // Kata header between end of hiragana array and `characters: [` of katakana
  const kataHeaderStart = content.indexOf('katakana: {', kataStartIdx);
  const kataHeader = content.substring(kataHeaderStart, content.indexOf('characters: [', kataHeaderStart) + 'characters: ['.length);

  // English through end of file
  const englishRest = content.substring(englishStartIdx);

  const formatChars = (arr) => {
    return '\n' + arr.map(c => '  ' + JSON.stringify(c, null, 2).replace(/\n/g, '\n  ')).join(',\n') + '\n';
  };

  const newContent = `${hiraHeader}${formatChars(hiraChars)}    ]\n  },\n  ${kataHeader}${formatChars(kataChars)}    ]\n  },\n  ${englishRest}`;

  fs.writeFileSync(charFilePath, newContent, 'utf8');
  console.log('Successfully updated src/data/characters.ts with 100% authentic KanjiVG stroke data!');
}

run().catch(err => {
  console.error('\nERROR:', err);
  process.exit(1);
});
