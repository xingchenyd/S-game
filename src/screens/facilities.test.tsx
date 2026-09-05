// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import TrainingScreen from './TrainingScreen'
import MuseumScreen from './MuseumScreen'
import { loginOrCreate } from '../store/profile'
import { modeSimulations, playModes } from '../data/playModes'
import { scoreTrainingRoom, trainingRoomPlans } from '../data/trainingRooms'
import { collectibles } from '../data/content'

beforeEach(() => {
  localStorage.clear()
  Element.prototype.scrollIntoView = vi.fn()
  window.scrollTo = vi.fn()
})
afterEach(cleanup)

describe('training stations', () => {
  it('provides a labelled entry, preview and rule sheet for every station', () => {
    render(<TrainingScreen profile={loginOrCreate('训练验收')} onChange={vi.fn()} />)
    for (const mode of playModes) {
      expect(screen.getByRole('button', { name: `开始${mode.shortName}训练` })).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: `查看${mode.shortName}规则` }))
      expect(screen.getByRole('dialog').textContent).toContain(mode.winCondition)
      fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    }
    expect(screen.getAllByAltText(/场景预览$/)).toHaveLength(11)
  })

  it('opens a controllable room instead of presenting a full-screen quiz', () => {
    const mode = playModes[0]
    render(<TrainingScreen profile={loginOrCreate('训练验收')} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: `开始${mode.shortName}训练` }))
    expect(screen.getByRole('application', { name: '使用方向键移动行动员并靠近目标互动' })).toBeTruthy()
    expect(screen.getByRole('region', { name: `${trainingRoomPlans[mode.id][0].name}可操作训练房间` })).toBeTruthy()
    expect(screen.getByRole('button', { name: '向上移动' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: new RegExp(modeSimulations[0].rounds[0].options[0].label) })).toBeNull()
  })

  it('defines three varied practical rooms per station and grades mistakes without timing', () => {
    const mechanics = new Set<string>()
    for (const mode of playModes) {
      const rooms = trainingRoomPlans[mode.id]
      expect(rooms).toHaveLength(3)
      expect(rooms.filter((room) => room.mechanic !== 'terminal').length).toBeGreaterThanOrEqual(2)
      rooms.forEach((room) => mechanics.add(room.mechanic))
    }
    expect([...mechanics].sort()).toEqual(['escort', 'scan', 'sequence', 'sort', 'terminal'])
    expect(scoreTrainingRoom(0)).toBe(100)
    expect(scoreTrainingRoom(2)).toBe(80)
    expect(scoreTrainingRoom(0, false)).toBe(80)
  })
})

describe('museum rooms and passports', () => {
  it('filters rooms, searches and restores the collection', () => {
    render(<MuseumScreen profile={loginOrCreate('展馆验收')} />)
    fireEvent.click(screen.getByRole('button', { name: '电子' }))
    expect(screen.getByRole('button', { name: '电子' }).getAttribute('aria-pressed')).toBe('true')
    const search = screen.getByRole('textbox', { name: '搜索藏品、地点或关键词' })
    fireEvent.change(search, { target: { value: '不存在的收藏关键词' } })
    expect(screen.getByText('没有符合条件的材料护照。')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '清空搜索' }))
    expect(screen.queryByText('没有符合条件的材料护照。')).toBeNull()
  })

  it('opens an unlocked passport and makes its detail focusable', () => {
    const profile = loginOrCreate('展馆验收')
    const item = collectibles.find((entry) => entry.id === profile.collectibles[1])!
    render(<MuseumScreen profile={profile} />)
    fireEvent.click(screen.getByRole('button', { name: `查看${item.name}的材料护照` }))
    const detail = screen.getByRole('complementary', { name: '藏品材料护照' })
    expect(within(detail).getByRole('heading', { name: item.name })).toBeTruthy()
    expect(detail.textContent).toContain(item.after)
    expect(document.activeElement).toBe(detail)
  })

  it('shows an informative empty display without unlocking any items', () => {
    render(<MuseumScreen profile={{ ...loginOrCreate('展馆验收'), collectibles: [] }} />)
    expect(screen.getByRole('heading', { name: '为第一件藏品留一束光' })).toBeTruthy()
    for (const card of screen.getAllByRole('button', { name: /^尚未发现，获取线索/ })) {
      expect((card as HTMLButtonElement).disabled).toBe(true)
    }
  })
})
