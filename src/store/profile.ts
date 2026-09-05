import type { PlayerProfile, Settings } from '../types'
import { collectibles } from '../data/content'

const USERS_KEY = 'sgame.users.v1'
const ACTIVE_KEY = 'sgame.active-user.v1'

export const defaultSettings: Settings = {
  masterVolume: 0.7,
  musicVolume: 0.45,
  effectsVolume: 0.75,
  voiceVolume: 0.85,
  voicePreview: false,
  screenShake: true,
  reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  highContrast: false,
  eventMode: false,
}

const defaultProfile = (username: string): PlayerProfile => ({
  username,
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString(),
  level: 1,
  xp: 0,
  points: 80,
  tokens: 0,
  printShards: 0,
  prototypes: [],
  collectibles: ['battery', 'bottle', 'paper-box', 'shirt'],
  storiesCompleted: [],
  campaignCompleted: [],
  currentMission: 'sh-01',
  skillPoints: 2,
  unlockedSkills: [],
  growthRewards: [],
  modeMastery: {},
  equipmentOwned: ['wrench-basic', 'helmet-basic', 'armor-basic', 'boots-basic'],
  equipped: { weapon: 'wrench-basic', helmet: 'helmet-basic', armor: 'armor-basic', boots: 'boots-basic' },
  settings: { ...defaultSettings },
  stats: {
    runs: 0,
    victories: 0,
    enemiesPurified: 0,
    classificationTotal: 0,
    classificationCorrect: 0,
    bestPollution: 100,
    storiesRead: 0,
    valuePreserved: 0,
  },
})

export const reconcileProgression = (profile: PlayerProfile): PlayerProfile => {
  const granted = new Set(profile.growthRewards ?? [])
  let skillPoints = profile.skillPoints
  for (const storyId of profile.storiesCompleted) {
    const rewardId = `story:${storyId}`
    if (!granted.has(rewardId)) { granted.add(rewardId); skillPoints += 1 }
  }
  for (const [modeId, score] of Object.entries(profile.modeMastery ?? {})) {
    const rewardId = `mastery:${modeId}`
    if ((score ?? 0) >= 80 && !granted.has(rewardId)) { granted.add(rewardId); skillPoints += 2 }
  }
  const storyIds = new Set(profile.storiesCompleted)
  const storyCollectibles = collectibles.filter((item) => item.unlockStory && storyIds.has(item.unlockStory)).map((item) => item.id)
  return { ...profile, skillPoints, growthRewards: [...granted], collectibles: [...new Set([...profile.collectibles, ...storyCollectibles])] }
}

const parseUsers = (): Record<string, PlayerProfile> => {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}') as Record<string, PlayerProfile>
    for (const profile of Object.values(users)) {
      profile.modeMastery ??= {}
      profile.campaignCompleted ??= []
      profile.currentMission ??= 'sh-01'
      profile.skillPoints ??= 2
      profile.unlockedSkills ??= []
      profile.growthRewards ??= []
      profile.settings.voiceVolume ??= .85
      profile.settings.voicePreview ??= false
    }
    return users
  } catch {
    return {}
  }
}

export const listUsers = () => Object.values(parseUsers()).sort((a, b) => b.lastPlayedAt.localeCompare(a.lastPlayedAt))

export const getActiveUsername = () => localStorage.getItem(ACTIVE_KEY)

export const loadActiveProfile = (): PlayerProfile | null => {
  const active = getActiveUsername()
  if (!active) return null
  const profile = parseUsers()[active]
  return profile ? reconcileProgression(profile) : null
}

export const loginOrCreate = (rawUsername: string): PlayerProfile => {
  const username = rawUsername.trim().replace(/\s+/g, ' ').slice(0, 12)
  if (!username) throw new Error('请输入用户名')
  const users = parseUsers()
  const profile = reconcileProgression(users[username] ?? defaultProfile(username))
  profile.lastPlayedAt = new Date().toISOString()
  users[username] = profile
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(ACTIVE_KEY, username)
  return profile
}

export const saveProfile = (profile: PlayerProfile): PlayerProfile => {
  const next = reconcileProgression({ ...profile, lastPlayedAt: new Date().toISOString() })
  const users = parseUsers()
  users[next.username] = next
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(ACTIVE_KEY, next.username)
  return next
}

export const logout = () => localStorage.removeItem(ACTIVE_KEY)

export const resetEventProfile = (username: string): PlayerProfile => {
  const fresh = defaultProfile(username)
  fresh.settings.eventMode = true
  return saveProfile(fresh)
}

export const exportProfile = (profile: PlayerProfile) => {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `S-game-${profile.username}-存档.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export const importProfile = async (file: File): Promise<PlayerProfile> => {
  if (file.size > 1_000_000) throw new Error('存档文件过大')
  const parsed = JSON.parse(await file.text()) as Partial<PlayerProfile>
  if (!parsed.username || typeof parsed.username !== 'string' || !parsed.settings || !parsed.stats) throw new Error('不是有效的 S-game 存档')
  const base = defaultProfile(parsed.username.trim().slice(0, 12))
  const profile: PlayerProfile = {
    ...base,
    ...parsed,
    username: base.username,
    settings: { ...base.settings, ...parsed.settings },
    stats: { ...base.stats, ...parsed.stats },
    equipped: { ...base.equipped, ...parsed.equipped },
    modeMastery: parsed.modeMastery ?? {},
    campaignCompleted: parsed.campaignCompleted ?? [],
    currentMission: parsed.currentMission ?? 'sh-01',
    skillPoints: parsed.skillPoints ?? 2,
    unlockedSkills: parsed.unlockedSkills ?? [],
    lastPlayedAt: new Date().toISOString(),
  }
  return saveProfile(profile)
}

export const addXp = (profile: PlayerProfile, amount: number) => {
  let xp = profile.xp + amount
  let level = profile.level
  while (xp >= level * 100) {
    xp -= level * 100
    level += 1
  }
  return { ...profile, xp, level }
}
