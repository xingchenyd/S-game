import { Footprints, MapPin, MousePointer2, Navigation, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { PlayerProfile, Screen } from '../types'
import { assetUrl } from '../utils/assets'

interface Props { profile: PlayerProfile; onNavigate: (screen: Screen) => void }
interface Point { x: number; y: number }
interface Facility { id: Screen; name: string; short: string; description: string; position: Point; approach: Point; tone: string; image?: string; align?: 'left' }

const WORLD_SIZE = 1000
const PLAYER_RADIUS = 20
const facilities: Facility[] = [
  { id: 'adventure', name: '城市行动门', short: '出发', description: '主线剧情、探索与污染外壳战斗', position: { x: 500, y: 190 }, approach: { x: 500, y: 305 }, tone: '#6ff4ba' },
  { id: 'equipment', name: '装备工坊', short: '装配', description: '检修工具与行动装备', position: { x: 218, y: 235 }, approach: { x: 365, y: 340 }, tone: '#ffbd66' },
  { id: 'skills', name: '循环能力台', short: '能力', description: '行动、系统与共情能力树', position: { x: 800, y: 250 }, approach: { x: 690, y: 340 }, tone: '#71dfff', align: 'left' },
  { id: 'museum', name: '价值展馆', short: '收藏', description: '材料护照、原型与藏品对话', position: { x: 130, y: 515 }, approach: { x: 295, y: 520 }, tone: '#ffe06b' },
  { id: 'theater', name: '循环剧场', short: '故事', description: '两分钟互动环境故事库', position: { x: 665, y: 425 }, approach: { x: 620, y: 535 }, tone: '#ff86ba', image: 'art/legacy/sprites/facility_story.png', align: 'left' },
  { id: 'profile', name: '行动档案室', short: '档案', description: '本机学习记录与个人进度', position: { x: 860, y: 590 }, approach: { x: 705, y: 590 }, tone: '#b6a0ff', align: 'left' },
  { id: 'training', name: '循环训练场', short: '训练', description: '分类、护送、污染控制等专项玩法', position: { x: 230, y: 770 }, approach: { x: 365, y: 650 }, tone: '#ff8d63' },
  { id: 'exchange', name: '现实兑换站', short: '兑换', description: '稳定原型凭证与纪念品方案', position: { x: 500, y: 820 }, approach: { x: 500, y: 680 }, tone: '#79f09d' },
]

const obstacles = [
  { x: 30, y: 70, w: 310, h: 250 }, { x: 355, y: 30, w: 290, h: 245 }, { x: 665, y: 70, w: 305, h: 250 },
  { x: 15, y: 350, w: 245, h: 270 }, { x: 745, y: 370, w: 245, h: 300 },
  { x: 35, y: 675, w: 300, h: 280 }, { x: 385, y: 735, w: 235, h: 240 },
]

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const collides = (point: Point) => obstacles.some((box) => point.x + PLAYER_RADIUS > box.x && point.x - PLAYER_RADIUS < box.x + box.w && point.y + PLAYER_RADIUS > box.y && point.y - PLAYER_RADIUS < box.y + box.h)

export default function HubScreen({ profile, onNavigate }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const held = useRef(new Set<string>())
  const target = useRef<Point | null>(null)
  const nearestRef = useRef<Facility | null>(null)
  const movingRef = useRef(false)
  const noticeTimer = useRef(0)
  const positionRef = useRef<Point>({ x: 500, y: 560 })
  const [position, setPosition] = useState(positionRef.current)
  const [viewport, setViewport] = useState({ width: 1000, height: 700 })
  const [facing, setFacing] = useState<'front' | 'back' | 'right' | 'left'>('front')
  const [moving, setMoving] = useState(false)
  const [frame, setFrame] = useState(0)
  const [notice, setNotice] = useState('')

  const nearest = useMemo(() => {
    const ranked = facilities.map((facility) => ({ facility, value: distance(position, facility.approach) })).sort((a, b) => a.value - b.value)[0]
    return ranked.value <= 118 ? ranked.facility : null
  }, [position])
  nearestRef.current = nearest

  useEffect(() => {
    if (!viewportRef.current) return
    const observer = new ResizeObserver(([entry]) => setViewport({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(viewportRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'].includes(key)) { event.preventDefault(); held.current.add(key); target.current = null }
      if (!event.repeat && ['e', 'enter', ' '].includes(key) && nearestRef.current) { event.preventDefault(); onNavigate(nearestRef.current.id) }
    }
    const up = (event: KeyboardEvent) => held.current.delete(event.key.toLowerCase())
    const blur = () => held.current.clear()
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur) }
  }, [onNavigate])

  useEffect(() => {
    let animation = 0
    let previous = performance.now()
    let lastFrame = previous
    const tick = (now: number) => {
      const delta = Math.min(.04, (now - previous) / 1000); previous = now
      const keys = held.current
      let dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
      let dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'))
      if (!dx && !dy && target.current) {
        const remainingX = target.current.x - positionRef.current.x
        const remainingY = target.current.y - positionRef.current.y
        const remaining = Math.hypot(remainingX, remainingY)
        if (remaining < 8) target.current = null
        else { dx = remainingX / remaining; dy = remainingY / remaining }
      }
      const active = Boolean(dx || dy)
      if (active) {
        const length = Math.hypot(dx, dy); dx /= length; dy /= length
        const current = positionRef.current
        const step = 215 * delta
        const nextX = { x: clamp(current.x + dx * step, 58, 942), y: current.y }
        const afterX = collides(nextX) ? current : nextX
        const nextY = { x: afterX.x, y: clamp(afterX.y + dy * step, 75, 925) }
        const next = collides(nextY) ? afterX : nextY
        positionRef.current = next; setPosition(next)
        if (Math.abs(dx) > Math.abs(dy)) setFacing(dx < 0 ? 'left' : 'right')
        else setFacing(dy < 0 ? 'back' : 'front')
        if (now - lastFrame > 150) { lastFrame = now; setFrame((value) => (value + 1) % 2) }
      }
      if (movingRef.current !== active) { movingRef.current = active; setMoving(active) }
      animation = requestAnimationFrame(tick)
    }
    animation = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(animation); window.clearTimeout(noticeTimer.current) }
  }, [])

  const worldScale = Math.max(1, viewport.width / WORLD_SIZE, viewport.height / WORLD_SIZE)
  const scaledWorld = WORLD_SIZE * worldScale
  const camera = { x: clamp(viewport.width / 2 - position.x * worldScale, viewport.width - scaledWorld, 0), y: clamp(viewport.height / 2 - position.y * worldScale, viewport.height - scaledWorld, 0) }
  const direction = facing === 'left' || facing === 'right' ? 'right' : facing
  const heroSprite = moving ? assetUrl(`art/legacy/sprites/hero_walk_${direction}_${frame + 1}.png`) : assetUrl(`art/legacy/sprites/hero_idle_${direction}.png`)

  const chooseFacility = (facility: Facility) => {
    if (distance(positionRef.current, facility.approach) <= 118) return onNavigate(facility.id)
    target.current = facility.approach; setNotice(`正在前往：${facility.name}`)
    window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(''), 1800)
  }
  const holdDirection = (key: string) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); held.current.add(key); target.current = null },
    onPointerUp: () => held.current.delete(key), onPointerCancel: () => held.current.delete(key),
  })

  return <div className="base-world-screen screen-enter">
    <div className="base-viewport" ref={viewportRef}>
      <div className="base-world" style={{ '--camera-x': `${camera.x}px`, '--camera-y': `${camera.y}px`, '--world-scale': worldScale, '--base-art': `url(${assetUrl('art/legacy/generated/hub.png')})` } as CSSProperties}>
        <span className="base-atmosphere" />
        {facilities.map((facility) => {
          const close = nearest?.id === facility.id
          return <button key={facility.id} className={`world-facility ${close ? 'is-near' : ''} ${facility.image ? 'has-building' : ''} ${facility.align === 'left' ? 'align-left' : ''}`} style={{ left: facility.position.x, top: facility.position.y, '--facility-tone': facility.tone } as CSSProperties} onClick={() => chooseFacility(facility)} aria-label={`${facility.name}：${facility.description}`}>
            {facility.image && <img src={assetUrl(facility.image)} alt="" />}
            <span className="facility-beacon"><MapPin /></span>
            <span className="facility-sign"><small>{facility.short}</small><b>{facility.name}</b><em>{close ? '可交互' : facility.description}</em></span>
          </button>
        })}
        <span className={`world-player face-${facing} ${moving ? 'is-moving' : ''}`} style={{ left: position.x, top: position.y }}><span className="player-shadow" /><img src={heroSprite} alt={`${profile.username}的行动角色`} /></span>
      </div>

      <header className="world-hud">
        <div className="world-identity"><span>LV.{profile.level}</span><b>{profile.username}</b><small>循环基地 · 上海站</small></div>
        <div className="world-objective"><Sparkles /><span><small>当前行动</small><b>前往城市行动门，调查新的污染外壳</b></span></div>
        <div className="world-currency">稳定原型 <b>{profile.prototypes.length}</b><span>◈ {profile.points}</span></div>
      </header>

      <div className={`world-interaction ${nearest ? 'is-ready' : ''}`}>
        {nearest ? <><span className="interaction-key">E</span><span><small>{nearest.description}</small><b>进入 {nearest.name}</b></span><button onClick={() => onNavigate(nearest.id)}>交互</button></> : <><Footprints /><span><small>WASD / 方向键移动 · 点击设施可自动寻路</small><b>在基地中寻找功能区</b></span></>}
      </div>
      {notice && <div className="world-notice"><Navigation />{notice}</div>}

      <div className="base-touch-controls" aria-label="基地移动控制"><button {...holdDirection('arrowup')} className="up" aria-label="向上移动">▲</button><button {...holdDirection('arrowleft')} className="left" aria-label="向左移动">◀</button><button {...holdDirection('arrowdown')} className="down" aria-label="向下移动">▼</button><button {...holdDirection('arrowright')} className="right" aria-label="向右移动">▶</button></div>
      <button className={`base-interact-button ${nearest ? 'is-ready' : ''}`} disabled={!nearest} onClick={() => nearest && onNavigate(nearest.id)}><MousePointer2 /><span>{nearest ? '进入' : '靠近设施'}</span></button>
    </div>
  </div>
}
