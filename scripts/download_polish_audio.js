// scripts/download_polish_audio.js
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/audio/polish');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Authentic Polish primary school educational map
const POLISH_AUDIO_ITEMS = [
  { id: 'pl_a', nameQuery: 'a', soundQuery: 'a', wordQuery: 'Ananas' },
  { id: 'pl_a_ogonek', nameQuery: 'ą', soundQuery: 'ą', wordQuery: 'Wąż' },
  { id: 'pl_b', nameQuery: 'be', soundQuery: 'by', wordQuery: 'Balon' },
  { id: 'pl_c', nameQuery: 'ce', soundQuery: 'cy', wordQuery: 'Cytryna' },
  { id: 'pl_c_acute', nameQuery: 'cie', soundQuery: 'ć', wordQuery: 'Ćma' },
  { id: 'pl_d', nameQuery: 'de', soundQuery: 'dy', wordQuery: 'Dom' },
  { id: 'pl_e', nameQuery: 'e', soundQuery: 'e', wordQuery: 'Ekran' },
  { id: 'pl_e_ogonek', nameQuery: 'ę', soundQuery: 'ę', wordQuery: 'Ręka' },
  { id: 'pl_g', nameQuery: 'gie', soundQuery: 'gy', wordQuery: 'Gruszka' },
  { id: 'pl_k', nameQuery: 'ka', soundQuery: 'ky', wordQuery: 'Kot' },
  { id: 'pl_l', nameQuery: 'el', soundQuery: 'ly', wordQuery: 'Lody' },
  { id: 'pl_l_stroke', nameQuery: 'eł', soundQuery: 'ło', wordQuery: 'Łódź' },
  { id: 'pl_m', nameQuery: 'em', soundQuery: 'my', wordQuery: 'Motyl' },
  { id: 'pl_n', nameQuery: 'en', soundQuery: 'ny', wordQuery: 'Noga' },
  { id: 'pl_o', nameQuery: 'o', soundQuery: 'o', wordQuery: 'Oko' },
  { id: 'pl_o_acute', nameQuery: 'o z kreską', soundQuery: 'u', wordQuery: 'Ogród' },
  { id: 'pl_p', nameQuery: 'pe', soundQuery: 'py', wordQuery: 'Pies' },
  { id: 'pl_r', nameQuery: 'er', soundQuery: 'ry', wordQuery: 'Rower' },
  { id: 'pl_s', nameQuery: 'es', soundQuery: 'sy', wordQuery: 'Słońce' },
  { id: 'pl_s_acute', nameQuery: 'eś', soundQuery: 'ś', wordQuery: 'Ślimak' },
  { id: 'pl_t', nameQuery: 'te', soundQuery: 'ty', wordQuery: 'Tort' },
  { id: 'pl_u', nameQuery: 'u', soundQuery: 'u', wordQuery: 'Ucho' },
  { id: 'pl_w', nameQuery: 'wu', soundQuery: 'wy', wordQuery: 'Woda' },
  { id: 'pl_z', nameQuery: 'zet', soundQuery: 'zy', wordQuery: 'Zebra' },
  { id: 'pl_z_acute', nameQuery: 'ziet', soundQuery: 'ź', wordQuery: 'Źrebak' },
  { id: 'pl_z_dot', nameQuery: 'żet', soundQuery: 'że', wordQuery: 'Żyrafa' }
];

async function fetchAudio(text, lang = 'pl') {
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
  console.log(`Downloading authentic Polish audio for ${POLISH_AUDIO_ITEMS.length} letters...`);

  for (const item of POLISH_AUDIO_ITEMS) {
    // 1. Letter Name
    const nameFile = path.join(outDir, `${item.id}_name.mp3`);
    if (!fs.existsSync(nameFile)) {
      try {
        const buf = await fetchAudio(item.nameQuery);
        fs.writeFileSync(nameFile, buf);
        process.stdout.write(`[name: ${item.nameQuery}] `);
        await sleep(150);
      } catch (err) {
        console.error(`\nError name ${item.id}:`, err.message);
      }
    }

    // 2. Letter Sound / Głoska
    const soundFile = path.join(outDir, `${item.id}_sound.mp3`);
    if (!fs.existsSync(soundFile)) {
      try {
        const buf = await fetchAudio(item.soundQuery);
        fs.writeFileSync(soundFile, buf);
        process.stdout.write(`[sound: ${item.soundQuery}] `);
        await sleep(150);
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
        await sleep(150);
      } catch (err) {
        console.error(`\nError word ${item.id}:`, err.message);
      }
    }

    console.log(`✔ Finished ${item.id}`);
  }

  console.log('All Polish audio downloaded successfully!');
}

main().catch(err => {
  console.error('Download failed:', err);
});
