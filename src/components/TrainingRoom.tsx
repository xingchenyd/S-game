import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Hand, MapPin, Monitor, PackageCheck, RotateCcw, ScanSearch } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { SimulationRound } from '../data/playModes'
import { scoreTrainingRoom, trainingMaterials, trainingTypeLabels, type TrainingRoomPlan } from '../data/trainingRooms'
import type { WasteType } from '../types'
import { assetUrl } from '../utils/assets'

interface Position { x: number; y: number }
interface RoomResult { score: number; effect: [number, number]; principle: string; correct: boolean }
interface Props { plan: TrainingRoomPlan; round: SimulationRound; background: string; onComplete: (result: RoomResult) => void }

const scanPositions = [{ x: 20, y: 29 }, { x: 74, y: 28 }, { x: 52, y: 62 }]
const materialPositions = [{ x: 18, y: 62 }, { x: 40, y: 48 }, { x: 62, y: 66 }, { x: 81, y: 53 }]
const stationPositions = [{ x: 23, y: 29 }, { x: 75, y: 37 }, { x: 51, y: 64 }]
const bins: { type: WasteType; x: number; y: number }[] = [
  { type: 'electronic', x: 16, y: 19 }, { type: 'plastic', x: 39, y: 19 }, { type: 'paper', x: 62, y: 19 }, { type: 'textile', x: 85, y: 19 },
]
const evidenceArt = ['asset-tag', 'manifest', 'material-sample']
const near = (a: Position, b: Position, distance = 8) => Math.hypot(a.x - b.x, a.y - b.y) <= distance

export default function TrainingRoom({ plan, round, background, onComplete }: Props) {
  const held = useRef(new Set<string>())
  const positionRef = useRef<Position>({ x: 49, y: 84 })
  const interactRef = useRef<() => void>(() => undefined)
  const movingRef = useRef(false)
  const [position, setPosition] = useState(positionRef.current)
  const [facing, setFacing] = useState<'front' | 'back' | 'right' | 'left'>('back')
  const [moving, setMoving] = useState(false)
  const [frame, setFrame] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const [carrying, setCarrying] = useState<number | null>(null)
  const [sequence, setSequence] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [notice, setNotice] = useState('靠近发光目标，按 E 或右下角互动键。')
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [terminalAnswer, setTerminalAnswer] = useState<number | null>(null)
  const [roomComplete, setRoomComplete] = useState(false)
  const materials = useMemo(() => trainingMaterials.map((item, index) => ({ ...item, ...materialPositions[index] })), [])
  const terminalPosition = { x: 77, y: 37 }
  const escortSource = { x: 20, y: 68 }
  const escortGoal = { x: 80, y: 26 }
  const hazards = [{ x: 43, y: 61 }, { x: 62, y: 43 }]

  const finishIf = useCallback((condition: boolean, message: string) => {
    if (!condition || roomComplete) return
    setRoomComplete(true); setNotice(message)
  }, [roomComplete])

  const interact = useCallback(() => {
    if (roomComplete) return
    if (plan.mechanic === 'scan') {
      const index = scanPositions.findIndex((target, targetIndex) => !completed.includes(targetIndex) && near(positionRef.current, target))
      if (index < 0) { setNotice('这里没有可记录的证据，继续靠近发光物件。'); return }
      const next = [...completed, index]; setCompleted(next); setNotice(`证据 ${index + 1} 已写入训练档案。`); finishIf(next.length === 3, '调查完成：三条证据已经互相印证。')
      return
    }
    if (plan.mechanic === 'sort') {
      if (carrying === null) {
        const index = materials.findIndex((item, itemIndex) => !completed.includes(itemIndex) && near(positionRef.current, item))
        if (index < 0) { setNotice('靠近散落材料拾取，随后送往上方对应工位。'); return }
        setCarrying(index); setNotice(`已拾取${materials[index].name}，请送往“${trainingTypeLabels[materials[index].type]}”。`); return
      }
      const targetBin = bins.find((bin) => near(positionRef.current, bin, 9))
      if (!targetBin) { setNotice('携带中：走到上方分类工位后再次互动。'); return }
      if (targetBin.type !== materials[carrying].type) { setMistakes((value) => value + 1); setCarrying(null); setNotice('分类不匹配，材料已退回原位；先看材质和状态。'); return }
      const next = [...completed, carrying]; setCompleted(next); setCarrying(null); setNotice('分类正确，批次纯度保持稳定。'); finishIf(next.length === materials.length, '分流完成：全部材料已进入正确处理路径。')
      return
    }
    if (plan.mechanic === 'sequence') {
      const index = stationPositions.findIndex((station) => near(positionRef.current, station))
      if (index < 0) { setNotice(`当前步骤：${plan.steps?.[sequence] ?? '寻找机关'}。`); return }
      if (index !== sequence) { setMistakes((value) => value + 1); setSequence(0); setCompleted([]); setNotice('机关顺序错误，系统已安全复位。请从第一步重新开始。'); return }
      const next = sequence + 1; setSequence(next); setCompleted((items) => [...items, index]); setNotice(`${plan.steps?.[index] ?? `机关 ${index + 1}`}已启动。`); finishIf(next === 3, '系统联动成功：正确顺序让设施稳定运行。')
      return
    }
    if (plan.mechanic === 'escort') {
      if (carrying === null && near(positionRef.current, escortSource, 9)) { setCarrying(0); setNotice('样本已装入防护箱，避开发光危险区送往交接门。'); return }
      if (carrying !== null && near(positionRef.current, escortGoal, 10)) { setCarrying(null); setCompleted([0]); finishIf(true, '安全交接完成：材料状态与去向均已记录。'); return }
      setNotice(carrying === null ? '前往左下方装载点接取材料。' : '继续护送到右上方绿色交接门。')
      return
    }
    if (plan.mechanic === 'terminal') {
      if (!near(positionRef.current, terminalPosition, 10)) { setNotice('先走到右上方的现场终端，再进入情境判断。'); return }
      setTerminalOpen(true)
    }
  }, [carrying, completed, finishIf, materials, plan.mechanic, plan.steps, roomComplete, sequence])
  interactRef.current = interact

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === 'e' && !terminalOpen) { event.preventDefault(); interactRef.current(); return }
      if (!['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'].includes(key) || terminalOpen) return
      event.preventDefault(); held.current.add(key)
    }
    const up = (event: KeyboardEvent) => held.current.delete(event.key.toLowerCase())
    const clear = () => held.current.clear()
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear) }
  }, [terminalOpen])

  useEffect(() => {
    let request = 0; let previous = performance.now(); let animationAt = previous
    const tick = (now: number) => {
      const delta = Math.min(.04, (now - previous) / 1000); previous = now
      let dx = Number(held.current.has('d') || held.current.has('arrowright')) - Number(held.current.has('a') || held.current.has('arrowleft'))
      let dy = Number(held.current.has('s') || held.current.has('arrowdown')) - Number(held.current.has('w') || held.current.has('arrowup'))
      const active = Boolean(dx || dy) && !terminalOpen
      if (active) {
        const length = Math.hypot(dx, dy); dx /= length; dy /= length
        const current = positionRef.current
        const next = { x: Math.max(6, Math.min(94, current.x + dx * 23 * delta)), y: Math.max(14, Math.min(89, current.y + dy * 23 * delta)) }
        positionRef.current = next; setPosition(next)
        if (Math.abs(dx) > Math.abs(dy)) setFacing(dx < 0 ? 'left' : 'right'); else setFacing(dy < 0 ? 'back' : 'front')
        if (now - animationAt > 145) { animationAt = now; setFrame((value) => (value + 1) % 2) }
      }
      if (movingRef.current !== active) { movingRef.current = active; setMoving(active) }
      request = requestAnimationFrame(tick)
    }
    request = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(request)
  }, [terminalOpen])

  useEffect(() => {
    if (plan.mechanic !== 'escort' || carrying === null || roomComplete) return
    if (!hazards.some((hazard) => near(position, hazard, 9))) return
    setCarrying(null); setMistakes((value) => value + 1); setNotice('样本接触风险区，训练系统已将它送回装载点。')
  }, [carrying, plan.mechanic, position, roomComplete])

  const chooseTerminal = (index: number) => {
    if (terminalAnswer !== null) return
    setTerminalAnswer(index)
    if (index !== round.best) setMistakes((value) => value + 1)
  }
  const confirmTerminal = () => {
    if (terminalAnswer === null) return
    setTerminalOpen(false); setRoomComplete(true); setCompleted([0]); setNotice('终端判断已记录。情境题只是房间中的一台设备，不是整场训练。')
  }
  const resetRoom = () => { positionRef.current = { x: 49, y: 84 }; setPosition(positionRef.current); setCompleted([]); setCarrying(null); setSequence(0); setMistakes(0); setNotice('靠近发光目标，按 E 或右下角互动键。'); setTerminalOpen(false); setTerminalAnswer(null); setRoomComplete(false) }
  const direction = facing === 'left' || facing === 'right' ? 'right' : facing
  const sprite = moving ? assetUrl(`art/legacy/sprites/hero_walk_${direction}_${frame + 1}.png`) : assetUrl(`art/legacy/sprites/hero_idle_${direction}.png`)
  const hold = (key: string) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); held.current.add(key) },
    onPointerUp: () => held.current.delete(key), onPointerCancel: () => held.current.delete(key),
  })
  const nearby = plan.mechanic === 'terminal' ? near(position, terminalPosition, 10)
    : plan.mechanic === 'escort' ? near(position, carrying === null ? escortSource : escortGoal, 10)
      : plan.mechanic === 'sequence' ? stationPositions.some((item) => near(position, item))
        : plan.mechanic === 'scan' ? scanPositions.some((item, index) => !completed.includes(index) && near(position, item))
          : carrying !== null ? bins.some((item) => near(position, item, 9)) : materials.some((item, index) => !completed.includes(index) && near(position, item))

  return <section className={`training-room mechanic-${plan.mechanic}`} style={{ '--training-art': `url(${background})` } as CSSProperties} aria-label={`${plan.name}可操作训练房间`}>
    <header className="training-room-brief"><div><span>无战斗训练房 / {plan.mechanic.toUpperCase()}</span><h1>{plan.name}</h1><p>{plan.briefing}</p></div><aside><small>失误记录</small><b>{mistakes}</b><small>不设倒计时</small></aside></header>
    <div className="training-room-stage" role="application" aria-label="使用方向键移动行动员并靠近目标互动">
      <span className="training-room-grid" />
      {plan.mechanic === 'scan' && scanPositions.map((target, index) => <span key={index} className={`training-prop scan-prop ${completed.includes(index) ? 'done' : ''}`} style={{ left: `${target.x}%`, top: `${target.y}%` }}><i /><img src={assetUrl(`art/evidence/${evidenceArt[index]}.webp`)} alt={completed.includes(index) ? `已记录证据${index + 1}` : `待调查证据${index + 1}`} /><b><ScanSearch /> {completed.includes(index) ? '已记录' : '现场证据'}</b></span>)}
      {plan.mechanic === 'sort' && <>{bins.map((bin) => <span key={bin.type} className={`training-bin bin-${bin.type}`} style={{ left: `${bin.x}%`, top: `${bin.y}%` }}><PackageCheck /><b>{trainingTypeLabels[bin.type]}</b></span>)}{materials.map((item, index) => !completed.includes(index) && carrying !== index && <span key={item.id} className="training-prop material-prop" style={{ left: `${item.x}%`, top: `${item.y}%` }}><i /><img src={assetUrl(`art/legacy/sprites/${item.art}`)} alt={item.name} /><b>{item.name}</b></span>)}</>}
      {plan.mechanic === 'sequence' && stationPositions.map((station, index) => <span key={index} className={`training-station ${completed.includes(index) ? 'done' : ''} ${sequence === index ? 'active' : ''}`} style={{ left: `${station.x}%`, top: `${station.y}%` }}><span>{index + 1}</span><b>{plan.steps?.[index]}</b></span>)}
      {plan.mechanic === 'escort' && <><span className="escort-source" style={{ left: `${escortSource.x}%`, top: `${escortSource.y}%` }}><PackageCheck /><b>{carrying === null && !roomComplete ? '样本装载点' : '已取件'}</b></span><span className="escort-goal" style={{ left: `${escortGoal.x}%`, top: `${escortGoal.y}%` }}><MapPin /><b>安全交接门</b></span>{hazards.map((hazard, index) => <span key={index} className="training-hazard" style={{ left: `${hazard.x}%`, top: `${hazard.y}%` }}><i /><b>污染扩散区</b></span>)}</>}
      {plan.mechanic === 'terminal' && <span className="training-terminal" style={{ left: `${terminalPosition.x}%`, top: `${terminalPosition.y}%` }}><Monitor /><b>现场判断终端</b><small>靠近后互动</small></span>}
      <span className={`training-player face-${facing} ${moving ? 'is-moving' : ''}`} style={{ left: `${position.x}%`, top: `${position.y}%` }}><img src={sprite} alt="训练行动员" />{carrying !== null && <img className="carried-item" src={plan.mechanic === 'sort' ? assetUrl(`art/legacy/sprites/${materials[carrying]?.art}`) : assetUrl('art/evidence/battery-case.webp')} alt="正在携带的材料" />}<i /></span>
      <div className="training-dpad" aria-label="移动控制"><button {...hold('arrowup')} aria-label="向上移动"><ArrowUp /></button><button {...hold('arrowleft')} aria-label="向左移动"><ArrowLeft /></button><button {...hold('arrowdown')} aria-label="向下移动"><ArrowDown /></button><button {...hold('arrowright')} aria-label="向右移动"><ArrowRight /></button></div>
      <button className={`training-interact ${nearby ? 'ready' : ''}`} disabled={roomComplete} onClick={interact}><Hand /><span>{nearby ? '互动' : '靠近目标'}</span><kbd>E</kbd></button>
      {terminalOpen && <div className="room-terminal-overlay" role="dialog" aria-modal="true" aria-labelledby="training-terminal-title"><section><span>地图内置终端 / 现场判断</span><h2 id="training-terminal-title">{round.title}</h2><p>{round.situation}</p><div>{round.options.map((option, index) => <button key={option.label} disabled={terminalAnswer !== null} className={terminalAnswer === null ? '' : index === round.best ? 'best' : terminalAnswer === index ? 'wrong' : 'dim'} onClick={() => chooseTerminal(index)}><i>{String.fromCharCode(65 + index)}</i><b>{option.label}</b></button>)}</div>{terminalAnswer !== null && <aside className={terminalAnswer === round.best ? 'best' : 'wrong'}><b>{terminalAnswer === round.best ? '判断有效' : '这次选择留下了代价'}</b><p>{round.options[terminalAnswer].feedback}</p><button onClick={confirmTerminal}>记录判断并返回房间</button></aside>}</section></div>}
      {roomComplete && <div className="training-room-clear"><Check /><span>房间目标完成</span><b>{plan.principle}</b></div>}
    </div>
    <footer className="training-room-footer"><div><b>{notice}</b><span>WASD / 方向键移动 · E互动 · 手机按住方向键</span></div><button className="secondary-button" onClick={resetRoom}><RotateCcw /> 重置房间</button><button className="primary-button" disabled={!roomComplete} onClick={() => onComplete({ score: scoreTrainingRoom(mistakes, terminalAnswer === null || terminalAnswer === round.best), effect: terminalAnswer === null ? [6, 6] : round.options[terminalAnswer].effect, principle: terminalAnswer === null ? plan.principle : round.options[terminalAnswer].principle, correct: mistakes === 0 && (terminalAnswer === null || terminalAnswer === round.best) })}>进入下一训练房 <ArrowRight /></button></footer>
  </section>
}
