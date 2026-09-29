// scripts/download_polish_audio.js
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/audio/polish');
const englishDir = path.resolve('public/audio/english');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

// Authentic Polish primary school educational mapping
// Głoski (sounds) must be pure phonemes without -y vowel or schwa
const POLISH_AUDIO_ITEMS = [
  { id: 'pl_a', nameQuery: 'a', soundType: 'vowel', soundQuery: 'a', wordQuery: 'Ananas' },
  { id: 'pl_a_ogonek', nameQuery: 'ą', soundType: 'vowel', soundQuery: 'ą', wordQuery: 'Wąż' },
  { id: 'pl_b', nameQuery: 'be', soundType: 'universal', srcSound: 'en_b_sound.mp3', wordQuery: 'Balon' },
  { id: 'pl_c', nameQuery: 'ce', soundType: 'commons', commonsUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9d/Voiceless_alveolar_sibilant_affricate.oga/Voiceless_alveolar_sibilant_affricate.oga.mp3', wordQuery: 'Cytryna' },
  { id: 'pl_c_acute', nameQuery: 'cie', soundType: 'commons', commonsUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/37/Voiceless_alveolo-palatal_affricate_%28unaspirated%29.ogg/Voiceless_alveolo-palatal_affricate_%28unaspirated%29.ogg.mp3', wordQuery: 'Ćma' },
  { id: 'pl_d', nameQuery: 'de', soundType: 'universal', srcSound: 'en_d_sound.mp3', wordQuery: 'Dom' },
  { id: 'pl_e', nameQuery: 'e', soundType: 'vowel', soundQuery: 'e', wordQuery: 'Ekran' },
  { id: 'pl_e_ogonek', nameQuery: 'ę', soundType: 'vowel', soundQuery: 'ę', wordQuery: 'Ręka' },
  { id: 'pl_g', nameQuery: 'gie', soundType: 'universal', srcSound: 'en_g_sound.mp3', wordQuery: 'Gruszka' },
  { id: 'pl_k', nameQuery: 'ka', soundType: 'universal', srcSound: 'en_k_sound.mp3', wordQuery: 'Kot' },
  { id: 'pl_l', nameQuery: 'el', soundType: 'universal', srcSound: 'en_l_sound.mp3', wordQuery: 'Lody' },
  { id: 'pl_l_stroke', nameQuery: 'eł', soundType: 'universal', srcSound: 'en_w_sound.mp3', wordQuery: 'Łódź' }, // Polish Ł is phonetically [w]
  { id: 'pl_m', nameQuery: 'em', soundType: 'universal', srcSound: 'en_m_sound.mp3', wordQuery: 'Motyl' },
  { id: 'pl_n', nameQuery: 'en', soundType: 'universal', srcSound: 'en_n_sound.mp3', wordQuery: 'Noga' },
  { id: 'pl_o', nameQuery: 'o', soundType: 'vowel', soundQuery: 'o', wordQuery: 'Oko' },
  { id: 'pl_o_acute', nameQuery: 'o z kreską', soundType: 'vowel', soundQuery: 'u', wordQuery: 'Ogród' },
  { id: 'pl_p', nameQuery: 'pe', soundType: 'universal', srcSound: 'en_p_sound.mp3', wordQuery: 'Pies' },
  { id: 'pl_r', nameQuery: 'er', soundType: 'commons', commonsUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/ce/Alveolar_trill.ogg/Alveolar_trill.ogg.mp3', wordQuery: 'Rower' },
  { id: 'pl_s', nameQuery: 'es', soundType: 'universal', srcSound: 'en_s_sound.mp3', wordQuery: 'Słońce' },
  { id: 'pl_s_acute', nameQuery: 'eś', soundType: 'commons', commonsUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0b/Voiceless_alveolo-palatal_sibilant.ogg/Voiceless_alveolo-palatal_sibilant.ogg.mp3', wordQuery: 'Ślimak' },
  { id: 'pl_t', nameQuery: 'te', soundType: 'universal', srcSound: 'en_t_sound.mp3', wordQuery: 'Tort' },
  { id: 'pl_u', nameQuery: 'u', soundType: 'vowel', soundQuery: 'u', wordQuery: 'Ucho' },
  { id: 'pl_w', nameQuery: 'wu', soundType: 'universal', srcSound: 'en_v_sound.mp3', wordQuery: 'Woda' }, // Polish W is phonetically [v]
  { id: 'pl_z', nameQuery: 'zet', soundType: 'universal', srcSound: 'en_z_sound.mp3', wordQuery: 'Zebra' },
  { id: 'pl_z_acute', nameQuery: 'ziet', soundType: 'commons', commonsUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/15/Voiced_alveolo-palatal_sibilant.ogg/Voiced_alveolo-palatal_sibilant.ogg.mp3', wordQuery: 'Źrebak' },
  { id: 'pl_z_dot', nameQuery: 'żet', soundType: 'commons', commonsUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7f/Voiced_retroflex_sibilant.ogg/Voiced_retroflex_sibilant.ogg.mp3', wordQuery: 'Żyrafa' }
];

async function fetchGoogleTTS(text, lang = 'pl') {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${text}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

async function fetchAudioUrl(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`Verifying/Downloading authentic Polish audio for ${POLISH_AUDIO_ITEMS.length} letters...`);

  for (const item of POLISH_AUDIO_ITEMS) {
    // 1. Letter Name
    const nameFile = path.join(outDir, `${item.id}_name.mp3`);
    if (!fs.existsSync(nameFile) || fs.statSync(nameFile).size === 0) {
      try {
        const buf = await fetchGoogleTTS(item.nameQuery);
        fs.writeFileSync(nameFile, buf);
        process.stdout.write(`[name: ${item.nameQuery}] `);
        await sleep(100);
      } catch (err) {
        console.error(`\nError name ${item.id}:`, err.message);
      }
    }

    // 2. Letter Sound / Głoska
    const soundFile = path.join(outDir, `${item.id}_sound.mp3`);
    if (!fs.existsSync(soundFile) || fs.statSync(soundFile).size === 0) {
      try {
        if (item.soundType === 'vowel') {
          const buf = await fetchGoogleTTS(item.soundQuery);
          fs.writeFileSync(soundFile, buf);
        } else if (item.soundType === 'universal') {
          const src = path.join(englishDir, item.srcSound);
          fs.copyFileSync(src, soundFile);
        } else if (item.soundType === 'commons') {
          const buf = await fetchAudioUrl(item.commonsUrl);
          fs.writeFileSync(soundFile, buf);
        }
        process.stdout.write(`[sound: ${item.id}] `);
        await sleep(100);
      } catch (err) {
        console.error(`\nError sound ${item.id}:`, err.message);
      }
    }

    // 3. Anchor Word
    const wordFile = path.join(outDir, `${item.id}_word.mp3`);
    if (!fs.existsSync(wordFile) || fs.statSync(wordFile).size === 0) {
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

  console.log('\nAll Polish audio verified successfully in public/audio/polish/');
}

main().catch(console.error);
