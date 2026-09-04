// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import TheaterScreen from './TheaterScreen'
import { loginOrCreate } from '../store/profile'
import { stories } from '../data/content'

vi.mock('../store/audio', () => ({ speakChinese: vi.fn(() => false), stopSpeech: vi.fn() }))
beforeEach(() => { localStorage.clear(); window.scrollTo = vi.fn() })
afterEach(cleanup)
const target = stories.find((story) => story.title === '一条不会消失的车辙')!
const enterStory = () => {
  fireEvent.click(screen.getByRole('button', { name: /黑独山 · 无痕边界/ }))
  fireEvent.click(screen.getByRole('button', { name: /一条不会消失的车辙/ }))
}

describe('theater reading layout', () => {
  it('separates portraitless narration and scene art, with an accessible progress bar', () => {
    const immersive = vi.fn()
    render(<TheaterScreen profile={loginOrCreate('剧场验收')} onChange={vi.fn()} onImmersive={immersive} />)
    enterStory()
    expect(immersive).toHaveBeenLastCalledWith(true)
    const art = screen.getByRole('img', { name: `${target.location} · ${target.title}场景插画` })
    expect(art.closest('figure')).toBeTruthy()
    expect(art.closest('.dialogue-box')).toBeNull()
    expect(screen.getByText(target.beats[0].text).closest('.dialogue-copy')).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1')
    fireEvent.click(screen.getByRole('button', { name: '继续' }))
    const portrait = screen.getByRole('img', { name: `${target.beats[1].speaker}头像` })
    expect(portrait.closest('.dialogue-speaker')).toBeTruthy()
    expect(screen.getByText(target.beats[1].text).closest('.dialogue-copy')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '退出故事' }))
    expect(immersive).toHaveBeenLastCalledWith(false)
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('keeps choices, replies, progression and first-read rewards working', () => {
    const onChange = vi.fn()
    const profile = loginOrCreate('剧场验收')
    render(<TheaterScreen profile={profile} onChange={onChange} />)
    enterStory()
    for (const [index, beat] of target.beats.entries()) {
      expect(screen.getByText(beat.text)).toBeTruthy()
      expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(String(index + 1))
      if (beat.choices) {
        const choice = beat.choices[0]
        fireEvent.click(screen.getByRole('button', { name: choice.text }))
        expect(screen.getByText(choice.reply)).toBeTruthy()
      }
      fireEvent.click(screen.getByRole('button', { name: index === target.beats.length - 1 ? '完成故事' : '继续' }))
    }
    expect(screen.getByRole('heading', { name: '故事已收录' })).toBeTruthy()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].points).toBe(profile.points + 30)
  })
})
