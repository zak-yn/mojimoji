export type LanguageType = 'hiragana' | 'katakana' | 'english' | 'polish';

export interface StrokeData {
  order: number;
  d: string;               // SVG path definition (normalized 0-100 coordinate box)
  length?: number;         // Precomputed or runtime length for dashoffset
}

export interface CharacterItem {
  id: string;              // e.g. 'hira_a', 'pl_a_ogonek'
  char: string;            // 'あ', 'Ą'
  romajiOrPhonetic: string;// 'a', 'on'
  letterName: string;      // Name: 'エイ', 'ビー', 'エウ(Ł)'
  letterSound: string;     // Sound: '/æ/ (アッ)', '/b/ (ブッ)', '/w/ (ウ)'
  phonicsSpokenText?: string; // Text for TTS phonics pronunciation
  exampleWord: string;     // 'Apple', 'Łódź', 'あさがお'
  exampleTranslation?: string; // 'りんご', 'ボート', '朝顔'
  langCode: string;        // 'ja-JP', 'en-US', 'pl-PL'
  strokes: StrokeData[];
  guidePoints?: { x: number; y: number }[];
}

export interface CharacterSet {
  id: LanguageType;
  title: string;           // 'ひらがな', 'カタカナ', 'ABC (えいご)', 'Polski (ポーランドご)'
  subtitle: string;
  langCode: string;
  flagEmojiPlaceholder?: string; // Use clean label/SVG icon instead
  characters: CharacterItem[];
}

export interface PlacedSticker {
  instanceId: string;
  stickerId: string;
  xPercent: number;        // 0 - 100 for responsive placement across iPad / iPhone
  yPercent: number;        // 0 - 100
  scale: number;
  rotation: number;
}

export interface StickerDefinition {
  id: string;
  name: string;
  category: 'animals' | 'stars' | 'sweets' | 'nature';
  svgType: string;         // key for custom SVG sticker illustration
  rarity: 'common' | 'rare' | 'special';
}

export interface UserProgress {
  familyCode: string;      // e.g. 'きりん-77' or 6-digit sync ID
  childName: string;       // e.g. 'はなちゃん'
  completedChars: Record<string, number>; // charId -> completionCount
  passedTests: Record<string, boolean>;   // charId -> boolean
  earnedStickers: string[];               // list of sticker IDs
  placedStickers: PlacedSticker[];
  currentBoardTheme: 'forest' | 'ocean' | 'dino' | 'space';
  lastUpdated: number;
}
