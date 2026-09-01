import { describe, expect, it } from 'vitest'
import { adventures, collectibles, equipment, stories } from './content'
import { modeSimulations, playModes } from './playModes'
import { baseEnemies, bosses, eliteEnemies } from './enemies'
import { shanghaiCampaign } from './campaign'
import { skillNodes } from './skills'
import { difficultyTuning, resolveCombatStats } from './balance'

describe('game content integrity', () => {
  it('uses unique stable ids', () => {
    for (const collection of [adventures, collectibles, equipment, stories]) {
      const ids = collection.map((item) => item.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('ships every Shanghai waste theme and one future route', () => {
    expect(adventures.filter((route) => route.available).length).toBeGreaterThanOrEqual(10)
    expect(new Set(adventures.filter((route) => route.available).map((route) => route.wasteType))).toEqual(new Set(['electronic', 'plastic', 'paper', 'textile']))
    expect(adventures.some((route) => !route.available)).toBe(true)
  })

  it('gives every playable route its own collectible prototype', () => {
    const legacyIds: Record<string, string> = { 'lujiazui-circuit': 'lujiazui-core', 'suzhou-plastic': 'suzhou-core', 'yangpu-paper': 'yangpu-core', 'changning-textile': 'changning-core' }
    for (const route of adventures.filter((item) => item.available)) {
      const id = legacyIds[route.id] ?? `${route.id}-core`
      const prototype = collectibles.find((item) => item.id === id)
      expect(prototype?.rarity).toBe('原型')
      expect(prototype?.source).toBe(route.boss)
    }
  })

  it('ships a diverse enemy ecology with readable counters', () => {
    expect(baseEnemies).toHaveLength(24)
    expect(eliteEnemies).toHaveLength(8)
    expect(bosses).toHaveLength(8)
    for (const enemy of [...baseEnemies, ...eliteEnemies, ...bosses]) {
      expect(enemy.telegraph.length).toBeGreaterThan(4)
      expect(enemy.counter.length).toBeGreaterThan(4)
      expect(enemy.lesson.length).toBeGreaterThan(4)
    }
  })

  it('keeps theater stories substantial and interactive', () => {
    expect(stories).toHaveLength(40)
    for (const story of stories) {
      expect(story.beats.length).toBeGreaterThanOrEqual(8)
      expect(story.beats.filter((beat) => beat.choices && beat.choices.length >= 2).length).toBeGreaterThanOrEqual(2)
      expect(story.estimatedCharacters).toBeGreaterThanOrEqual(800)
      expect(story.learningGoals.length).toBeGreaterThanOrEqual(3)
      expect(story.sourceIds.length).toBeGreaterThan(0)
    }
  })

  it('ships eleven designed and playable mode simulations', () => {
    expect(playModes).toHaveLength(11)
    expect(modeSimulations).toHaveLength(11)
    for (const mode of playModes) {
      expect(mode.playerLoop.length).toBeGreaterThanOrEqual(4)
      expect(mode.variants.length).toBeGreaterThanOrEqual(3)
      expect(mode.education.length).toBeGreaterThanOrEqual(3)
      expect(modeSimulations.find((simulation) => simulation.modeId === mode.id)?.rounds.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('ships a continuous ten-node Shanghai chapter', () => {
    expect(shanghaiCampaign).toHaveLength(10)
    expect(shanghaiCampaign[0].requires).toHaveLength(0)
    for (const [index, mission] of shanghaiCampaign.entries()) {
      expect(mission.order).toBe(index + 1)
      expect(adventures.some((route) => route.id === mission.routeId)).toBe(true)
      expect(mission.dialogue.length).toBeGreaterThanOrEqual(3)
      expect(mission.evidence).toHaveLength(3)
      if (index > 0) expect(mission.requires).toContain(shanghaiCampaign[index - 1].id)
    }
  })

  it('keeps permanent growth horizontal as well as vertical', () => {
    expect(skillNodes).toHaveLength(9)
    for (const branch of ['行动', '系统', '共情']) expect(skillNodes.filter((skill) => skill.branch === branch)).toHaveLength(3)
    expect(skillNodes.filter((skill) => skill.routeAbility).length).toBeGreaterThanOrEqual(6)
  })

  it('applies equipment stats to combat and keeps rarity budgets coherent', () => {
    const profile = { equipped: { weapon: 'wrench-gold', helmet: 'helmet-blue', armor: 'armor-gold', boots: 'boots-blue' }, unlockedSkills: ['action-footwork'] }
    const stats = resolveCombatStats(profile)
    expect(stats.maxHp).toBeGreaterThan(100)
    expect(stats.attack).toBeGreaterThan(16)
    expect(stats.moveSpeed).toBeGreaterThan(210)
    const rarityPower = new Map<string, Set<number>>()
    equipment.forEach((item) => { if (!rarityPower.has(item.rarity)) rarityPower.set(item.rarity, new Set()); rarityPower.get(item.rarity)?.add(item.power) })
    for (const powers of rarityPower.values()) expect(powers.size).toBe(1)
  })

  it('changes more than health across three difficulty tiers', () => {
    expect(Object.keys(difficultyTuning)).toEqual(['experience', 'standard', 'challenge'])
    expect(difficultyTuning.experience.enemyDamage).toBeLessThan(difficultyTuning.standard.enemyDamage)
    expect(difficultyTuning.challenge.telegraphTime).toBeLessThan(difficultyTuning.standard.telegraphTime)
    expect(difficultyTuning.challenge.pollutionRate).toBeGreaterThan(difficultyTuning.standard.pollutionRate)
  })
})
