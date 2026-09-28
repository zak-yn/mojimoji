// scripts/fetch_kanjivg_all.js
// Fetches authentic KanjiVG stroke data for all hiragana + katakana
// from raw GitHub (KanjiVG CC BY-SA 3.0 - https://github.com/KanjiVG/kanjivg)
import fs from 'fs';
import https from 'https';

const BASE_URL = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/';

// All 46 hiragana with their Unicode code points
const HIRA_SPECS = [
  { char: 'あ', hex: '03042', romaji: 'a',   word: 'あさがお', trans: 'あさがお' },
  { char: 'い', hex: '03044', romaji: 'i',   word: 'いちご',   trans: 'いちご' },
  { char: 'う', hex: '03046', romaji: 'u',   word: 'うさぎ',   trans: 'うさぎ' },
  { char: 'え', hex: '03048', romaji: 'e',   word: 'えんぴつ', trans: 'えんぴつ' },
  { char: 'お', hex: '0304a', romaji: 'o',   word: 'おにぎり', trans: 'おにぎり' },
  { char: 'か', hex: '0304b', romaji: 'ka',  word: 'かめ',     trans: 'かめ' },
  { char: 'き', hex: '0304d', romaji: 'ki',  word: 'きりん',   trans: 'きりん' },
  { char: 'く', hex: '0304f', romaji: 'ku',  word: 'くま',     trans: 'くま' },
  { char: 'け', hex: '03051', romaji: 'ke',  word: 'けいと',   trans: 'けいと' },
  { char: 'こ', hex: '03053', romaji: 'ko',  word: 'ことり',   trans: 'ことり' },
  { char: 'さ', hex: '03055', romaji: 'sa',  word: 'さくら',   trans: 'さくら' },
  { char: 'し', hex: '03057', romaji: 'shi', word: 'しか',     trans: 'しか' },
  { char: 'す', hex: '03059', romaji: 'su',  word: 'すいか',   trans: 'すいか' },
  { char: 'せ', hex: '0305b', romaji: 'se',  word: 'せみ',     trans: 'せみ' },
  { char: 'そ', hex: '0305d', romaji: 'so',  word: 'そら',     trans: 'そら' },
  { char: 'た', hex: '0305f', romaji: 'ta',  word: 'たいよう', trans: 'たいよう' },
  { char: 'ち', hex: '03061', romaji: 'chi', word: 'ちゅうりっぷ', trans: 'ちゅうりっぷ' },
  { char: 'つ', hex: '03064', romaji: 'tsu', word: 'つみき',   trans: 'つみき' },
  { char: 'て', hex: '03066', romaji: 'te',  word: 'てんとうむし', trans: 'てんとうむし' },
  { char: 'と', hex: '03068', romaji: 'to',  word: 'とまと',   trans: 'とまと' },
  { char: 'な', hex: '0306a', romaji: 'na',  word: 'なす',     trans: 'なす' },
  { char: 'に', hex: '0306b', romaji: 'ni',  word: 'にじ',     trans: 'にじ' },
  { char: 'ぬ', hex: '0306c', romaji: 'nu',  word: 'ぬいぐるみ', trans: 'ぬいぐるみ' },
  { char: 'ね', hex: '0306d', romaji: 'ne',  word: 'ねこ',     trans: 'ねこ' },
  { char: 'の', hex: '0306e', romaji: 'no',  word: 'のりもの', trans: 'のりもの' },
  { char: 'は', hex: '03070', romaji: 'ha',  word: 'はな',     trans: 'はな' },
  { char: 'ひ', hex: '03072', romaji: 'hi',  word: 'ひまわり', trans: 'ひまわり' },
  { char: 'ふ', hex: '03075', romaji: 'fu',  word: 'ふうせん', trans: 'ふうせん' },
  { char: 'へ', hex: '03078', romaji: 'he',  word: 'へび',     trans: 'へび' },
  { char: 'ほ', hex: '03079', romaji: 'ho',  word: 'ほし',     trans: 'ほし' },
  { char: 'ま', hex: '0307e', romaji: 'ma',  word: 'まめ',     trans: 'まめ' },
  { char: 'み', hex: '0307f', romaji: 'mi',  word: 'みかん',   trans: 'みかん' },
  { char: 'む', hex: '03080', romaji: 'mu',  word: 'むし',     trans: 'むし' },
  { char: 'め', hex: '03081', romaji: 'me',  word: 'めがね',   trans: 'めがね' },
  { char: 'も', hex: '03082', romaji: 'mo',  word: 'もも',     trans: 'もも' },
  { char: 'や', hex: '03084', romaji: 'ya',  word: 'やま',     trans: 'やま' },
  { char: 'ゆ', hex: '03086', romaji: 'yu',  word: 'ゆき',     trans: 'ゆき' },
  { char: 'よ', hex: '03088', romaji: 'yo',  word: 'よる',     trans: 'よる' },
  { char: 'ら', hex: '03089', romaji: 'ra',  word: 'らいおん', trans: 'らいおん' },
  { char: 'り', hex: '0308a', romaji: 'ri',  word: 'りんご',   trans: 'りんご' },
  { char: 'る', hex: '0308b', romaji: 'ru',  word: 'るびー',   trans: 'るびー' },
  { char: 'れ', hex: '0308c', romaji: 're',  word: 'れもん',   trans: 'れもん' },
  { char: 'ろ', hex: '0308d', romaji: 'ro',  word: 'ろうそく', trans: 'ろうそく' },
  { char: 'わ', hex: '03093', romaji: 'wa',  word: 'わに',     trans: 'わに' },
  { char: 'を', hex: '03092', romaji: 'wo',  word: 'をつかう', trans: 'をつかう' },
  { char: 'ん', hex: '03093', romaji: 'n',   word: 'きりん',   trans: 'きりん' },
];

// All 46 katakana
const KATA_SPECS = [
  { char: 'ア', hex: '030a2', romaji: 'a',   word: 'アイス',     trans: 'アイス' },
  { char: 'イ', hex: '030a4', romaji: 'i',   word: 'インク',     trans: 'インク' },
  { char: 'ウ', hex: '030a6', romaji: 'u',   word: 'ウクレレ',   trans: 'ウクレレ' },
  { char: 'エ', hex: '030a8', romaji: 'e',   word: 'エプロン',   trans: 'エプロン' },
  { char: 'オ', hex: '030aa', romaji: 'o',   word: 'オリーブ',   trans: 'オリーブ' },
  { char: 'カ', hex: '030ab', romaji: 'ka',  word: 'カメラ',     trans: 'カメラ' },
  { char: 'キ', hex: '030ad', romaji: 'ki',  word: 'キリン',     trans: 'キリン' },
  { char: 'ク', hex: '030af', romaji: 'ku',  word: 'クッキー',   trans: 'クッキー' },
  { char: 'ケ', hex: '030b1', romaji: 'ke',  word: 'ケーキ',     trans: 'ケーキ' },
  { char: 'コ', hex: '030b3', romaji: 'ko',  word: 'コアラ',     trans: 'コアラ' },
  { char: 'サ', hex: '030b5', romaji: 'sa',  word: 'サラダ',     trans: 'サラダ' },
  { char: 'シ', hex: '030b7', romaji: 'shi', word: 'シンバル',   trans: 'シンバル' },
  { char: 'ス', hex: '030b9', romaji: 'su',  word: 'スイカ',     trans: 'スイカ' },
  { char: 'セ', hex: '030bb', romaji: 'se',  word: 'セーター',   trans: 'セーター' },
  { char: 'ソ', hex: '030bd', romaji: 'so',  word: 'ソファ',     trans: 'ソファ' },
  { char: 'タ', hex: '030bf', romaji: 'ta',  word: 'タクシー',   trans: 'タクシー' },
  { char: 'チ', hex: '030c1', romaji: 'chi', word: 'チーズ',     trans: 'チーズ' },
  { char: 'ツ', hex: '030c4', romaji: 'tsu', word: 'ツリー',     trans: 'ツリー' },
  { char: 'テ', hex: '030c6', romaji: 'te',  word: 'テント',     trans: 'テント' },
  { char: 'ト', hex: '030c8', romaji: 'to',  word: 'トマト',     trans: 'トマト' },
  { char: 'ナ', hex: '030ca', romaji: 'na',  word: 'ナイフ',     trans: 'ナイフ' },
  { char: 'ニ', hex: '030cb', romaji: 'ni',  word: 'ニット',     trans: 'ニット' },
  { char: 'ヌ', hex: '030cc', romaji: 'nu',  word: 'ヌードル',   trans: 'ヌードル' },
  { char: 'ネ', hex: '030cd', romaji: 'ne',  word: 'ネクタイ',   trans: 'ネクタイ' },
  { char: 'ノ', hex: '030ce', romaji: 'no',  word: 'ノート',     trans: 'ノート' },
  { char: 'ハ', hex: '030cf', romaji: 'ha',  word: 'ハム',       trans: 'ハム' },
  { char: 'ヒ', hex: '030d2', romaji: 'hi',  word: 'ピアノ',     trans: 'ピアノ' },
  { char: 'フ', hex: '030d5', romaji: 'fu',  word: 'フラミンゴ', trans: 'フラミンゴ' },
  { char: 'ヘ', hex: '030d8', romaji: 'he',  word: 'ヘリコプター', trans: 'ヘリコプター' },
  { char: 'ホ', hex: '030db', romaji: 'ho',  word: 'ホテル',     trans: 'ホテル' },
  { char: 'マ', hex: '030de', romaji: 'ma',  word: 'マント',     trans: 'マント' },
  { char: 'ミ', hex: '030df', romaji: 'mi',  word: 'ミルク',     trans: 'ミルク' },
  { char: 'ム', hex: '030e0', romaji: 'mu',  word: 'ムース',     trans: 'ムース' },
  { char: 'メ', hex: '030e1', romaji: 'me',  word: 'メロン',     trans: 'メロン' },
  { char: 'モ', hex: '030e2', romaji: 'mo',  word: 'モノレール', trans: 'モノレール' },
  { char: 'ヤ', hex: '030e4', romaji: 'ya',  word: 'ヤシ',       trans: 'ヤシ' },
  { char: 'ユ', hex: '030e6', romaji: 'yu',  word: 'ユニコーン', trans: 'ユニコーン' },
  { char: 'ヨ', hex: '030e8', romaji: 'yo',  word: 'ヨット',     trans: 'ヨット' },
  { char: 'ラ', hex: '030e9', romaji: 'ra',  word: 'ライオン',   trans: 'ライオン' },
  { char: 'リ', hex: '030ea', romaji: 'ri',  word: 'リボン',     trans: 'リボン' },
  { char: 'ル', hex: '030eb', romaji: 'ru',  word: 'ルビー',     trans: 'ルビー' },
  { char: 'レ', hex: '030ec', romaji: 're',  word: 'レモン',     trans: 'レモン' },
  { char: 'ロ', hex: '030ed', romaji: 'ro',  word: 'ロボット',   trans: 'ロボット' },
  { char: 'ワ', hex: '030ef', romaji: 'wa',  word: 'ワニ',       trans: 'ワニ' },
  { char: 'ヲ', hex: '030f2', romaji: 'wo',  word: 'ヲタク',     trans: 'ヲタク' },
  { char: 'ン', hex: '030f3', romaji: 'n',   word: 'パンダ',     trans: 'パンダ' },
];

function fetchSvg(hex) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${hex}.svg`;
    https.get(url, { headers: { 'User-Agent': 'mojimoji-app/1.0' } }, (res) => {
      if (res.statusCode === 404) {
        resolve(null);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${hex}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseStrokes(svgText) {
  // Extract all path d attributes in order
  // KanjiVG paths have kvg:element attributes to identify stroke order
  const strokes = [];
  const pathRegex = /<path[^>]*\sd="([^"]+)"[^>]*>/g;
  let match;
  let order = 1;
  while ((match = pathRegex.exec(svgText)) !== null) {
    strokes.push({ order: order++, d: match[1] });
  }
  return strokes;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchAllStrokes(specs, label) {
  const results = [];
  for (const spec of specs) {
    try {
      const svg = await fetchSvg(spec.hex);
      if (!svg) {
        console.warn(`\n  ⚠ Not found: ${spec.char} (${spec.hex})`);
        results.push({ ...spec, strokes: [] });
      } else {
        const strokes = parseStrokes(svg);
        results.push({ ...spec, strokes });
        process.stdout.write(`✓`);
      }
    } catch (err) {
      console.warn(`\n  ✗ Error ${spec.char}: ${err.message}`);
      results.push({ ...spec, strokes: [] });
    }
    await sleep(100);
  }
  return results;
}

async function main() {
  console.log('Fetching KanjiVG stroke data from GitHub...\n');
  console.log(`Hiragana (${HIRA_SPECS.length}):`);
  const hiraList = await fetchAllStrokes(HIRA_SPECS, 'Hiragana');

  console.log(`\nKatakana (${KATA_SPECS.length}):`);
  const kataList = await fetchAllStrokes(KATA_SPECS, 'Katakana');

  const hiraEmpty = hiraList.filter(c => c.strokes.length === 0).map(c => c.char);
  const kataEmpty = kataList.filter(c => c.strokes.length === 0).map(c => c.char);

  if (hiraEmpty.length) console.log(`\n⚠ Missing hiragana: ${hiraEmpty.join(' ')}`);
  if (kataEmpty.length) console.log(`\n⚠ Missing katakana: ${kataEmpty.join(' ')}`);

  const output = {
    hiraList: hiraList.map(s => ({
      id: `hira_${s.romaji}`,
      char: s.char,
      hex: s.hex,
      romaji: s.romaji,
      word: s.word,
      trans: s.trans,
      strokes: s.strokes,
    })),
    kataList: kataList.map(s => ({
      id: `kata_${s.romaji}`,
      char: s.char,
      hex: s.hex,
      romaji: s.romaji,
      word: s.word,
      trans: s.trans,
      strokes: s.strokes,
    })),
  };

  fs.writeFileSync('scripts/kanjivg_output.json', JSON.stringify(output, null, 2));
  const totalStrokes = [...hiraList, ...kataList].reduce((sum, c) => sum + c.strokes.length, 0);
  console.log(`\n\n✅ Done! ${totalStrokes} total stroke paths`);
  console.log(`   Hiragana: ${hiraList.filter(c => c.strokes.length > 0).length}/46 complete`);
  console.log(`   Katakana: ${kataList.filter(c => c.strokes.length > 0).length}/46 complete`);
  console.log('   Written to scripts/kanjivg_output.json');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
