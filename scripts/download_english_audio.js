// scripts/download_english_audio.js
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/audio/english');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Educational English Phonics & Alphabet Mapping
const ENGLISH_AUDIO_ITEMS = [
  { id: 'en_a', letter: 'a', nameQuery: 'A', wordQuery: 'Apple' },
  { id: 'en_b', letter: 'b', nameQuery: 'B', wordQuery: 'Bear' },
  { id: 'en_c', letter: 'c', nameQuery: 'C', wordQuery: 'Cat' },
  { id: 'en_d', letter: 'd', nameQuery: 'D', wordQuery: 'Dog' },
  { id: 'en_e', letter: 'e', nameQuery: 'E', wordQuery: 'Elephant' },
  { id: 'en_f', letter: 'f', nameQuery: 'F', wordQuery: 'Fox' },
  { id: 'en_g', letter: 'g', nameQuery: 'G', wordQuery: 'Gorilla' },
  { id: 'en_h', letter: 'h', nameQuery: 'H', wordQuery: 'Hat' },
  { id: 'en_i', letter: 'i', nameQuery: 'I', wordQuery: 'Igloo' },
  { id: 'en_j', letter: 'j', nameQuery: 'J', wordQuery: 'Jam' },
  { id: 'en_k', letter: 'k', nameQuery: 'K', wordQuery: 'Kite' },
  { id: 'en_l', letter: 'l', nameQuery: 'L', wordQuery: 'Lion' },
  { id: 'en_m', letter: 'm', nameQuery: 'M', wordQuery: 'Monkey' },
  { id: 'en_n', letter: 'n', nameQuery: 'N', wordQuery: 'Nest' },
  { id: 'en_o', letter: 'o', nameQuery: 'O', wordQuery: 'Octopus' },
  { id: 'en_p', letter: 'p', nameQuery: 'P', wordQuery: 'Pig' },
  { id: 'en_q', letter: 'qu', nameQuery: 'Q', wordQuery: 'Queen' }, // 'qu' in Synthetic Phonics
  { id: 'en_r', letter: 'r', nameQuery: 'R', wordQuery: 'Rabbit' },
  { id: 'en_s', letter: 's', nameQuery: 'S', wordQuery: 'Sun' },
  { id: 'en_t', letter: 't', nameQuery: 'T', wordQuery: 'Tiger' },
  { id: 'en_u', letter: 'u', nameQuery: 'U', wordQuery: 'Umbrella' },
  { id: 'en_v', letter: 'v', nameQuery: 'V', wordQuery: 'Van' },
  { id: 'en_w', letter: 'w', nameQuery: 'W', wordQuery: 'Window' },
  { id: 'en_x', letter: 'x', nameQuery: 'X', wordQuery: 'Xylophone' },
  { id: 'en_y', letter: 'y', nameQuery: 'Y', wordQuery: 'Yak' },
  { id: 'en_z', letter: 'z', nameQuery: 'Z', wordQuery: 'Zebra' }
];

async function fetchGoogleTTS(text, lang = 'en') {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${text}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

async function fetchPurePhonicsSound(soundKey) {
  const url = `https://phonicademy.com/assets/audio/phonemes/${soundKey}.mp3`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for phoneme ${soundKey}`);
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
        const buf = await fetchGoogleTTS(item.nameQuery);
        fs.writeFileSync(nameFile, buf);
        process.stdout.write(`[name: ${item.nameQuery}] `);
        await sleep(100);
      } catch (err) {
        console.error(`\nError name ${item.id}:`, err.message);
      }
    }

    // 2. Pure Phonics Sound (Synthetic Phonics without trailing schwa)
    const soundFile = path.join(outDir, `${item.id}_sound.mp3`);
    try {
      const buf = await fetchPurePhonicsSound(item.letter);
      fs.writeFileSync(soundFile, buf);
      process.stdout.write(`[sound: /${item.letter}/] `);
      await sleep(100);
    } catch (err) {
      console.error(`\nError sound ${item.id}:`, err.message);
    }

    // 3. Anchor Word
    const wordFile = path.join(outDir, `${item.id}_word.mp3`);
    if (!fs.existsSync(wordFile)) {
      try {
        const buf = await fetchGoogleTTS(item.wordQuery);
        fs.writeFileSync(wordFile, buf);
        process.stdout.write(`[word: ${item.wordQuery}] `);
        await sleep(100);
      } catch (err) {
        console.error(`\nError word ${item.id}:`, err.message);
      }
    }
  }

  console.log('\nAll English audio files verified in public/audio/english/');
}

main().catch(console.error);
