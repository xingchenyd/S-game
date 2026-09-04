import { ArrowLeft, Check, ChevronRight, RotateCcw } from 'lucide-react'
import { useLayoutEffect, useMemo, useState, type CSSProperties } from 'react'
import { modeSimulations, playModes } from '../data/playModes'
import type { PlayerProfile, PlayModeDefinition } from '../types'
import GameIcon, { type GameIconName } from '../components/GameIcon'
import { assetUrl } from '../utils/assets'

const trainingVisuals: Record<string, { scene: string; area: string; accent: string; focus: string }> = {
  'branch-expedition': { scene: '01', area: '虹桥 · 城市调查线', accent: '#7de6ba', focus: '路线判断 / 风险与价值' },
  'pollution-control': { scene: '04', area: '苏州河 · 水岸控制区', accent: '#74ddff', focus: '源头识别 / 阻断扩散' },
  'sorting-line': { scene: '02', area: '撤展通道 · 分流工位', accent: '#ffce78', focus: '状态辨识 / 批次纯度' },
  'repair-bench': { scene: '06', area: '长宁 · 社区维修间', accent: '#ffa8c9', focus: '安全诊断 / 延长寿命' },
  'material-escort': { scene: '07', area: '临港 · 逆向物流线', accent: '#86d9ff', focus: '运输防护 / 完整交接' },
  'hazard-isolation': { scene: '03', area: '陆家嘴 · 风险隔离带', accent: '#ffb086', focus: '停止操作 / 隔离与上报' },
  'facility-defense': { scene: '09', area: '世博园 · 回收设施区', accent: '#e1db83', focus: '分流调度 / 设施维护' },
  'eco-mechanism': { scene: '04', area: '水岸 · 环境调节站', accent: '#91e8b7', focus: '流程顺序 / 能耗取舍' },
  'npc-commission': { scene: '06', area: '社区 · 居民服务站', accent: '#d6b2ff', focus: '倾听需求 / 可行方案' },
  'passport-hunt': { scene: '05', area: '杨浦 · 材料档案库', accent: '#f6d797', focus: '追溯证据 / 记录去向' },
  'finale-operation': { scene: '10', area: '世博园 · 闭环指挥部', accent: '#ff9cc4', focus: '综合判断 / 系统协作' },
}
const visualFor = (id: string) => trainingVisuals[id] ?? trainingVisuals['branch-expedition']
const visualStyle = (id: string): CSSProperties => ({ '--facility-accent': visualFor(id).accent }) as CSSProperties
const sceneFor = (id: string) => assetUrl(`art/campaign/sh-${visualFor(id).scene}.webp`)

const modeIcon = (id: string): GameIconName => ({
  'branch-expedition': 'map', 'pollution-control': 'pollution', 'sorting-line': 'materials',
  'repair-bench': 'equipment', 'material-escort': 'value', 'hazard-isolation': 'boss',
  'facility-defense': 'training', 'eco-mechanism': 'knowledge', 'npc-commission': 'theater',
  'passport-hunt': 'museum', 'finale-operation': 'prototype',
}[id] as GameIconName ?? 'training')

interface Props { profile: PlayerProfile; onChange: (profile: PlayerProfile) => void }

export default function TrainingScreen({ profile, onChange }: Props) {
  const [selected, setSelected] = useState<PlayModeDefinition | null>(null)
  const [showDesign, setShowDesign] = useState<PlayModeDefinition | null>(null)
  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [selected])

  if (selected) return <ModeRun key={selected.id} mode={selected} profile={profile} onChange={onChange} onExit={() => setSelected(null)} />

  const completed = Object.values(profile.modeMastery ?? {}).filter((score) => (score ?? 0) > 0).length
  return <div className="training-screen screen-enter">
    <header className="facility-hero training-title">
      <img className="facility-hero-art" src={assetUrl('art/campaign/sh-08.webp')} alt="城市循环调度室里的地图、材料档案与演练终端" />
      <div className="facility-hero-copy"><span className="facility-kicker">基地设施 / 情境演练中心</span><h1>循环训练场</h1><p>先在这里练习判断，再把经验带回城市。选择一个演练站，经历三个情境，观察你的决定如何改变安全与材料价值。</p><div className="facility-tags"><span>11 个演练站</span><span>3 阶段决策</span><span>可反复挑战</span></div><a className="facility-entry" href="#training-stations">选择演练站 <ChevronRight size={19} /></a></div>
      <div className="training-total"><GameIcon name="training" size={62} /><span>训练档案</span><b>{completed}<small> / {playModes.length}</small></b><span>已完成演练</span><div className="facility-meter"><i style={{ width: `${completed / playModes.length * 100}%` }} /></div></div>
    </header>
    <div className="facility-section-heading" id="training-stations"><div><span>选择一项，开始练习</span><h2>今天，守护哪一环？</h2></div><p>先看现场，再作选择。结束后可查看判断依据与最高成绩。</p></div>
    <div className="mode-grid">{playModes.map((mode, index) => {
      const score = profile.modeMastery?.[mode.id] ?? 0
      return <article key={mode.id} className="mode-card illustrated-mode" style={visualStyle(mode.id)}>
        <div className="mode-scene"><img src={sceneFor(mode.id)} alt={`${visualFor(mode.id).area}场景预览`} loading="lazy" /><span className="mode-number">{String(index + 1).padStart(2, '0')}</span><span className="mode-score">{score > 0 ? <><Check /> 最高 {score} 分</> : '待演练'}</span><span className="mode-location">{visualFor(mode.id).area}</span></div>
        <div className="mode-card-body"><div className="mode-heading"><GameIcon name={modeIcon(mode.id)} size={58} /><div><small>情境演练 · 三阶段</small><h2>{mode.shortName}</h2></div></div><p>{mode.fantasy}</p><div className="mode-focus">{visualFor(mode.id).focus}</div>
        <div className="mode-card-actions"><button className="secondary-button" onClick={() => setShowDesign(mode)} aria-label={`查看${mode.shortName}规则`}>查看规则</button><button className="primary-button" onClick={() => setSelected(mode)} aria-label={`开始${mode.shortName}训练`}>{score > 0 ? '再次训练' : '开始训练'} <ChevronRight /></button></div></div>
      </article>
    })}</div>
    {showDesign && <DesignModal mode={showDesign} onClose={() => setShowDesign(null)} />}
  </div>
}

function DesignModal({ mode, onClose }: { mode: PlayModeDefinition; onClose: () => void }) {
  return <div className="mode-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="mode-design-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="mode-design pixel-panel">
    <header><div><span className="eyebrow">PLAY MODE DESIGN / 系统训练档案</span><h2 id="mode-design-title">{mode.name}</h2></div><button onClick={onClose} aria-label="关闭">×</button></header>
    <p className="mode-fantasy">{mode.fantasy}</p>
    <div className="design-columns">
      <section><h3>核心循环</h3><ol>{mode.playerLoop.map((line) => <li key={line}>{line}</li>)}</ol></section>
      <section><h3>操作与读秒</h3><p>{mode.controls}</p><h3>精通目标</h3><p>{mode.mastery}</p></section>
      <section><h3>胜负边界</h3><b>胜利</b><p>{mode.winCondition}</p><b className="danger-copy">失败</b><p>{mode.failCondition}</p></section>
    </div>
    <div className="design-columns lower"><section><h3>教育反馈</h3><ul>{mode.education.map((line) => <li key={line}>{line}</li>)}</ul></section><section><h3>关卡变体</h3>{mode.variants.map((variant) => <div className="variant-row" key={variant.name}><b>{variant.name}</b><span>{variant.change}</span></div>)}</section><section><h3>奖励循环</h3><div className="reward-tags">{mode.rewards.map((reward) => <span key={reward}>{reward}</span>)}</div></section></div>
    <button className="primary-button close-design" onClick={onClose}>理解规则，返回训练场</button>
  </section></div>
}

function ModeRun({ mode, profile, onChange, onExit }: { mode: PlayModeDefinition; profile: PlayerProfile; onChange: (profile: PlayerProfile) => void; onExit: () => void }) {
  const simulation = useMemo(() => modeSimulations.find((item) => item.modeId === mode.id), [mode.id])
  const [round, setRound] = useState(0)
  const [meters, setMeters] = useState<[number, number]>(simulation?.initial ?? [50, 50])
  const [answer, setAnswer] = useState<number | null>(null)
  const [principles, setPrinciples] = useState<string[]>([])
  const [correctChoices, setCorrectChoices] = useState(0)
  const [done, setDone] = useState(false)
  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [round, done])

  if (!simulation) return <div className="empty-state">训练数据装载失败 <button onClick={onExit}>返回</button></div>
  const current = simulation.rounds[round]
  const clamp = (value: number) => Math.max(0, Math.min(100, value))
  const choose = (index: number) => {
    if (answer !== null) return
    const option = current.options[index]
    setAnswer(index)
    setMeters(([first, second]) => [clamp(first + option.effect[0]), clamp(second + option.effect[1])])
    setPrinciples((items) => [...items, option.principle])
    if (index === current.best) setCorrectChoices((value) => value + 1)
  }
  const next = () => {
    if (round < simulation.rounds.length - 1) { setRound((value) => value + 1); setAnswer(null); return }
    const score = Math.round(40 + (correctChoices / simulation.rounds.length) * 60)
    const previous = profile.modeMastery?.[mode.id] ?? 0
    onChange({ ...profile, points: profile.points + (score > previous ? Math.max(10, score - previous) : 5), modeMastery: { ...(profile.modeMastery ?? {}), [mode.id]: Math.max(previous, score) } })
    setDone(true)
  }
  const restart = () => { setRound(0); setMeters(simulation.initial); setAnswer(null); setPrinciples([]); setCorrectChoices(0); setDone(false) }
  const score = Math.round(40 + (correctChoices / simulation.rounds.length) * 60)

  return <div className="mode-run illustrated-run screen-enter" style={visualStyle(mode.id)}>
    <header className="mode-run-header"><button onClick={onExit}><ArrowLeft /> 退出训练</button><div><small>{mode.name}</small><b>{done ? '行动复盘' : current.title}</b></div><span>{done ? simulation.rounds.length : round + 1} / {simulation.rounds.length}</span></header>
    <div className="mode-run-progress"><span style={{ width: `${(done ? 1 : (round + 1) / simulation.rounds.length) * 100}%` }} /></div>
    <section className="mode-meter-board">{simulation.meters.map((label, index) => <div key={label}><span>{label}</span><b>{meters[index]}</b><i><em style={{ width: `${meters[index]}%` }} /></i></div>)}</section>
    {!done ? <section className="simulation-stage">
      <div className="simulation-object"><img className="simulation-scenery" src={sceneFor(mode.id)} alt={`${visualFor(mode.id).area}演练现场`} /><span><GameIcon name={modeIcon(mode.id)} size={76} /></span><div className="simulation-object-label"><small>现场观察 · {round + 1} / {simulation.rounds.length}</small><b>{current.object}</b><p>{visualFor(mode.id).area}</p></div></div>
      <div className="simulation-copy"><span className="eyebrow">阶段 {round + 1} / 作出你的判断</span><h1>{current.title}</h1><p>{current.situation}</p><div className="simulation-options">{current.options.map((option, index) => <button key={option.label} disabled={answer !== null} className={answer === null ? '' : index === current.best ? 'best' : answer === index ? 'chosen-wrong' : 'dim'} onClick={() => choose(index)}><span>{String.fromCharCode(65 + index)}</span><b>{option.label}</b></button>)}</div>
        {answer !== null && <div className={`simulation-feedback ${answer === current.best ? 'best' : 'warning'}`}><div><GameIcon name={answer === current.best ? 'shield' : 'pollution'} size={46} /><b>{answer === current.best ? '系统判断有效' : '这个选择产生了代价'}</b></div><p>{current.options[answer].feedback}</p><em>本轮原则 · {current.options[answer].principle}</em><button className="primary-button" onClick={next}>{round === simulation.rounds.length - 1 ? '完成并复盘' : '进入下一阶段'} <ChevronRight /></button></div>}
      </div>
    </section> : <section className="mode-result pixel-panel"><div className="result-grade">{score >= 80 ? 'S' : score >= 65 ? 'A' : score >= 50 ? 'B' : 'C'}</div><span className="eyebrow">SYSTEM MASTERY</span><h1>{mode.shortName} · {score}分</h1><p>本次有 {correctChoices}/{simulation.rounds.length} 个阶段选择了兼顾安全、材料价值与系统后果的方案。仪表数值用于表达玩法资源，不再直接换算为成绩。</p><p>{mode.mastery}</p><div className="principle-log">{principles.map((principle, index) => <div key={`${principle}-${index}`}><Check /> <span>阶段 {index + 1}</span><b>{principle}</b></div>)}</div><div className="result-actions"><button className="secondary-button" onClick={restart}><RotateCcw /> 再次训练</button><button className="primary-button" onClick={onExit}>返回系统列表</button></div></section>}
  </div>
}
