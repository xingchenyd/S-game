import GameIcon, { type GameIconName } from './GameIcon'

interface PixelIconProps {
  name: string
  alt?: string
  size?: number
  className?: string
}

export default function PixelIcon({ name, alt = '', size = 28, className = '' }: PixelIconProps) {
  const aliases: Record<string, GameIconName> = {
    'home': 'home', 'map': 'map', 'shield-check': 'training', 'archive-box': 'museum',
    'book': 'theater', 'sparkles': 'skills', 'user-avatar': 'profile', 'gift': 'exchange',
    'settings-gear': 'settings', 'volume': 'volume', 'play': 'prototype',
  }
  return <GameIcon name={aliases[name] ?? 'prototype'} alt={alt} size={size} className={`pixel-icon ${className}`} />
}
