import type { CombatStats, Difficulty, DifficultyTuning, EquippedItems, PlayerProfile } from '../types'
import { equipment } from './content'
import { skillNodes } from './skills'

export const difficultyTuning: Record<Difficulty, DifficultyTuning> = {
  experience: { id: 'experience', name: '简单', audience: '活动现场与首次体验', enemyHp: .76, enemyDamage: .65, spawnRate: .82, pollutionRate: .68, telegraphTime: 1.35, reward: .85, aimAssist: 1.35 },
  standard: { id: 'standard', name: '普通', audience: '完整系统与标准节奏', enemyHp: 1, enemyDamage: 1, spawnRate: 1, pollutionRate: 1, telegraphTime: 1, reward: 1, aimAssist: 1 },
  challenge: { id: 'challenge', name: '困难', audience: '熟悉构筑与Boss机制的玩家', enemyHp: 1.32, enemyDamage: 1.28, spawnRate: 1.22, pollutionRate: 1.25, telegraphTime: .78, reward: 1.55, aimAssist: .72 },
}

export const baseCombatStats: CombatStats = { maxHp: 100, attack: 16, attackSpeed: 1, moveSpeed: 210, cooldownRate: 1, critChance: .03, valueGain: 1, pollutionGuard: 0, aimAssist: 1 }

const add = (target: CombatStats, modifiers: Partial<CombatStats>) => {
  for (const [key, value] of Object.entries(modifiers) as [keyof CombatStats, number][]) target[key] += value
}

export const resolveCombatStats = (profile: Pick<PlayerProfile, 'equipped' | 'unlockedSkills'>): CombatStats => {
  const stats = { ...baseCombatStats }
  for (const id of Object.values(profile.equipped as EquippedItems)) {
    const item = equipment.find((entry) => entry.id === id)
    if (item) add(stats, item.modifiers)
  }
  for (const id of profile.unlockedSkills) {
    const skill = skillNodes.find((entry) => entry.id === id)
    if (skill?.modifiers) add(stats, skill.modifiers)
  }
  return stats
}

export const statLabels: Record<keyof CombatStats, string> = {
  maxHp: '生命', attack: '净化强度', attackSpeed: '攻速', moveSpeed: '移速', cooldownRate: '技能循环', critChance: '弱点率', valueGain: '价值保留', pollutionGuard: '污染防护', aimAssist: '吸附范围',
}
