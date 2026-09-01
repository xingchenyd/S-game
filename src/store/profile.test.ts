// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { listUsers, loadActiveProfile, loginOrCreate, logout, saveProfile } from './profile'

describe('local username saves', () => {
  beforeEach(() => localStorage.clear())

  it('creates and resumes a passwordless local profile', () => {
    const created = loginOrCreate(' 测试 玩家 ')
    expect(created.username).toBe('测试 玩家')
    expect(created.collectibles).toContain('battery')
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
})
