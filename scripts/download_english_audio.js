// scripts/download_english_audio.js
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/audio/english');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Educational English Phonics & Alphabet Mapping
const ENGLISH_AUDIO_ITEMS = [
  { id: 'en_a', nameQuery: 'A', soundQuery: 'a', soundLang: 'it', wordQuery: 'Apple' },
  { id: 'en_b', nameQuery: 'B', soundQuery: 'buh', wordQuery: 'Bear' },
  { id: 'en_c', nameQuery: 'C', soundQuery: 'kuh', wordQuery: 'Cat' },
  { id: 'en_d', nameQuery: 'D', soundQuery: 'duh', wordQuery: 'Dog' },
  { id: 'en_e', nameQuery: 'E', soundQuery: 'eh', wordQuery: 'Elephant' },
  { id: 'en_f', nameQuery: 'F', soundQuery: 'fuh', wordQuery: 'Fox' },
  { id: 'en_g', nameQuery: 'G', soundQuery: 'guh', wordQuery: 'Gorilla' },
  { id: 'en_h', nameQuery: 'H', soundQuery: 'huh', wordQuery: 'Hat' },
  // For 'I': name is 'I' (pronounced eye /aɪ/), sound is pure short /ɪ/ ('イ' sound, query 'i' with tl=pl)
  { id: 'en_i', nameQuery: 'I', soundQuery: 'i', soundLang: 'pl', wordQuery: 'Igloo' },
  { id: 'en_j', nameQuery: 'J', soundQuery: 'juh', wordQuery: 'Jam' },
  { id: 'en_k', nameQuery: 'K', soundQuery: 'kuh', wordQuery: 'Kite' },
  { id: 'en_l', nameQuery: 'L', soundQuery: 'luh', wordQuery: 'Lion' },
  { id: 'en_m', nameQuery: 'M', soundQuery: 'muh', wordQuery: 'Monkey' },
  { id: 'en_n', nameQuery: 'N', soundQuery: 'nuh', wordQuery: 'Nest' },
  { id: 'en_o', nameQuery: 'O', soundQuery: 'aw', wordQuery: 'Octopus' },
  { id: 'en_p', nameQuery: 'P', soundQuery: 'puh', wordQuery: 'Pig' },
  { id: 'en_q', nameQuery: 'Q', soundQuery: 'qua', soundLang: 'it', wordQuery: 'Queen' },
  { id: 'en_r', nameQuery: 'R', soundQuery: 'ruh', wordQuery: 'Rabbit' },
  { id: 'en_s', nameQuery: 'S', soundQuery: 'suh', wordQuery: 'Sun' },
  { id: 'en_t', nameQuery: 'T', soundQuery: 'tuh', wordQuery: 'Tiger' },
  { id: 'en_u', nameQuery: 'U', soundQuery: 'uh', wordQuery: 'Umbrella' },
  { id: 'en_v', nameQuery: 'V', soundQuery: 'vuh', wordQuery: 'Van' },
  { id: 'en_w', nameQuery: 'W', soundQuery: 'wuh', wordQuery: 'Window' },
  { id: 'en_x', nameQuery: 'X', soundQuery: 'ks', soundLang: 'pl', wordQuery: 'Xylophone' },
  { id: 'en_y', nameQuery: 'Y', soundQuery: 'yuh', wordQuery: 'Yak' },
  { id: 'en_z', nameQuery: 'Z', soundQuery: 'zy', soundLang: 'pl', wordQuery: 'Zebra' }
];

async function fetchAudio(text, lang = 'en') {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${text}`);
  }
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`Downloading authentic English audio for ${ENGLISH_AUDIO_ITEMS.length} letters...`);

  for (const item of ENGLISH_AUDIO_ITEMS) {
    // 1. Letter Name
    const nameFile = path.join(outDir, `${item.id}_name.mp3`);
    if (!fs.existsSync(nameFile)) {
      try {
        const buf = await fetchAudio(item.nameQuery);
        fs.writeFileSync(nameFile, buf);
        process.stdout.write(`[name: ${item.nameQuery}] `);
        await sleep(120);
      } catch (err) {
        console.error(`\nError name ${item.id}:`, err.message);
      }
    }

    // 2. Letter Sound / Phonics
    const soundFile = path.join(outDir, `${item.id}_sound.mp3`);
    if (!fs.existsSync(soundFile)) {
      try {
        const buf = await fetchAudio(item.soundQuery, item.soundLang || 'en');
        fs.writeFileSync(soundFile, buf);
        process.stdout.write(`[sound: ${item.soundQuery}] `);
        await sleep(120);
      } catch (err) {
        console.error(`\nError sound ${item.id}:`, err.message);
      }
    }

    // 3. Anchor Word
    const wordFile = path.join(outDir, `${item.id}_word.mp3`);
    if (!fs.existsSync(wordFile)) {
      try {
        const buf = await fetchAudio(item.wordQuery);
        fs.writeFileSync(wordFile, buf);
        process.stdout.write(`[word: ${item.wordQuery}] `);
        await sleep(120);
      } catch (err) {
        console.error(`\nError word ${item.id}:`, err.message);
      }
    }
  }

  console.log('\nAll English audio files downloaded successfully to public/audio/english/');
}

main().catch(console.error);
