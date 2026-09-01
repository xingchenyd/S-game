import { assetUrl } from '../utils/assets'

export type GameIconName =
  | 'home' | 'map' | 'training' | 'museum' | 'theater' | 'skills' | 'profile' | 'equipment'
  | 'exchange' | 'settings' | 'volume' | 'fullscreen' | 'user' | 'locked' | 'knowledge' | 'prototype'
  | 'health' | 'shield' | 'pollution' | 'value' | 'pulse' | 'charge' | 'dash' | 'ultimate'
  | 'heal' | 'shield-pickup' | 'attack' | 'speed' | 'energy' | 'materials' | 'boss' | 'radar'

interface Props {
  name: GameIconName
  size?: number
  alt?: string
  className?: string
}

const combatIcons = new Set<GameIconName>([
  'health', 'shield', 'pollution', 'value', 'pulse', 'charge', 'dash', 'ultimate',
  'heal', 'shield-pickup', 'attack', 'speed', 'energy', 'materials', 'boss', 'radar',
])

export default function GameIcon({ name, size = 36, alt = '', className = '' }: Props) {
  const group = combatIcons.has(name) ? 'combat' : 'nav'
  return <img className={`game-icon ${className}`} src={assetUrl(`art/ui-v4/${group}/${name}.webp`)} width={size} height={size} alt={alt} draggable={false} />
}
