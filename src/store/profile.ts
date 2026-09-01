import type { PlayerProfile, Settings } from '../types'

const USERS_KEY = 'sgame.users.v1'
const ACTIVE_KEY = 'sgame.active-user.v1'

export const defaultSettings: Settings = {
  masterVolume: 0.7,
  musicVolume: 0.45,
  effectsVolume: 0.75,
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

const parseUsers = (): Record<string, PlayerProfile> => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

export const listUsers = () => Object.values(parseUsers()).sort((a, b) => b.lastPlayedAt.localeCompare(a.lastPlayedAt))

export const getActiveUsername = () => localStorage.getItem(ACTIVE_KEY)

export const loadActiveProfile = (): PlayerProfile | null => {
  const active = getActiveUsername()
  if (!active) return null
  return parseUsers()[active] ?? null
}

export const loginOrCreate = (rawUsername: string): PlayerProfile => {
  const username = rawUsername.trim().replace(/\s+/g, ' ').slice(0, 12)
  if (!username) throw new Error('请输入用户名')
  const users = parseUsers()
  const profile = users[username] ?? defaultProfile(username)
  profile.lastPlayedAt = new Date().toISOString()
  users[username] = profile
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(ACTIVE_KEY, username)
  return profile
}

export const saveProfile = (profile: PlayerProfile): PlayerProfile => {
  const next = { ...profile, lastPlayedAt: new Date().toISOString() }
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

export const addXp = (profile: PlayerProfile, amount: number) => {
  let xp = profile.xp + amount
  let level = profile.level
  while (xp >= level * 100) {
    xp -= level * 100
    level += 1
  }
  return { ...profile, xp, level }
}
