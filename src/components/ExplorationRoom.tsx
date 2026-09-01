import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, MapPin, ScanSearch } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AdventureDefinition, CampaignMission } from '../types'
import { assetUrl } from '../utils/assets'

interface Props { mission: CampaignMission; adventure: AdventureDefinition; previewTargets: boolean; onComplete: () => void }
const targetPositions = [{ x: 21, y: 26 }, { x: 74, y: 32 }, { x: 55, y: 73 }]

export default function ExplorationRoom({ mission, adventure, previewTargets, onComplete }: Props) {
  const [position, setPosition] = useState({ x: 48, y: 82 })
  const [found, setFound] = useState<number[]>([])
  const targets = targetPositions.map((position, index) => ({ ...position, label: mission.evidence[index] }))
  const move = (dx: number, dy: number) => setPosition((current) => ({ x: Math.max(7, Math.min(93, current.x + dx)), y: Math.max(12, Math.min(88, current.y + dy)) }))

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const moves: Record<string, [number, number]> = { ArrowLeft: [-5, 0], a: [-5, 0], A: [-5, 0], ArrowRight: [5, 0], d: [5, 0], D: [5, 0], ArrowUp: [0, -5], w: [0, -5], W: [0, -5], ArrowDown: [0, 5], s: [0, 5], S: [0, 5] }
      if (moves[event.key]) { event.preventDefault(); move(...moves[event.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    targets.forEach((target, index) => {
      if (!found.includes(index) && Math.hypot(position.x - target.x, position.y - target.y) < 10) setFound((items) => [...items, index])
    })
  }, [position, found])

  return <section className="exploration-room" style={{ '--room-art': `url(${adventure.background})`, '--accent': adventure.accent } as React.CSSProperties}>
    <div className="room-brief"><span className="eyebrow">MOVEABLE ROOM · {mission.location}</span><h2>{mission.title}</h2><p>{mission.objective}</p><b><ScanSearch /> 已发现 {found.length}/3</b></div>
    <div className="room-stage">
      <span className="room-floor" /><span className="room-wall wall-a" /><span className="room-wall wall-b" /><span className="room-light" />
      {targets.map((target, index) => <span key={target.label} className={`room-target ${found.includes(index) ? 'found' : ''} ${previewTargets ? 'preview' : ''}`} style={{ left: `${target.x}%`, top: `${target.y}%` }}><MapPin /><b>{found.includes(index) ? `${target.label} · 已记录` : previewTargets ? target.label : '未知信号'}</b></span>)}
      <span className="room-player" style={{ left: `${position.x}%`, top: `${position.y}%` }}><img src={assetUrl('art/legacy/sprites/hero_idle_front.png')} alt="行动员" /><i /></span>
      <div className="room-dpad" aria-label="移动控制"><button aria-label="向上移动" onClick={() => move(0, -5)}><ArrowUp /></button><button aria-label="向左移动" onClick={() => move(-5, 0)}><ArrowLeft /></button><button aria-label="向下移动" onClick={() => move(0, 5)}><ArrowDown /></button><button aria-label="向右移动" onClick={() => move(5, 0)}><ArrowRight /></button></div>
    </div>
    <footer><span>键盘 WASD / 方向键 · 手机点击方向按钮</span><button className="primary-button" disabled={found.length < 3} onClick={onComplete}>{found.length < 3 ? '找到全部证据后继续' : '证据齐全，进入污染压制'} <ArrowRight /></button></footer>
  </section>
}
