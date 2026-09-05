export type Screen = 'start' | 'hub' | 'adventure' | 'museum' | 'theater' | 'profile' | 'equipment' | 'skills' | 'exchange' | 'training'
export type WasteType = 'electronic' | 'plastic' | 'paper' | 'textile'
export type Difficulty = 'experience' | 'standard' | 'challenge'

export interface Settings {
  masterVolume: number
  musicVolume: number
  effectsVolume: number
  voiceVolume: number
  voicePreview: boolean
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
  campaignCompleted: string[]
  currentMission: string
  skillPoints: number
  unlockedSkills: string[]
  growthRewards?: string[]
  modeMastery: Partial<Record<PlayModeId, number>>
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
  chapter?: string
  modes?: PlayModeId[]
  routeNodes?: { id: string; name: string; kind: 'story' | 'combat' | 'skill' | 'rest' | 'boss'; description: string }[]
}

export interface EquipmentItem {
  id: string
  name: string
  slot: keyof EquippedItems
  rarity: '普通' | '精良' | '稀有' | '原型'
  description: string
  stat: string
  power: number
  modifiers: Partial<CombatStats>
  perk?: string
  icon: string
  cost: number
}

export interface CombatStats {
  maxHp: number
  attack: number
  attackSpeed: number
  moveSpeed: number
  cooldownRate: number
  critChance: number
  valueGain: number
  pollutionGuard: number
  aimAssist: number
}

export interface DifficultyTuning {
  id: Difficulty
  name: string
  audience: string
  enemyHp: number
  enemyDamage: number
  spawnRate: number
  pollutionRate: number
  telegraphTime: number
  reward: number
  aimAssist: number
}

export interface SkillNode {
  id: string
  name: string
  branch: '行动' | '系统' | '共情'
  tier: number
  cost: number
  description: string
  effect: string
  requires: string[]
  modifiers?: Partial<CombatStats>
  routeAbility?: string
  perks?: Partial<SkillEffects>
}

export interface SkillEffects {
  secondWindShield: number
  pulseRadius: number
  healingBonus: number
  energyBonus: number
  dashShield: number
  killHeal: number
  decisionPollution: number
  decisionValue: number
  storyBonus: number
  trainingBonus: number
  cleanFinishBonus: number
  readingHint: number
}

export type CampaignNodeKind = 'story' | 'combat' | 'system' | 'explore' | 'rest' | 'elite' | 'boss'

export interface CampaignMission {
  id: string
  order: number
  title: string
  subtitle: string
  location: string
  routeId: string
  kind: CampaignNodeKind
  summary: string
  objective: string
  cast: string[]
  dialogue: { speaker: string; text: string }[]
  evidence: [string, string, string]
  requires: string[]
  reward: string
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
  unlockStory?: string
  unlockHint?: string
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
  theme: 'shanghai' | 'dujiangyan' | 'heidushan'
  cover: string
  beats: StoryBeat[]
  tags: string[]
  learningGoals: string[]
  sourceIds: string[]
  reviewStatus: '资料初审' | '待专家复核' | '已复核'
  estimatedCharacters: number
}

export interface KnowledgeSource {
  id: string
  title: string
  publisher: string
  url: string
  scope: string
  checkedAt: string
}

export type PlayModeId = 'branch-expedition' | 'pollution-control' | 'sorting-line' | 'repair-bench' | 'material-escort' | 'hazard-isolation' | 'facility-defense' | 'eco-mechanism' | 'npc-commission' | 'passport-hunt' | 'finale-operation'

export interface PlayModeDefinition {
  id: PlayModeId
  name: string
  shortName: string
  icon: string
  fantasy: string
  playerLoop: string[]
  controls: string
  winCondition: string
  failCondition: string
  education: string[]
  variants: { name: string; change: string }[]
  rewards: string[]
  mastery: string
  available: boolean
}

export interface RunMetrics {
  hp: number
  maxHp: number
  shield?: number
  maxShield?: number
  bossHp?: number
  bossMaxHp?: number
  pollution: number
  value: number
  accuracy: number
  combo: number
  finisher: number
  stage: number
  totalStages: number
  playerX?: number
  playerY?: number
  radar?: { x: number; y: number; boss: boolean }[]
  drops?: number
  activeBuffs?: { id: string; label: string; remaining: number; tone: string }[]
  skillCooldowns?: { pulse: number; dash: number; finisher: number }
}
