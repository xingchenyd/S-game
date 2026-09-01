import { describe, expect, it } from 'vitest'
import { adventures, collectibles, equipment, stories } from './content'

describe('game content integrity', () => {
  it('uses unique stable ids', () => {
    for (const collection of [adventures, collectibles, equipment, stories]) {
      const ids = collection.map((item) => item.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('ships every Shanghai waste theme and one future route', () => {
    expect(new Set(adventures.filter((route) => route.available).map((route) => route.wasteType))).toEqual(new Set(['electronic', 'plastic', 'paper', 'textile']))
    expect(adventures.some((route) => !route.available)).toBe(true)
  })

  it('keeps theater stories substantial and interactive', () => {
    expect(stories.length).toBeGreaterThanOrEqual(8)
    for (const story of stories) {
      expect(story.beats.length).toBeGreaterThanOrEqual(6)
      expect(story.beats.some((beat) => beat.choices && beat.choices.length >= 2)).toBe(true)
    }
  })
})
