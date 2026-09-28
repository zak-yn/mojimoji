// scripts/build_full_datasets.js
import fs from 'fs';

// 46 Standard Hiragana table with vocabulary for 6-year-olds
const HIRA_SPECS = [
  { char: 'あ', hex: '3042', romaji: 'a', word: 'あさがお', trans: 'あさがお' },
  { char: 'い', hex: '3044', romaji: 'i', word: 'いちご', trans: 'いちご' },
  { char: 'う', hex: '3046', romaji: 'u', word: 'うさぎ', trans: 'うさぎ' },
  { char: 'え', hex: '3048', romaji: 'e', word: 'えんぴつ', trans: 'えんぴつ' },
  { char: 'お', hex: '304A', romaji: 'o', word: 'おにぎり', trans: 'おにぎり' },

  { char: 'か', hex: '304B', romaji: 'ka', word: 'かめ', trans: 'かめ' },
  { char: 'き', hex: '304D', romaji: 'ki', word: 'きりん', trans: 'きりん' },
  { char: 'く', hex: '304F', romaji: 'ku', word: 'くま', trans: 'くま' },
  { char: 'け', hex: '3051', romaji: 'ke', word: 'けいと', trans: 'けいと' },
  { char: 'こ', hex: '3053', romaji: 'ko', word: 'ことり', trans: 'ことり' },

  { char: 'さ', hex: '3055', romaji: 'sa', word: 'さくら', trans: 'さくら' },
  { char: 'し', hex: '3057', romaji: 'shi', word: 'しか', trans: 'しか' },
  { char: 'す', hex: '3059', romaji: 'su', word: 'すいか', trans: 'すいか' },
  { char: 'せ', hex: '305B', romaji: 'se', word: 'せみ', trans: 'せみ' },
  { char: 'そ', hex: '305D', romaji: 'so', word: 'そら', trans: 'そら' },

  { char: 'た', hex: '305F', romaji: 'ta', word: 'たいよう', trans: 'たいよう' },
  { char: 'ち', hex: '3061', romaji: 'chi', word: 'ちゅうりっぷ', trans: 'ちゅうりっぷ' },
  { char: 'つ', hex: '3064', romaji: 'tsu', word: 'つみき', trans: 'つみき' },
  { char: 'て', hex: '3066', romaji: 'te', word: 'てんとうむし', trans: 'てんとうむし' },
  { char: 'と', hex: '3068', romaji: 'to', word: 'とまと', trans: 'とまと' },

  { char: 'な', hex: '306A', romaji: 'na', word: 'なす', trans: 'なす' },
  { char: 'に', hex: '306B', romaji: 'ni', word: 'にじ', trans: 'にじ' },
  { char: 'ぬ', hex: '306C', romaji: 'nu', word: 'ぬいぐるみ', trans: 'ぬいぐるみ' },
  { char: 'ね', hex: '306D', romaji: 'ne', word: 'ねこ', trans: 'ねこ' },
  { char: 'の', hex: '306E', romaji: 'no', word: 'のりもの', trans: 'のりもの' },

  { char: 'は', hex: '306F', romaji: 'ha', word: 'はな', trans: 'はな' },
  { char: 'ひ', hex: '3072', romaji: 'hi', word: 'ひまわり', trans: 'ひまわり' },
  { char: 'ふ', hex: '3075', romaji: 'fu', word: 'ふうせん', trans: 'ふうせん' },
  { char: 'へ', hex: '3078', romaji: 'he', word: 'へび', trans: 'へび' },
  { char: 'ほ', hex: '307B', romaji: 'ho', word: 'ほし', trans: 'ほし' },

  { char: 'ま', hex: '307E', romaji: 'ma', word: 'まめ', trans: 'まめ' },
  { char: 'み', hex: '307F', romaji: 'mi', word: 'みかん', trans: 'みかん' },
  { char: 'む', hex: '3080', romaji: 'mu', word: 'むし', trans: 'むし' },
  { char: 'め', hex: '3081', romaji: 'me', word: 'めがね', trans: 'めがね' },
  { char: 'も', hex: '3082', romaji: 'mo', word: 'もも', trans: 'もも' },

  { char: 'や', hex: '3084', romaji: 'ya', word: 'やま', trans: 'やま' },
  { char: 'ゆ', hex: '3086', romaji: 'yu', word: 'ゆき', trans: 'ゆき' },
  { char: 'よ', hex: '3088', romaji: 'yo', word: 'よる', trans: 'よる' },

  { char: 'ら', hex: '3089', romaji: 'ra', word: 'らいおん', trans: 'らいおん' },
  { char: 'り', hex: '308A', romaji: 'ri', word: 'りんご', trans: 'りんご' },
  { char: 'る', hex: '308B', romaji: 'ru', word: 'るびー', trans: 'るびー' },
  { char: 'れ', hex: '308C', romaji: 're', word: 'れもん', trans: 'れもん' },
  { char: 'ろ', hex: '308D', romaji: 'ro', word: 'ろうそく', trans: 'ろうそく' },

  { char: 'わ', hex: '308F', romaji: 'wa', word: 'わに', trans: 'わに' },
  { char: 'を', hex: '3092', romaji: 'wo', word: 'ほんをよむ', trans: 'ほんをよむ' },
  { char: 'ん', hex: '3093', romaji: 'n', word: 'きりん', trans: 'きりん' }
];

// 46 Standard Katakana table
const KATA_SPECS = [
  { char: 'ア', hex: '30A2', romaji: 'a', word: 'アイス', trans: 'アイス' },
  { char: 'イ', hex: '30A4', romaji: 'i', word: 'インク', trans: 'インク' },
  { char: 'ウ', hex: '30A6', romaji: 'u', word: 'ウクレレ', trans: 'ウクレレ' },
  { char: 'エ', hex: '30A8', romaji: 'e', word: 'エプロン', trans: 'エプロン' },
  { char: 'オ', hex: '30AA', romaji: 'o', word: 'オリーブ', trans: 'オリーブ' },

  { char: 'カ', hex: '30AB', romaji: 'ka', word: 'カメラ', trans: 'カメラ' },
  { char: 'キ', hex: '30AD', romaji: 'ki', word: 'キリン', trans: 'キリン' },
  { char: 'ク', hex: '30AF', romaji: 'ku', word: 'クッキー', trans: 'クッキー' },
  { char: 'ケ', hex: '30B1', romaji: 'ke', word: 'ケーキ', trans: 'ケーキ' },
  { char: 'コ', hex: '30B3', romaji: 'ko', word: 'コアラ', trans: 'コアラ' },

  { char: 'サ', hex: '30B5', romaji: 'sa', word: 'サラダ', trans: 'サラダ' },
  { char: 'シ', hex: '30B7', romaji: 'shi', word: 'シンバル', trans: 'シンバル' },
  { char: 'ス', hex: '30B9', romaji: 'su', word: 'スイカ', trans: 'スイカ' },
  { char: 'セ', hex: '30BB', romaji: 'se', word: 'セーター', trans: 'セーター' },
  { char: 'ソ', hex: '30BD', romaji: 'so', word: 'ソファ', trans: 'ソファ' },

  { char: 'タ', hex: '30BF', romaji: 'ta', word: 'タクシー', trans: 'タクシー' },
  { char: 'チ', hex: '30C1', romaji: 'chi', word: 'チーズ', trans: 'チーズ' },
  { char: 'ツ', hex: '30C4', romaji: 'tsu', word: 'ツリー', trans: 'ツリー' },
  { char: 'テ', hex: '30C6', romaji: 'te', word: 'テント', trans: 'テント' },
  { char: 'ト', hex: '30C8', romaji: 'to', word: 'トマト', trans: 'トマト' },

  { char: 'ナ', hex: '30CA', romaji: 'na', word: 'ナイフ', trans: 'ナイフ' },
  { char: 'ニ', hex: '30CB', romaji: 'ni', word: 'ニット', trans: 'ニット' },
  { char: 'ヌ', hex: '30CC', romaji: 'nu', word: 'ヌードル', trans: 'ヌードル' },
  { char: 'ネ', hex: '30CD', romaji: 'ne', word: 'ネクタイ', trans: 'ネクタイ' },
  { char: 'ノ', hex: '30CE', romaji: 'no', word: 'ノート', trans: 'ノート' },

  { char: 'ハ', hex: '30CF', romaji: 'ha', word: 'ハム', trans: 'ハム' },
  { char: 'ヒ', hex: '30D2', romaji: 'hi', word: 'ピアノ', trans: 'ピアノ' },
  { char: 'フ', hex: '30D5', romaji: 'fu', word: 'フラミンゴ', trans: 'フラミンゴ' },
  { char: 'ヘ', hex: '30D8', romaji: 'he', word: 'ヘリコプター', trans: 'ヘリコプター' },
  { char: 'ホ', hex: '30DB', romaji: 'ho', word: 'ホテル', trans: 'ホテル' },

  { char: 'マ', hex: '30DE', romaji: 'ma', word: 'マント', trans: 'マント' },
  { char: 'ミ', hex: '30DF', romaji: 'mi', word: 'ミルク', trans: 'ミルク' },
  { char: 'ム', hex: '30E0', romaji: 'mu', word: 'ムース', trans: 'ムース' },
  { char: 'メ', hex: '30E1', romaji: 'me', word: 'メロン', trans: 'メロン' },
  { char: 'モ', hex: '30E2', romaji: 'mo', word: 'モノレール', trans: 'モノレール' },

  { char: 'ヤ', hex: '30E4', romaji: 'ya', word: 'ヨット', trans: 'ヨット' },
  { char: 'ユ', hex: '30E6', romaji: 'yu', word: 'ユーフォー', trans: 'ユーフォー' },
  { char: 'ヨ', hex: '30E8', romaji: 'yo', word: 'ヨーヨー', trans: 'ヨーヨー' },

  { char: 'ラ', hex: '30E9', romaji: 'ra', word: 'ライオン', trans: 'ライオン' },
  { char: 'リ', hex: '30EA', romaji: 'ri', word: 'リボン', trans: 'リボン' },
  { char: 'ル', hex: '30EB', romaji: 'ru', word: 'ルビー', trans: 'ルビー' },
  { char: 'レ', hex: '30EC', romaji: 're', word: 'レモン', trans: 'レモン' },
  { char: 'ロ', hex: '30ED', romaji: 'ro', word: 'ロボット', trans: 'ロボット' },

  { char: 'ワ', hex: '30EF', romaji: 'wa', word: 'ワニ', trans: 'ワニ' },
  { char: 'ヲ', hex: '30F2', romaji: 'wo', word: 'パンヲタベル', trans: 'パンを食べる' },
  { char: 'ン', hex: '30F3', romaji: 'n', word: 'パンダ', trans: 'パンダ' }
];

// 26 Full English Alphabet with Pure Phonics (Zero Katakana Phonetic Bias)
const ENGLISH_CHARS = [
  {
    id: 'en_a', char: 'A', romajiOrPhonetic: '/æ/',
    letterName: 'A', letterSound: '/æ/', phonicsSpokenText: 'ah',
    exampleWord: 'Apple', exampleTranslation: 'りんご', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 54.5 18 L 24 90' },
      { order: 2, d: 'M 54.5 18 L 85 90' },
      { order: 3, d: 'M 36 64 L 73 64' }
    ]
  },
  {
    id: 'en_b', char: 'B', romajiOrPhonetic: '/b/',
    letterName: 'B', letterSound: '/b/', phonicsSpokenText: 'buh',
    exampleWord: 'Bear', exampleTranslation: 'くま', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 60 18 C 76 18 76 52 60 52 L 34 52 L 64 52 C 82 52 82 90 64 90 L 34 90' }
    ]
  },
  {
    id: 'en_c', char: 'C', romajiOrPhonetic: '/k/',
    letterName: 'C', letterSound: '/k/', phonicsSpokenText: 'kuh',
    exampleWord: 'Cat', exampleTranslation: 'ねこ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 82 36 C 70 20 40 20 34 54 C 28 88 68 92 84 74' }
    ]
  },
  {
    id: 'en_d', char: 'D', romajiOrPhonetic: '/d/',
    letterName: 'D', letterSound: '/d/', phonicsSpokenText: 'duh',
    exampleWord: 'Dog', exampleTranslation: 'いぬ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 56 18 C 84 18 84 90 56 90 L 34 90' }
    ]
  },
  {
    id: 'en_e', char: 'E', romajiOrPhonetic: '/e/',
    letterName: 'E', letterSound: '/e/', phonicsSpokenText: 'eh',
    exampleWord: 'Elephant', exampleTranslation: 'ぞう', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 78 18' },
      { order: 3, d: 'M 34 54 L 68 54' },
      { order: 4, d: 'M 34 90 L 80 90' }
    ]
  },
  {
    id: 'en_f', char: 'F', romajiOrPhonetic: '/f/',
    letterName: 'F', letterSound: '/f/', phonicsSpokenText: 'fuh',
    exampleWord: 'Fox', exampleTranslation: 'きつね', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 78 18' },
      { order: 3, d: 'M 34 54 L 66 54' }
    ]
  },
  {
    id: 'en_g', char: 'G', romajiOrPhonetic: '/ɡ/',
    letterName: 'G', letterSound: '/ɡ/', phonicsSpokenText: 'guh',
    exampleWord: 'Gorilla', exampleTranslation: 'ゴリラ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 82 36 C 70 20 40 20 34 54 C 28 88 68 92 82 78 L 82 56 L 58 56' }
    ]
  },
  {
    id: 'en_h', char: 'H', romajiOrPhonetic: '/h/',
    letterName: 'H', letterSound: '/h/', phonicsSpokenText: 'huh',
    exampleWord: 'Hat', exampleTranslation: 'ぼうし', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 76 18 L 76 90' },
      { order: 3, d: 'M 34 54 L 76 54' }
    ]
  },
  {
    id: 'en_i', char: 'I', romajiOrPhonetic: '/ɪ/',
    letterName: 'I', letterSound: '/ɪ/', phonicsSpokenText: 'ih',
    exampleWord: 'Igloo', exampleTranslation: 'かまくら', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 54.5 18 L 54.5 90' },
      { order: 2, d: 'M 36 18 L 73 18' },
      { order: 3, d: 'M 36 90 L 73 90' }
    ]
  },
  {
    id: 'en_j', char: 'J', romajiOrPhonetic: '/dʒ/',
    letterName: 'J', letterSound: '/dʒ/', phonicsSpokenText: 'juh',
    exampleWord: 'Jam', exampleTranslation: 'ジャム', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 38 18 L 76 18' },
      { order: 2, d: 'M 64 18 L 64 74 C 64 90 38 90 36 76' }
    ]
  },
  {
    id: 'en_k', char: 'K', romajiOrPhonetic: '/k/',
    letterName: 'K', letterSound: '/k/', phonicsSpokenText: 'kuh',
    exampleWord: 'Kite', exampleTranslation: 'たこ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 74 20 L 38 56 L 76 90' }
    ]
  },
  {
    id: 'en_l', char: 'L', romajiOrPhonetic: '/l/',
    letterName: 'L', letterSound: '/l/', phonicsSpokenText: 'luh',
    exampleWord: 'Lion', exampleTranslation: 'ライオン', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 36 18 L 36 90 L 78 90' }
    ]
  },
  {
    id: 'en_m', char: 'M', romajiOrPhonetic: '/m/',
    letterName: 'M', letterSound: '/m/', phonicsSpokenText: 'muh',
    exampleWord: 'Monkey', exampleTranslation: 'さる', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 28 18 L 28 90' },
      { order: 2, d: 'M 28 18 L 54.5 64 L 81 18 L 81 90' }
    ]
  },
  {
    id: 'en_n', char: 'N', romajiOrPhonetic: '/n/',
    letterName: 'N', letterSound: '/n/', phonicsSpokenText: 'nuh',
    exampleWord: 'Nut', exampleTranslation: '木の実', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 32 18 L 32 90' },
      { order: 2, d: 'M 32 18 L 78 90 L 78 18' }
    ]
  },
  {
    id: 'en_o', char: 'O', romajiOrPhonetic: '/ɒ/',
    letterName: 'O', letterSound: '/ɒ/', phonicsSpokenText: 'ah',
    exampleWord: 'Octopus', exampleTranslation: 'タコ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 54.5 18 C 30 18 24 40 24 54 C 24 68 30 90 54.5 90 C 79 90 85 68 85 54 C 85 40 79 18 54.5 18' }
    ]
  },
  {
    id: 'en_p', char: 'P', romajiOrPhonetic: '/p/',
    letterName: 'P', letterSound: '/p/', phonicsSpokenText: 'puh',
    exampleWord: 'Panda', exampleTranslation: 'パンダ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 62 18 C 78 18 78 56 62 56 L 34 56' }
    ]
  },
  {
    id: 'en_q', char: 'Q', romajiOrPhonetic: '/kw/',
    letterName: 'Q', letterSound: '/kw/', phonicsSpokenText: 'kwuh',
    exampleWord: 'Queen', exampleTranslation: '女王', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 54.5 18 C 30 18 24 40 24 54 C 24 68 30 90 54.5 90 C 79 90 85 68 85 54 C 85 40 79 18 54.5 18' },
      { order: 2, d: 'M 62 68 L 84 90' }
    ]
  },
  {
    id: 'en_r', char: 'R', romajiOrPhonetic: '/r/',
    letterName: 'R', letterSound: '/r/', phonicsSpokenText: 'ruh',
    exampleWord: 'Rabbit', exampleTranslation: 'うさぎ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 60 18 C 76 18 76 54 60 54 L 46 54 L 76 90' }
    ]
  },
  {
    id: 'en_s', char: 'S', romajiOrPhonetic: '/s/',
    letterName: 'S', letterSound: '/s/', phonicsSpokenText: 'suh',
    exampleWord: 'Sun', exampleTranslation: 'たいよう', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 76 34 C 72 20 44 20 38 32 C 32 44 48 52 56 56 C 68 62 78 68 76 80 C 72 92 40 92 34 78' }
    ]
  },
  {
    id: 'en_t', char: 'T', romajiOrPhonetic: '/t/',
    letterName: 'T', letterSound: '/t/', phonicsSpokenText: 'tuh',
    exampleWord: 'Tiger', exampleTranslation: 'トラ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 28 18 L 81 18' },
      { order: 2, d: 'M 54.5 18 L 54.5 90' }
    ]
  },
  {
    id: 'en_u', char: 'U', romajiOrPhonetic: '/ʌ/',
    letterName: 'U', letterSound: '/ʌ/', phonicsSpokenText: 'uh',
    exampleWord: 'Umbrella', exampleTranslation: 'かさ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 68 C 34 88 75 88 75 68 L 75 18' }
    ]
  },
  {
    id: 'en_v', char: 'V', romajiOrPhonetic: '/v/',
    letterName: 'V', letterSound: '/v/', phonicsSpokenText: 'vuh',
    exampleWord: 'Van', exampleTranslation: 'くるま', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 30 18 L 54.5 90 L 79 18' }
    ]
  },
  {
    id: 'en_w', char: 'W', romajiOrPhonetic: '/w/',
    letterName: 'W', letterSound: '/w/', phonicsSpokenText: 'wuh',
    exampleWord: 'Walrus', exampleTranslation: 'セイウチ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 24 18 L 38 90 L 54.5 44 L 71 90 L 85 18' }
    ]
  },
  {
    id: 'en_x', char: 'X', romajiOrPhonetic: '/ks/',
    letterName: 'X', letterSound: '/ks/', phonicsSpokenText: 'ks',
    exampleWord: 'Xylophone', exampleTranslation: '木琴', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 32 20 L 77 88' },
      { order: 2, d: 'M 77 20 L 32 88' }
    ]
  },
  {
    id: 'en_y', char: 'Y', romajiOrPhonetic: '/j/',
    letterName: 'Y', letterSound: '/j/', phonicsSpokenText: 'yuh',
    exampleWord: 'Yak', exampleTranslation: 'ヤク', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 30 20 L 54.5 54' },
      { order: 2, d: 'M 79 20 L 54.5 54 L 54.5 90' }
    ]
  },
  {
    id: 'en_z', char: 'Z', romajiOrPhonetic: '/z/',
    letterName: 'Z', letterSound: '/z/', phonicsSpokenText: 'zuh',
    exampleWord: 'Zebra', exampleTranslation: 'シマウマ', langCode: 'en-US',
    strokes: [
      { order: 1, d: 'M 34 20 L 76 20 L 34 88 L 78 88' }
    ]
  }
];

// Polish Primary Alphabet with Pure Native Phonemes (Zero Katakana Phonetic Bias)
const POLISH_CHARS = [
  {
    id: 'pl_a', char: 'A', romajiOrPhonetic: '[a]',
    letterName: 'A', letterSound: '[a]', phonicsSpokenText: 'a',
    exampleWord: 'Ananas', exampleTranslation: 'パイナップル', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 54.5 18 L 24 90' },
      { order: 2, d: 'M 54.5 18 L 85 90' },
      { order: 3, d: 'M 36 64 L 73 64' }
    ]
  },
  {
    id: 'pl_a_ogonek', char: 'Ą', romajiOrPhonetic: '[ɔ̃]',
    letterName: 'Ą', letterSound: '[ɔ̃]', phonicsSpokenText: 'ą',
    exampleWord: 'Wąż', exampleTranslation: 'へび', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 54.5 16 L 24 82' },
      { order: 2, d: 'M 54.5 16 L 85 82' },
      { order: 3, d: 'M 36 60 L 73 60' },
      { order: 4, d: 'M 82 82 C 82 92 88 98 96 92' } // Ogonek curves rightward
    ]
  },
  {
    id: 'pl_b', char: 'B', romajiOrPhonetic: '[b]',
    letterName: 'B', letterSound: '[b]', phonicsSpokenText: 'b',
    exampleWord: 'Balon', exampleTranslation: 'ふうせん', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 60 18 C 76 18 76 52 60 52 L 34 52 L 64 52 C 82 52 82 90 64 90 L 34 90' }
    ]
  },
  {
    id: 'pl_c', char: 'C', romajiOrPhonetic: '[ts]',
    letterName: 'C', letterSound: '[ts]', phonicsSpokenText: 'ce',
    exampleWord: 'Cytryna', exampleTranslation: 'レモン', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 82 36 C 70 20 40 20 34 54 C 28 88 68 92 84 74' }
    ]
  },
  {
    id: 'pl_c_acute', char: 'Ć', romajiOrPhonetic: '[t͡ɕ]',
    letterName: 'Ć', letterSound: '[t͡ɕ]', phonicsSpokenText: 'ć',
    exampleWord: 'Ćma', exampleTranslation: '蛾 (が)', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 82 42 C 70 26 40 26 34 60 C 28 94 68 98 84 80' },
      { order: 2, d: 'M 48 24 L 66 12' }
    ]
  },
  {
    id: 'pl_d', char: 'D', romajiOrPhonetic: '[d]',
    letterName: 'D', letterSound: '[d]', phonicsSpokenText: 'de',
    exampleWord: 'Dom', exampleTranslation: 'いえ', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 56 18 C 84 18 84 90 56 90 L 34 90' }
    ]
  },
  {
    id: 'pl_e', char: 'E', romajiOrPhonetic: '[ɛ]',
    letterName: 'E', letterSound: '[ɛ]', phonicsSpokenText: 'e',
    exampleWord: 'Ekran', exampleTranslation: 'がめん', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 78 18' },
      { order: 3, d: 'M 34 54 L 68 54' },
      { order: 4, d: 'M 34 90 L 80 90' }
    ]
  },
  {
    id: 'pl_e_ogonek', char: 'Ę', romajiOrPhonetic: '[ɛ̃]',
    letterName: 'Ę', letterSound: '[ɛ̃]', phonicsSpokenText: 'ę',
    exampleWord: 'Ręka', exampleTranslation: '手 (て)', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 16 L 34 82' },
      { order: 2, d: 'M 34 16 L 78 16' },
      { order: 3, d: 'M 34 50 L 68 50' },
      { order: 4, d: 'M 34 82 L 80 82' },
      { order: 5, d: 'M 78 82 C 78 92 84 98 92 92' } // Ogonek curves rightward
    ]
  },
  {
    id: 'pl_g', char: 'G', romajiOrPhonetic: '[ɡ]',
    letterName: 'G', letterSound: '[ɡ]', phonicsSpokenText: 'ge',
    exampleWord: 'Gruszka', exampleTranslation: '洋梨 (ようなし)', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 82 36 C 70 20 40 20 34 54 C 28 88 68 92 82 78 L 82 56 L 58 56' }
    ]
  },
  {
    id: 'pl_k', char: 'K', romajiOrPhonetic: '[k]',
    letterName: 'K', letterSound: '[k]', phonicsSpokenText: 'ka',
    exampleWord: 'Kot', exampleTranslation: 'ねこ', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 74 22 L 36 56' },
      { order: 3, d: 'M 45 48 L 76 90' }
    ]
  },
  {
    id: 'pl_l', char: 'L', romajiOrPhonetic: '[l]',
    letterName: 'L', letterSound: '[l]', phonicsSpokenText: 'el',
    exampleWord: 'Lody', exampleTranslation: 'アイス', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 36 18 L 36 90 L 78 90' }
    ]
  },
  {
    id: 'pl_l_stroke', char: 'Ł', romajiOrPhonetic: '[w]',
    letterName: 'Ł', letterSound: '[w]', phonicsSpokenText: 'eł',
    exampleWord: 'Łódź', exampleTranslation: 'ボート', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 36 18 L 36 90 L 78 90' },
      { order: 2, d: 'M 24 58 L 52 46' }
    ]
  },
  {
    id: 'pl_m', char: 'M', romajiOrPhonetic: '[m]',
    letterName: 'M', letterSound: '[m]', phonicsSpokenText: 'em',
    exampleWord: 'Motyl', exampleTranslation: 'ちょうちょ', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 28 18 L 28 90' },
      { order: 2, d: 'M 28 18 L 54.5 64 L 81 18 L 81 90' }
    ]
  },
  {
    id: 'pl_n', char: 'N', romajiOrPhonetic: '[n]',
    letterName: 'N', letterSound: '[n]', phonicsSpokenText: 'en',
    exampleWord: 'Noga', exampleTranslation: 'あし', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 32 18 L 32 90' },
      { order: 2, d: 'M 32 18 L 78 90 L 78 18' }
    ]
  },
  {
    id: 'pl_o', char: 'O', romajiOrPhonetic: '[ɔ]',
    letterName: 'O', letterSound: '[ɔ]', phonicsSpokenText: 'o',
    exampleWord: 'Oko', exampleTranslation: '目 (め)', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 54.5 18 C 30 18 24 40 24 54 C 24 68 30 90 54.5 90 C 79 90 85 68 85 54 C 85 40 79 18 54.5 18' }
    ]
  },
  {
    id: 'pl_o_acute', char: 'Ó', romajiOrPhonetic: '[u]',
    letterName: 'Ó', letterSound: '[u]', phonicsSpokenText: 'u',
    exampleWord: 'Ogród', exampleTranslation: '庭 (にわ)', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 54.5 24 C 30 24 24 44 24 58 C 24 72 30 94 54.5 94 C 79 94 85 72 85 58 C 85 44 79 24 54.5 24' },
      { order: 2, d: 'M 48 18 L 64 6' }
    ]
  },
  {
    id: 'pl_p', char: 'P', romajiOrPhonetic: '[p]',
    letterName: 'P', letterSound: '[p]', phonicsSpokenText: 'pe',
    exampleWord: 'Pies', exampleTranslation: 'いぬ', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 62 18 C 78 18 78 56 62 56 L 34 56' }
    ]
  },
  {
    id: 'pl_r', char: 'R', romajiOrPhonetic: '[r]',
    letterName: 'R', letterSound: '[r]', phonicsSpokenText: 'er',
    exampleWord: 'Rower', exampleTranslation: '自転車', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 90' },
      { order: 2, d: 'M 34 18 L 60 18 C 76 18 76 54 60 54 L 46 54 L 76 90' }
    ]
  },
  {
    id: 'pl_s', char: 'S', romajiOrPhonetic: '[s]',
    letterName: 'S', letterSound: '[s]', phonicsSpokenText: 'es',
    exampleWord: 'Słońce', exampleTranslation: 'たいよう', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 76 34 C 72 20 44 20 38 32 C 32 44 48 52 56 56 C 68 62 78 68 76 80 C 72 92 40 92 34 78' }
    ]
  },
  {
    id: 'pl_s_acute', char: 'Ś', romajiOrPhonetic: '[ɕ]',
    letterName: 'Ś', letterSound: '[ɕ]', phonicsSpokenText: 'ś',
    exampleWord: 'Ślimak', exampleTranslation: 'かたつむり', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 76 42 C 72 28 44 28 38 40 C 32 52 48 60 56 64 C 68 70 78 76 76 88 C 72 100 40 100 34 86' },
      { order: 2, d: 'M 48 24 L 66 12' }
    ]
  },
  {
    id: 'pl_t', char: 'T', romajiOrPhonetic: '[t]',
    letterName: 'T', letterSound: '[t]', phonicsSpokenText: 'te',
    exampleWord: 'Tort', exampleTranslation: 'ケーキ', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 28 18 L 81 18' },
      { order: 2, d: 'M 54.5 18 L 54.5 90' }
    ]
  },
  {
    id: 'pl_u', char: 'U', romajiOrPhonetic: '[u]',
    letterName: 'U', letterSound: '[u]', phonicsSpokenText: 'u',
    exampleWord: 'Ucho', exampleTranslation: '耳 (みみ)', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 18 L 34 68 C 34 88 75 88 75 68 L 75 18' }
    ]
  },
  {
    id: 'pl_w', char: 'W', romajiOrPhonetic: '[v]',
    letterName: 'W', letterSound: '[v]', phonicsSpokenText: 'wu',
    exampleWord: 'Woda', exampleTranslation: '水 (みず)', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 24 18 L 38 90 L 54.5 44 L 71 90 L 85 18' }
    ]
  },
  {
    id: 'pl_z', char: 'Z', romajiOrPhonetic: '[z]',
    letterName: 'Z', letterSound: '[z]', phonicsSpokenText: 'zet',
    exampleWord: 'Zebra', exampleTranslation: 'シマウマ', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 20 L 76 20 L 34 88 L 78 88' }
    ]
  },
  {
    id: 'pl_z_acute', char: 'Ź', romajiOrPhonetic: '[ʑ]',
    letterName: 'Ź', letterSound: '[ʑ]', phonicsSpokenText: 'ź',
    exampleWord: 'Źrebak', exampleTranslation: '子馬 (こうま)', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 32 L 76 32 L 34 94 L 78 94' },
      { order: 2, d: 'M 48 22 L 66 10' }
    ]
  },
  {
    id: 'pl_z_dot', char: 'Ż', romajiOrPhonetic: '[ʐ]',
    letterName: 'Ż', letterSound: '[ʐ]', phonicsSpokenText: 'że',
    exampleWord: 'Żyrafa', exampleTranslation: 'キリン', langCode: 'pl-PL',
    strokes: [
      { order: 1, d: 'M 34 32 L 76 32 L 34 88 L 78 88' },
      { order: 2, d: 'M 54 16 L 54 18' }
    ]
  }
];

async function main() {
  let hiraStrokes = {};
  let kataStrokes = {};
  if (fs.existsSync('scripts/kanjivg_output.json')) {
    const cached = JSON.parse(fs.readFileSync('scripts/kanjivg_output.json', 'utf8'));
    for (const h of (cached.hiraList || [])) {
      hiraStrokes[h.char] = h.strokes;
    }
    for (const k of (cached.kataList || [])) {
      kataStrokes[k.char] = k.strokes;
    }
  }

  // Also read existing strokes from src/data/characters.ts if available
  if (fs.existsSync('src/data/characters.ts')) {
    try {
      const code = fs.readFileSync('src/data/characters.ts', 'utf8');
      const hiraMatch = /hiragana:\s*\{[\s\S]*?characters:\s*(\[[\s\S]*?\])\s*\}/.exec(code);
      if (hiraMatch) {
        const parsed = JSON.parse(hiraMatch[1]);
        for (const item of parsed) {
          hiraStrokes[item.char] = item.strokes;
        }
      }
      const kataMatch = /katakana:\s*\{[\s\S]*?characters:\s*(\[[\s\S]*?\])\s*\}/.exec(code);
      if (kataMatch) {
        const parsed = JSON.parse(kataMatch[1]);
        for (const item of parsed) {
          kataStrokes[item.char] = item.strokes;
        }
      }
    } catch {}
  }

  const hiraganaChars = HIRA_SPECS.map(item => ({
    id: `hira_${item.romaji}`,
    char: item.char,
    romajiOrPhonetic: item.romaji,
    letterName: item.char,
    letterSound: item.char,
    phonicsSpokenText: item.char,
    exampleWord: item.word,
    exampleTranslation: item.trans,
    langCode: 'ja-JP',
    strokes: hiraStrokes[item.char] || []
  }));

  const katakanaChars = KATA_SPECS.map(item => ({
    id: `kata_${item.romaji}`,
    char: item.char,
    romajiOrPhonetic: item.romaji,
    letterName: item.char,
    letterSound: item.char,
    phonicsSpokenText: item.char,
    exampleWord: item.word,
    exampleTranslation: item.trans,
    langCode: 'ja-JP',
    strokes: kataStrokes[item.char] || []
  }));

  const tsContent = `// Comprehensive Multilingual Character Dataset for mojimoji
// KanjiVG stroke paths (CC BY-SA 3.0) + Pure Phonics (Zero Katakana Phonetic Bias)
import type { CharacterSet, LanguageType } from '../types';

export const CHARACTER_SETS: Record<LanguageType, CharacterSet> = {
  hiragana: {
    id: 'hiragana',
    title: 'ひらがな',
    subtitle: '50おんの きほん (46もじ)',
    langCode: 'ja-JP',
    characters: ${JSON.stringify(hiraganaChars, null, 2)}
  },
  katakana: {
    id: 'katakana',
    title: 'カタカナ',
    subtitle: 'ことばの はばを ひろげよう (46もじ)',
    langCode: 'ja-JP',
    characters: ${JSON.stringify(katakanaChars, null, 2)}
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

  fs.writeFileSync('src/data/characters.ts', tsContent);
  console.log('Successfully generated pristine Katakana-free character dataset in src/data/characters.ts!');
}

main().catch(console.error);
