// scripts/download_japanese_audio.js
// Downloads authentic Japanese TTS audio from Google Translate TTS
// for all Hiragana and Katakana characters and example words.
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/audio/japanese');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// ---- Hiragana ----
const HIRA_ITEMS = [
  { id: 'ja_hira_a',   char: 'あ', word: 'あさがお' },
  { id: 'ja_hira_i',   char: 'い', word: 'いちご' },
  { id: 'ja_hira_u',   char: 'う', word: 'うさぎ' },
  { id: 'ja_hira_e',   char: 'え', word: 'えんぴつ' },
  { id: 'ja_hira_o',   char: 'お', word: 'おにぎり' },
  { id: 'ja_hira_ka',  char: 'か', word: 'かめ' },
  { id: 'ja_hira_ki',  char: 'き', word: 'きりん' },
  { id: 'ja_hira_ku',  char: 'く', word: 'くま' },
  { id: 'ja_hira_ke',  char: 'け', word: 'けいと' },
  { id: 'ja_hira_ko',  char: 'こ', word: 'ことり' },
  { id: 'ja_hira_sa',  char: 'さ', word: 'さくら' },
  { id: 'ja_hira_si',  char: 'し', word: 'しか' },
  { id: 'ja_hira_su',  char: 'す', word: 'すいか' },
  { id: 'ja_hira_se',  char: 'せ', word: 'せみ' },
  { id: 'ja_hira_so',  char: 'そ', word: 'そら' },
  { id: 'ja_hira_ta',  char: 'た', word: 'たいよう' },
  { id: 'ja_hira_ti',  char: 'ち', word: 'ちゅうりっぷ' },
  { id: 'ja_hira_tu',  char: 'つ', word: 'つみき' },
  { id: 'ja_hira_te',  char: 'て', word: 'てんとうむし' },
  { id: 'ja_hira_to',  char: 'と', word: 'とまと' },
  { id: 'ja_hira_na',  char: 'な', word: 'なす' },
  { id: 'ja_hira_ni',  char: 'に', word: 'にじ' },
  { id: 'ja_hira_nu',  char: 'ぬ', word: 'ぬいぐるみ' },
  { id: 'ja_hira_ne',  char: 'ね', word: 'ねこ' },
  { id: 'ja_hira_no',  char: 'の', word: 'のりもの' },
  { id: 'ja_hira_ha',  char: 'は', word: 'はな' },
  { id: 'ja_hira_hi',  char: 'ひ', word: 'ひまわり' },
  { id: 'ja_hira_hu',  char: 'ふ', word: 'ふうせん' },
  { id: 'ja_hira_he',  char: 'へ', word: 'へび' },
  { id: 'ja_hira_ho',  char: 'ほ', word: 'ほし' },
  { id: 'ja_hira_ma',  char: 'ま', word: 'まめ' },
  { id: 'ja_hira_mi',  char: 'み', word: 'みかん' },
  { id: 'ja_hira_mu',  char: 'む', word: 'むし' },
  { id: 'ja_hira_me',  char: 'め', word: 'めがね' },
  { id: 'ja_hira_mo',  char: 'も', word: 'もも' },
  { id: 'ja_hira_ya',  char: 'や', word: 'やま' },
  { id: 'ja_hira_yu',  char: 'ゆ', word: 'ゆき' },
  { id: 'ja_hira_yo',  char: 'よ', word: 'よる' },
  { id: 'ja_hira_ra',  char: 'ら', word: 'らいおん' },
  { id: 'ja_hira_ri',  char: 'り', word: 'りんご' },
  { id: 'ja_hira_ru',  char: 'る', word: 'るびー' },
  { id: 'ja_hira_re',  char: 'れ', word: 'れもん' },
  { id: 'ja_hira_ro',  char: 'ろ', word: 'ろうそく' },
  { id: 'ja_hira_wa',  char: 'わ', word: 'わに' },
  { id: 'ja_hira_wo',  char: 'を', word: 'ほんをよむ' },
  { id: 'ja_hira_n',   char: 'ん', word: 'きりん' },
];

// ---- Katakana ----
const KATA_ITEMS = [
  { id: 'ja_kata_a',   char: 'ア', word: 'アイス' },
  { id: 'ja_kata_i',   char: 'イ', word: 'インク' },
  { id: 'ja_kata_u',   char: 'ウ', word: 'ウクレレ' },
  { id: 'ja_kata_e',   char: 'エ', word: 'エプロン' },
  { id: 'ja_kata_o',   char: 'オ', word: 'オリーブ' },
  { id: 'ja_kata_ka',  char: 'カ', word: 'カメラ' },
  { id: 'ja_kata_ki',  char: 'キ', word: 'キリン' },
  { id: 'ja_kata_ku',  char: 'ク', word: 'クッキー' },
  { id: 'ja_kata_ke',  char: 'ケ', word: 'ケーキ' },
  { id: 'ja_kata_ko',  char: 'コ', word: 'コアラ' },
  { id: 'ja_kata_sa',  char: 'サ', word: 'サラダ' },
  { id: 'ja_kata_si',  char: 'シ', word: 'シンバル' },
  { id: 'ja_kata_su',  char: 'ス', word: 'スイカ' },
  { id: 'ja_kata_se',  char: 'セ', word: 'セーター' },
  { id: 'ja_kata_so',  char: 'ソ', word: 'ソファ' },
  { id: 'ja_kata_ta',  char: 'タ', word: 'タクシー' },
  { id: 'ja_kata_ti',  char: 'チ', word: 'チーズ' },
  { id: 'ja_kata_tu',  char: 'ツ', word: 'ツリー' },
  { id: 'ja_kata_te',  char: 'テ', word: 'テント' },
  { id: 'ja_kata_to',  char: 'ト', word: 'トマト' },
  { id: 'ja_kata_na',  char: 'ナ', word: 'ナイフ' },
  { id: 'ja_kata_ni',  char: 'ニ', word: 'ニット' },
  { id: 'ja_kata_nu',  char: 'ヌ', word: 'ヌードル' },
  { id: 'ja_kata_ne',  char: 'ネ', word: 'ネクタイ' },
  { id: 'ja_kata_no',  char: 'ノ', word: 'ノート' },
  { id: 'ja_kata_ha',  char: 'ハ', word: 'ハム' },
  { id: 'ja_kata_hi',  char: 'ヒ', word: 'ピアノ' },
  { id: 'ja_kata_hu',  char: 'フ', word: 'フラミンゴ' },
  { id: 'ja_kata_he',  char: 'ヘ', word: 'ヘリコプター' },
  { id: 'ja_kata_ho',  char: 'ホ', word: 'ホテル' },
  { id: 'ja_kata_ma',  char: 'マ', word: 'マント' },
  { id: 'ja_kata_mi',  char: 'ミ', word: 'ミルク' },
  { id: 'ja_kata_mu',  char: 'ム', word: 'ムース' },
  { id: 'ja_kata_me',  char: 'メ', word: 'メロン' },
  { id: 'ja_kata_mo',  char: 'モ', word: 'モノレール' },
  { id: 'ja_kata_ya',  char: 'ヤ', word: 'ヨット' },
  { id: 'ja_kata_yu',  char: 'ユ', word: 'ユーフォー' },
  { id: 'ja_kata_yo',  char: 'ヨ', word: 'ヨーヨー' },
  { id: 'ja_kata_ra',  char: 'ラ', word: 'ライオン' },
  { id: 'ja_kata_ri',  char: 'リ', word: 'リボン' },
  { id: 'ja_kata_ru',  char: 'ル', word: 'ルビー' },
  { id: 'ja_kata_re',  char: 'レ', word: 'レモン' },
  { id: 'ja_kata_ro',  char: 'ロ', word: 'ロボット' },
  { id: 'ja_kata_wa',  char: 'ワ', word: 'ワニ' },
  { id: 'ja_kata_wo',  char: 'ヲ', word: 'パンヲタベル' },
  { id: 'ja_kata_n',   char: 'ン', word: 'パンダ' },
];

const ALL_ITEMS = [...HIRA_ITEMS, ...KATA_ITEMS];

async function fetchAudio(text, lang = 'ja') {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for "${text}"`);
  }
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`Downloading Japanese audio for ${ALL_ITEMS.length} characters (${ALL_ITEMS.length * 2} files)...`);
  let count = 0;

  for (const item of ALL_ITEMS) {
    // 1. Character name (the character itself, read naturally)
    const nameFile = path.join(outDir, `${item.id}_name.mp3`);
    if (!fs.existsSync(nameFile)) {
      try {
        const buf = await fetchAudio(item.char);
        fs.writeFileSync(nameFile, buf);
        process.stdout.write(`✓`);
        count++;
        await sleep(150);
      } catch (err) {
        process.stdout.write(`✗`);
        console.error(`\n  Error name ${item.id}: ${err.message}`);
      }
    } else {
      process.stdout.write(`·`);
    }

    // 2. Example word
    const wordFile = path.join(outDir, `${item.id}_word.mp3`);
    if (!fs.existsSync(wordFile)) {
      try {
        const buf = await fetchAudio(item.word);
        fs.writeFileSync(wordFile, buf);
        process.stdout.write(`✓`);
        count++;
        await sleep(150);
      } catch (err) {
        process.stdout.write(`✗`);
        console.error(`\n  Error word ${item.id}: ${err.message}`);
      }
    } else {
      process.stdout.write(`·`);
    }
  }

  console.log(`\n\nDone! Downloaded ${count} new files to public/audio/japanese/`);
}

main().catch(console.error);
