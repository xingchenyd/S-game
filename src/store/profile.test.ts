// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { listUsers, loadActiveProfile, loginOrCreate, logout, saveProfile } from './profile'

describe('local username saves', () => {
  beforeEach(() => localStorage.clear())

  it('creates and resumes a passwordless local profile', () => {
    const created = loginOrCreate(' 测试 玩家 ')
    expect(created.username).toBe('测试 玩家')
    expect(created.collectibles).toContain('battery')
    expect(created.currentMission).toBe('sh-01')
    expect(created.skillPoints).toBe(2)
    const saved = saveProfile({ ...created, points: 233 })
    expect(saved.points).toBe(233)
    expect(loadActiveProfile()?.points).toBe(233)
  })

  it('keeps multiple usernames separated', () => {
    loginOrCreate('玩家甲')
    loginOrCreate('玩家乙')
    expect(listUsers().map((user) => user.username).sort()).toEqual(['玩家乙', '玩家甲'])
    logout()
    expect(loadActiveProfile()).toBeNull()
  })

  it('grants story and mastery skill points once and unlocks story exhibits', () => {
    const created = loginOrCreate('成长测试')
    const afterStory = saveProfile({ ...created, storiesCompleted: ['e04-earphone-knot'] })
    expect(afterStory.skillPoints).toBe(3)
    expect(afterStory.collectibles).toContain('earphone-module')
    const repeated = saveProfile(afterStory)
    expect(repeated.skillPoints).toBe(3)
    const afterMastery = saveProfile({ ...repeated, modeMastery: { 'sorting-line': 80 } })
    expect(afterMastery.skillPoints).toBe(5)
    expect(saveProfile(afterMastery).skillPoints).toBe(5)
  })
})
