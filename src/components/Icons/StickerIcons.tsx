import React from 'react';

interface StickerIconProps {
  type: string;
  size?: number;
  className?: string;
}

export const StickerIcon: React.FC<StickerIconProps> = ({ type, size = 64, className = '' }) => {
  switch (type) {
    case 'cat':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <circle cx="32" cy="36" r="22" fill="#F4E8D6" stroke="#D3B895" strokeWidth="2.5" />
          <path d="M16 24 L22 10 L30 20 Z" fill="#E6A878" stroke="#D3B895" strokeWidth="2" />
          <path d="M48 24 L42 10 L34 20 Z" fill="#E6A878" stroke="#D3B895" strokeWidth="2" />
          <circle cx="24" cy="34" r="3" fill="#4A3F35" />
          <circle cx="40" cy="34" r="3" fill="#4A3F35" />
          <ellipse cx="32" cy="40" rx="2.5" ry="1.5" fill="#E2847A" />
          <path d="M30 42 Q32 45 34 42" stroke="#4A3F35" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 36 L20 37 M12 40 L20 39" stroke="#9E8570" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M52 36 L44 37 M52 40 L44 39" stroke="#9E8570" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'dog':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <ellipse cx="32" cy="38" rx="22" ry="20" fill="#EAD9C9" stroke="#C5A88B" strokeWidth="2.5" />
          <ellipse cx="14" cy="32" rx="6" ry="14" fill="#C5A88B" />
          <ellipse cx="50" cy="32" rx="6" ry="14" fill="#C5A88B" />
          <circle cx="25" cy="36" r="3" fill="#3D312A" />
          <circle cx="39" cy="36" r="3" fill="#3D312A" />
          <ellipse cx="32" cy="42" rx="4" ry="2.5" fill="#3D312A" />
          <path d="M30 45 Q32 49 34 45" stroke="#3D312A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'bear':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <circle cx="16" cy="18" r="9" fill="#8C6546" stroke="#66462C" strokeWidth="2" />
          <circle cx="16" cy="18" r="5" fill="#DDBB99" />
          <circle cx="48" cy="18" r="9" fill="#8C6546" stroke="#66462C" strokeWidth="2" />
          <circle cx="48" cy="18" r="5" fill="#DDBB99" />
          <circle cx="32" cy="36" r="22" fill="#8C6546" stroke="#66462C" strokeWidth="2.5" />
          <ellipse cx="32" cy="42" rx="10" ry="8" fill="#F0E1D2" />
          <circle cx="24" cy="34" r="2.5" fill="#2D1F17" />
          <circle cx="40" cy="34" r="2.5" fill="#2D1F17" />
          <ellipse cx="32" cy="40" rx="4" ry="2.5" fill="#2D1F17" />
        </svg>
      );

    case 'starGold':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <polygon
            points="32,6 39,24 58,25 43,37 49,56 32,45 15,56 21,37 6,25 25,24"
            fill="#F6C343"
            stroke="#D99E1F"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="32" r="2" fill="#75500A" />
          <circle cx="38" cy="32" r="2" fill="#75500A" />
          <path d="M29 38 Q32 41 35 38" stroke="#75500A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'rainbow':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <path d="M8 48 A24 24 0 0 1 56 48" stroke="#E26D5C" strokeWidth="5" strokeLinecap="round" />
          <path d="M14 48 A18 18 0 0 1 50 48" stroke="#F4B251" strokeWidth="5" strokeLinecap="round" />
          <path d="M20 48 A12 12 0 0 1 44 48" stroke="#5C9E7E" strokeWidth="5" strokeLinecap="round" />
          <path d="M26 48 A6 6 0 0 1 38 48" stroke="#5D8AA8" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'clover':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <circle cx="24" cy="24" r="10" fill="#69A873" />
          <circle cx="40" cy="24" r="10" fill="#78BA82" />
          <circle cx="24" cy="40" r="10" fill="#589662" />
          <circle cx="40" cy="40" r="10" fill="#69A873" />
          <path d="M32 32 Q32 58 42 60" stroke="#487A4F" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'crown':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <path d="M10 46 L14 20 L26 32 L32 14 L38 32 L50 20 L54 46 Z" fill="#F5C444" stroke="#CC961B" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="14" cy="18" r="3" fill="#D9534F" />
          <circle cx="32" cy="12" r="3.5" fill="#3F88C5" />
          <circle cx="50" cy="18" r="3" fill="#55A630" />
          <rect x="14" y="44" width="36" height="4" rx="2" fill="#E0A724" />
        </svg>
      );

    case 'rocket':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <path d="M32 8 C22 18 20 38 22 48 L42 48 C44 38 42 18 32 8 Z" fill="#EAECEE" stroke="#90A4AE" strokeWidth="2" />
          <circle cx="32" cy="26" r="6" fill="#4FC3F7" stroke="#0288D1" strokeWidth="1.5" />
          <path d="M22 36 L12 48 L22 46 Z" fill="#E53935" />
          <path d="M42 36 L52 48 L42 46 Z" fill="#E53935" />
          <path d="M26 48 L32 60 L38 48 Z" fill="#FFA726" />
        </svg>
      );

    case 'dino':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <path d="M14 26 C14 16 28 14 36 20 C42 24 44 32 44 42 L42 54 L34 54 L34 46 L24 46 L24 54 L16 54 L18 38 C14 38 14 30 14 26 Z" fill="#68A368" stroke="#487848" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="28" cy="22" r="2" fill="#1C381C" />
          <path d="M42 26 L48 28 L42 32 Z" fill="#E8B839" />
          <path d="M44 34 L50 36 L44 40 Z" fill="#E8B839" />
        </svg>
      );

    case 'strawberry':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <path d="M32 14 C16 14 12 36 22 52 C26 58 38 58 42 52 C52 36 48 14 32 14 Z" fill="#E04D54" stroke="#BA2B32" strokeWidth="2" />
          <circle cx="24" cy="30" r="1.5" fill="#FFE57F" />
          <circle cx="34" cy="26" r="1.5" fill="#FFE57F" />
          <circle cx="40" cy="34" r="1.5" fill="#FFE57F" />
          <circle cx="28" cy="42" r="1.5" fill="#FFE57F" />
          <circle cx="36" cy="46" r="1.5" fill="#FFE57F" />
          <path d="M32 8 L32 15 M22 14 Q32 16 42 14 Q32 18 22 14" stroke="#43A047" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
};
