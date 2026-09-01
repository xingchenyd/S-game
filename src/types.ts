export type Screen = 'start' | 'hub' | 'adventure' | 'museum' | 'theater' | 'profile' | 'equipment' | 'exchange'
export type WasteType = 'electronic' | 'plastic' | 'paper' | 'textile'
export type Difficulty = 'experience' | 'standard' | 'challenge'

export interface Settings {
  masterVolume: number
  musicVolume: number
  effectsVolume: number
  screenShake: boolean
  reducedMotion: boolean
  highContrast: boolean
  eventMode: boolean
}

export interface EquippedItems {
  weapon: string
  helmet: string
  armor: string
  boots: string
}

export interface PlayerStats {
  runs: number
  victories: number
  enemiesPurified: number
  classificationTotal: number
  classificationCorrect: number
  bestPollution: number
  storiesRead: number
  valuePreserved: number
}

export interface PlayerProfile {
  username: string
  createdAt: string
  lastPlayedAt: string
  level: number
  xp: number
  points: number
  tokens: number
  printShards: number
  prototypes: string[]
  collectibles: string[]
  storiesCompleted: string[]
  equipmentOwned: string[]
  equipped: EquippedItems
  settings: Settings
  stats: PlayerStats
}

export interface AdventureDefinition {
  id: string
  name: string
  subtitle: string
  location: string
  wasteType: WasteType
  icon: string
  accent: string
  background: string
  briefing: string
  lesson: string[]
  boss: string
  prototype: string
  available: boolean
}

export interface EquipmentItem {
  id: string
  name: string
  slot: keyof EquippedItems
  rarity: '普通' | '精良' | '稀有' | '原型'
  description: string
  stat: string
  icon: string
  cost: number
}

export interface Collectible {
  id: string
  name: string
  type: WasteType
  source: string
  portrait: string
  rarity: '常见' | '少见' | '稀有' | '珍贵' | '原型'
  summary: string
  before: string
  action: string
  after: string
}

export interface StoryChoice {
  text: string
  reply: string
  insight?: string
}

export interface StoryBeat {
  speaker: string
  portrait?: string
  text: string
  choices?: StoryChoice[]
}

export interface StoryDefinition {
  id: string
  title: string
  subtitle: string
  location: string
  duration: string
  type: WasteType
  cover: string
  beats: StoryBeat[]
}

export interface RunMetrics {
  hp: number
  maxHp: number
  pollution: number
  value: number
  accuracy: number
  combo: number
  stage: number
  totalStages: number
}
