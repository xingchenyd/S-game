import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, MapPin, ScanSearch } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { AdventureDefinition, CampaignMission } from '../types'
import { assetUrl } from '../utils/assets'

interface Props { mission: CampaignMission; adventure: AdventureDefinition; previewTargets: boolean; onComplete: () => void }
interface Position { x: number; y: number }
const targetPositions = [{ x: 21, y: 26 }, { x: 74, y: 32 }, { x: 55, y: 73 }]

export default function ExplorationRoom({ mission, adventure, previewTargets, onComplete }: Props) {
  const held = useRef(new Set<string>())
  const positionRef = useRef<Position>({ x: 48, y: 82 })
  const movingRef = useRef(false)
  const [position, setPosition] = useState(positionRef.current)
  const [found, setFound] = useState<number[]>([])
  const [facing, setFacing] = useState<'front' | 'back' | 'right' | 'left'>('front')
  const [moving, setMoving] = useState(false)
  const [frame, setFrame] = useState(0)
  const targets = useMemo(() => targetPositions.map((target, index) => ({ ...target, label: mission.evidence[index] })), [mission.evidence])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (!['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'].includes(key)) return
      event.preventDefault(); held.current.add(key)
    }
    const up = (event: KeyboardEvent) => held.current.delete(event.key.toLowerCase())
    const clear = () => held.current.clear()
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear) }
  }, [])

  useEffect(() => {
    let request = 0
    let previous = performance.now()
    let animationAt = previous
    const tick = (now: number) => {
      const delta = Math.min(.04, (now - previous) / 1000); previous = now
      const keys = held.current
      let dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
      let dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'))
      const active = Boolean(dx || dy)
      if (active) {
        const length = Math.hypot(dx, dy); dx /= length; dy /= length
        const current = positionRef.current
        const next = { x: Math.max(7, Math.min(93, current.x + dx * 22 * delta)), y: Math.max(12, Math.min(88, current.y + dy * 22 * delta)) }
        positionRef.current = next; setPosition(next)
        if (Math.abs(dx) > Math.abs(dy)) setFacing(dx < 0 ? 'left' : 'right')
        else setFacing(dy < 0 ? 'back' : 'front')
        if (now - animationAt > 150) { animationAt = now; setFrame((value) => (value + 1) % 2) }
      }
      if (movingRef.current !== active) { movingRef.current = active; setMoving(active) }
      request = requestAnimationFrame(tick)
    }
    request = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(request)
  }, [])

  useEffect(() => {
    targets.forEach((target, index) => {
      if (!found.includes(index) && Math.hypot(position.x - target.x, position.y - target.y) < 8) setFound((items) => items.includes(index) ? items : [...items, index])
    })
  }, [position, found, targets])

  const direction = facing === 'left' || facing === 'right' ? 'right' : facing
  const sprite = moving ? assetUrl(`art/legacy/sprites/hero_walk_${direction}_${frame + 1}.png`) : assetUrl(`art/legacy/sprites/hero_idle_${direction}.png`)
  const hold = (key: string) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); held.current.add(key) },
    onPointerUp: () => held.current.delete(key), onPointerCancel: () => held.current.delete(key),
  })

  return <section className="exploration-room" style={{ '--room-art': `url(${adventure.background})`, '--accent': adventure.accent } as React.CSSProperties}>
    <div className="room-brief"><span className="eyebrow">MOVEABLE ROOM · {mission.location}</span><h2>{mission.title}</h2><p>{mission.objective}</p><b><ScanSearch /> 已发现 {found.length}/3</b></div>
    <div className="room-stage">
      <span className="room-floor" /><span className="room-wall wall-a" /><span className="room-wall wall-b" /><span className="room-light" />
      {targets.map((target, index) => <span key={target.label} className={`room-target ${found.includes(index) ? 'found' : ''} ${previewTargets ? 'preview' : ''}`} style={{ left: `${target.x}%`, top: `${target.y}%` }}><MapPin /><b>{found.includes(index) ? `${target.label} · 已记录` : previewTargets ? target.label : '未知信号'}</b></span>)}
      <span className={`room-player face-${facing} ${moving ? 'is-moving' : ''}`} style={{ left: `${position.x}%`, top: `${position.y}%` }}><img src={sprite} alt="行动员" /><i /></span>
      <div className="room-dpad" aria-label="移动控制"><button {...hold('arrowup')} aria-label="向上移动"><ArrowUp /></button><button {...hold('arrowleft')} aria-label="向左移动"><ArrowLeft /></button><button {...hold('arrowdown')} aria-label="向下移动"><ArrowDown /></button><button {...hold('arrowright')} aria-label="向右移动"><ArrowRight /></button></div>
    </div>
    <footer><span>连续移动：WASD / 方向键 · 手机按住方向按钮</span><button className="primary-button" disabled={found.length < 3} onClick={onComplete}>{found.length < 3 ? '找到全部证据后继续' : '证据齐全，进入污染压制'} <ArrowRight /></button></footer>
  </section>
}
