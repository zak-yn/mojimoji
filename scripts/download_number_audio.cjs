const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.resolve('public/audio/numbers');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const NUMBERS = [
  { digit: '0', id: 'num_0', ja: 'ぜろ', en: 'zero', pl: 'zero' },
  { digit: '1', id: 'num_1', ja: 'いち', en: 'one', pl: 'jeden' },
  { digit: '2', id: 'num_2', ja: 'に', en: 'two', pl: 'dwa' },
  { digit: '3', id: 'num_3', ja: 'さん', en: 'three', pl: 'trzy' },
  { digit: '4', id: 'num_4', ja: 'よん', en: 'four', pl: 'cztery' },
  { digit: '5', id: 'num_5', ja: 'ご', en: 'five', pl: 'pięć' },
  { digit: '6', id: 'num_6', ja: 'ろく', en: 'six', pl: 'sześć' },
  { digit: '7', id: 'num_7', ja: 'なな', en: 'seven', pl: 'siedem' },
  { digit: '8', id: 'num_8', ja: 'はち', en: 'eight', pl: 'osiem' },
  { digit: '9', id: 'num_9', ja: 'きゅう', en: 'nine', pl: 'dziewięć' },
];

function fetchAudio(text, lang) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${text} (${lang})`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Downloading multilingual number audio (JA, EN, PL)...');
  for (const item of NUMBERS) {
    // JA
    try {
      const jaBuf = await fetchAudio(item.ja, 'ja');
      fs.writeFileSync(path.join(outDir, `${item.id}_ja.mp3`), jaBuf);
      console.log(`Saved ${item.id}_ja.mp3 (${item.ja})`);
    } catch (e) {
      console.error(`Failed ${item.id}_ja:`, e.message);
    }
    await sleep(200);

    // EN
    try {
      const enBuf = await fetchAudio(item.en, 'en');
      fs.writeFileSync(path.join(outDir, `${item.id}_en.mp3`), enBuf);
      console.log(`Saved ${item.id}_en.mp3 (${item.en})`);
    } catch (e) {
      console.error(`Failed ${item.id}_en:`, e.message);
    }
    await sleep(200);

    // PL
    try {
      const plBuf = await fetchAudio(item.pl, 'pl');
      fs.writeFileSync(path.join(outDir, `${item.id}_pl.mp3`), plBuf);
      console.log(`Saved ${item.id}_pl.mp3 (${item.pl})`);
    } catch (e) {
      console.error(`Failed ${item.id}_pl:`, e.message);
    }
    await sleep(200);
  }
  console.log('Done downloading all number audio files!');
}

run();
