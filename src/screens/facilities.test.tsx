// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import TrainingScreen from './TrainingScreen'
import MuseumScreen from './MuseumScreen'
import { loginOrCreate } from '../store/profile'
import { modeSimulations, playModes } from '../data/playModes'
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

  it('preserves three-stage scoring and prevents changing an answered decision', () => {
    const profile = loginOrCreate('训练验收')
    const onChange = vi.fn()
    const simulation = modeSimulations[0]
    const mode = playModes.find((item) => item.id === simulation.modeId)!
    render(<TrainingScreen profile={profile} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: `开始${mode.shortName}训练` }))
    for (const [index, round] of simulation.rounds.entries()) {
      const best = screen.getByRole('button', { name: new RegExp(round.options[round.best].label) })
      fireEvent.click(best)
      expect((best as HTMLButtonElement).disabled).toBe(true)
      fireEvent.click(screen.getByRole('button', { name: index === simulation.rounds.length - 1 ? '完成并复盘' : '进入下一阶段' }))
    }
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].modeMastery[mode.id]).toBe(100)
    expect(onChange.mock.calls[0][0].points).toBe(profile.points + 100)
    expect(screen.getByRole('heading', { name: `${mode.shortName} · 100分` })).toBeTruthy()
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
