import type { StickerDefinition } from '../types';

export const STICKER_LIST: StickerDefinition[] = [
  { id: 'st_cat', name: 'ねこちゃん', category: 'animals', svgType: 'cat', rarity: 'common' },
  { id: 'st_dog', name: 'わんこ', category: 'animals', svgType: 'dog', rarity: 'common' },
  { id: 'st_bear', name: 'くまさん', category: 'animals', svgType: 'bear', rarity: 'common' },
  { id: 'st_star_gold', name: 'きんのほし', category: 'stars', svgType: 'starGold', rarity: 'rare' },
  { id: 'st_rainbow', name: 'にじ', category: 'nature', svgType: 'rainbow', rarity: 'rare' },
  { id: 'st_clover', name: 'よつばのクローバー', category: 'nature', svgType: 'clover', rarity: 'common' },
  { id: 'st_crown', name: 'おうかん', category: 'stars', svgType: 'crown', rarity: 'special' },
  { id: 'st_rocket', name: 'ロケット', category: 'stars', svgType: 'rocket', rarity: 'special' },
  { id: 'st_dino', name: 'きょうりゅう', category: 'animals', svgType: 'dino', rarity: 'rare' },
  { id: 'st_strawberry', name: 'いちご', category: 'sweets', svgType: 'strawberry', rarity: 'common' }
];

export interface BoardTheme {
  id: 'forest' | 'ocean' | 'dino' | 'space';
  title: string;
  bgGradient: string;
  groundColor: string;
  accentIcon: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'forest',
    title: 'みどりの もり',
    bgGradient: 'linear-gradient(180deg, #EBF5EE 0%, #D8EBD9 100%)',
    groundColor: '#95C59C',
    accentIcon: 'Trees'
  },
  {
    id: 'ocean',
    title: 'あおい うみ',
    bgGradient: 'linear-gradient(180deg, #E6F4F8 0%, #CCE8F2 100%)',
    groundColor: '#79B7D1',
    accentIcon: 'Fish'
  },
  {
    id: 'dino',
    title: 'きょうりゅうの しま',
    bgGradient: 'linear-gradient(180deg, #FBF1E6 0%, #F4DEC6 100%)',
    groundColor: '#D8AB79',
    accentIcon: 'Mountain'
  },
  {
    id: 'space',
    title: 'ほしぞら',
    bgGradient: 'linear-gradient(180deg, #242B38 0%, #1A1F29 100%)',
    groundColor: '#364052',
    accentIcon: 'Moon'
  }
];
