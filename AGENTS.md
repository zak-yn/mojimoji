# mojimoji (もじもじ) — Kids Multilingual Character Learning PWA

An anti-AI, artisanal multilingual writing and listening learning app designed for 6-year-olds.
Supports Japanese Hiragana/Katakana, English Alphabet, and Polish Alphabet with zero-stress multi-device sync.

---

## 1. Core Architecture & Tech Stack
- **Framework**: React 19 + TypeScript + Vite 6
- **Repository**: [https://github.com/zak-yn/mojimoji](https://github.com/zak-yn/mojimoji)
- **Live Online URL**: [https://zak-yn.github.io/mojimoji/](https://zak-yn.github.io/mojimoji/) (GitHub Pages)
- **Styling**: Vanilla CSS Modules & CSS Design System (Warm Nordic toy palette `#FAF8F5`, terracotta, sage, mustard, deep navy).
- **Stroke Engine**: SVG Path vector definitions with `stroke-dashoffset` stroke-order animation + Canvas 2D touch tracer.
- **Audio Engine**: Web Audio API synthesized organic marimba/glockenspiel SE + Web Speech API multi-language TTS (`ja-JP`, `en-US`, `pl-PL`).
- **Data Persistence & Sync**: Local-first IndexedDB/LocalStorage with Family Passcode (合言葉) & QR Code cloud sync adapter.
- **PWA**: Mobile touch-optimized, standalone display, responsive for iPad, iPhone, and Android.

---

## 2. Directory Structure
```
mojimoji/
├── public/              # PWA manifest, service worker, touch icons
├── src/
│   ├── data/            # Character sets (Hiragana, Katakana, English, Polish)
│   ├── types/           # Type definitions for character sets & sync
│   ├── sound/           # Web Audio API marimba/glockenspiel synthesizer
│   ├── speech/          # Web Speech API TTS helper
│   ├── components/
│   │   ├── Navigation/  # Top bar, back button, audio toggles
│   │   ├── Home/        # Category selector (Hiragana, Katakana, EN, PL) & Mode
│   │   ├── Tracer/      # Stroke animation & Finger trace canvas
│   │   ├── Quiz/        # Listening & visual quiz mode
│   │   ├── StickerBook/ # Interactive sticker board with drag & drop
│   │   └── SyncModal/   # Family passcode & QR code multi-device sync
│   ├── App.tsx          # Router & state manager
│   ├── main.tsx         # Entry point
│   └── index.css        # Clean anti-AI design system tokens
```

---

## 3. Anti-AI Design Mandate
- **No Neon/Glows**: Calm natural paper `#FAF8F5`, soft clay cards `#FFFFFF`, terracotta `#D96B43`, sage `#5A826D`, mustard `#E2A03F`.
- **No OS Emoji Clutter**: Minimalist 1.5px stroke vector icons (Lucide) and custom SVG child-friendly illustrations.
- **Restrained Radiuses**: 12px–16px subtle tactile curvature for cards; no oversized pill blobs.
- **Target Audience UX (6 Years Old)**: Large legible typography, hiragana chrome, high tactile responsiveness, celebratory sound feedback.

---

## 4. Verification Loop
1. `npm run build`: Verify TypeScript compilation and Vite bundling with zero errors.
2. `npm run dev`: Launch local server, verify in browser with console check.
3. Sensory test: Touch/mouse tracing, audio playback, test quiz, sticker placement, sync code generation.

---

## 5. Changelog
- **2026-09-28**: Initial release of mojimoji PWA. Hiragana, Katakana, English, and Polish character sets, stroke-order animator, tracer canvas, listening test, sticker book, and family passcode sync.
- **2026-09-28 (Fix)**: Replaced imprecise manual stroke approximations with official KanjiVG (Japanese educational standard CC BY-SA 3.0) stroke vectors for Hiragana/Katakana and geometric typographies for English/Polish. SVG viewBox standardized to 109x109.
- **2026-09-28 (Fix)**: Resolved stroke animation multiple starting point glitch on long paths (あ, え, お) by applying SVG 2 `pathLength="1"` normalization with `stroke-dasharray: 1` and `stroke-dashoffset: 1 -> 0`. Each stroke now animates as a single continuous pen trail.
- **2026-09-28 (Feature & Audio Fix)**: Expanded full character sets to 46 Hiragana, 46 Katakana, 26 English (A-Z with Jolly Phonics), and 26 Polish characters. Solved Polish pronunciation failure (caused by OS lacking pl-PL TTS voice packs) by bundling authentic native Polish MP3 audio for all letter names, phonemes (głoski), and vocabulary words in `/audio/polish/`.
- **2026-09-28 (UX & Pedagogical Fix)**: Updated B (EN/PL) to authentic 2-stroke standard (Frog Jump Capital: Big line down -> jump to top -> continuous double curve) per Handwriting Without Tears. Added SVG numbered start markers (①, ②) and a flexible child-friendly 「できた！」 action button so 6yo learners are never blocked by rigid finger-lift counts.
- **2026-09-28 (Typography & UX Fix)**: Corrected Polish Ogonek (tail) orientation on Ą and Ę to curve rightward as required by authentic Polish handwriting. Resolved start-marker visual overlap (e.g. apex of A where stroke 1 & 2 meet) by displaying the current active stroke with a pulsing ring and suppressing overlapping future badges until active.
- **2026-09-28 (Pedagogy & Anti-Bias Fix)**: Completely removed Japanese Katakana reading/pronunciation approximations for foreign languages (English & Polish) across all cards, datasets, and buttons to prevent Katakana accent habituation in 6yo learners. Learning is conducted purely through high-fidelity native auditory listening, displaying only the pure letter name (e.g., `A`, `Ó`), pure phoneme symbol (`/æ/`, `[u]`), and word meaning (`りんご`, `庭 (にわ)`).
- **2026-09-28 (Audio - Japanese Natural Voice)**: Replaced Web Speech API (OS TTS) for Japanese Hiragana/Katakana with pre-recorded Google TTS MP3s. Downloaded 184 files (46 Hiragana + 46 Katakana × 2 parts: char + word) to `/audio/japanese/`. `tts.ts` now resolves `hira_*`/`kata_*` IDs to `ja_hira_*`/`ja_kata_*` audio paths with automatic Web Speech fallback on MP3 error.
- **2026-09-29 (Fix - KanjiVG Authentic Stroke Data)**: Downloaded and verified 100% authentic KanjiVG SVG stroke vectors from GitHub for all 46 Hiragana and 46 Katakana (eliminating previously corrupted/approximated paths like 3-stroke う and 4-stroke え). Updated `src/data/characters.ts` so all kana now have authentic stroke counts (う: 2画, え: 2画, etc.) and stroke paths matching the 109x109 viewBox standard.
- **2026-09-29 (UX - Practice Completion on Final Character)**: Replaced disabled 「つぎの もじ」 on the final character (46/46 or 26/26) with an interactive 「おわる」 action button and 「れんしゅうを おわる」 modal button with celebratory audio and clean navigation return to the category home screen.
- **2026-09-29 (DevOps - GitHub Repo & Pages Live Deployment)**: Created public repository `zak-yn/mojimoji` on GitHub, configured Vite base path resolution for subpath hosting, and published live PWA to GitHub Pages (`https://zak-yn.github.io/mojimoji/`).
- **2026-09-29 (Mobile UX - Pixel & Smartphone Responsive Overhaul)**: Overhauled mobile layout for Google Pixel and narrow smartphones. Eliminated duplicate sticky navbar in practice, quiz, and sticker screens in favor of single unified contextual headers (saving ~65px vertical space). Implemented 100dvh zero-scroll layout with auto-scaling 1:1 canvas stage, `touch-action: none` gesture protection, responsive text labels (`まえ`/`つぎ` on mobile, `まえの もじ`/`つぎの もじ` on desktop), and nowrap protections preventing awkward vertical letter-wrapping across all UI elements.
- **2026-09-29 (Feature - Numbers & Lowercase Alphabets)**: Added Numbers (すうじ 0〜9, 10 characters with standard Japanese stroke paths and speech), English Lowercase (abc えいご こもじ, 26 characters with Jolly Phonics anchor words), and Polish Lowercase (polski こもじ, 26 characters with authentic native Polish MP3 audio and diacritics ą, ć, ę, ł, ó, ś, ź, ż). Added category filter chips (すべて, にほんご, すうじ, えいご, ポーランドご) on the home screen for intuitive navigation.
- **2026-09-29 (Quality & Pedagogy - Lowercase & Number Stroke Order Overhaul)**: Overhauled all lowercase letters and numbers according to standard kindergarten and elementary school handwriting conventions. Corrected `a` to 1 continuous stroke (starts at 2 o'clock, curves counter-clockwise around the oval, retraces down with a subtle flick); corrected `e` to 1 continuous stroke (horizontal crossbar then outer loop); corrected `g` to 1 continuous stroke (handwriting single-story oval with bottom descender loop, eliminating 3-stroke book print); corrected `k` to 2 strokes (tall stem, then `<`); corrected `u`, `v`, `w`, `z` to continuous 1-stroke paths; and corrected number `7` to 1 stroke (horizontal then diagonal) and `8` to top-center S-curve 1 stroke. Updated Polish lowercase diacritics (`ą`, `ę`, `ć`, `ł`, `ó`, `ś`, `ź`, `ż` to 2 strokes).
- **2026-09-30 (Pedagogy - Continuous 1-Stroke Lowercase m, n, h, r)**:
  - Overhauled lowercase `m` (from 3 strokes to 1 continuous stroke), `n` (from 2 strokes to 1 continuous stroke), `h` (from 2 strokes to 1 continuous stroke), and `r` (from 2 strokes to 1 continuous stroke) across both English and Polish datasets.
  - Aligned with modern elementary penmanship curricula (e.g., Handwriting Without Tears "dive and swim" family, Japanese elementary English textbooks) where downstrokes retrace smoothly up the stem without lifting the pen, delivering a seamless tracing experience.
- **2026-09-30 (Pedagogy & UX - Completion Audio Gating for Modal Next Button)**:
  - Gated the celebration modal's action button (`#btn-next-after-complete` / 「つぎの もじへ」) until the character's full pronunciation chain (Name → Sound → Word) finishes playing.
  - Displays an active listening state (`おとを きいてね...` with pulsing volume indicator) while speech is active, transitioning dynamically to active green (`つぎの もじへ →`) upon audio completion.
- **2026-09-30 (Pedagogy & Audio - English & Polish Phonics Pure Sounds Overhaul & Live Deployment)**:
  - Eliminated corrupted TTS phonics sounds (buh, kuh, duh in English; by, cy, dy in Polish).
  - English: Replaced all 26 letter sounds with authentic studio-recorded Synthetic Phonics Pure Sounds (no schwa /ə/).
  - Polish: Replaced all 26 głoski with pure phonemes (7 pure vowels, 13 universal stops/continuants, and 6 Polish-specific phonemes [ts], [tɕ], [ɕ], [ʑ], [ʐ], [r] from Wikimedia Commons).
  - Added cache-busting version parameter (`?v=20260930_pure`) in `tts.ts` to prevent stale browser audio caching on mobile browsers.
  - Successfully built and deployed to production GitHub Pages (`gh-pages` branch, commit `1bc09c0`). Verified HTTP 200 responses and byte parity live in browser.
- **2026-09-30 (Tooling & Audio - Interactive Audio Checker & 26 UK British Phonics Candidates)**:
  - Downloaded authentic British studio recordings (UK Jolly Phonics pure sounds, A-Z) into `/audio/candidates/uk_jolly/`.
  - Built standalone interactive review tool [`public/audio-checker.html`](file:///c:/Users/wonsh/antigravity_projects/mojimoji/public/audio-checker.html) with 1-click side-by-side audition (Candidate 1 UK Jolly vs Candidate 2 current sound vs Letter Name vs Word), speed selector (0.8x/1.0x/1.2x), and consecutive A-Z autoplay.
  - Published live to [https://zak-yn.github.io/mojimoji/audio-checker.html](https://zak-yn.github.io/mojimoji/audio-checker.html).
