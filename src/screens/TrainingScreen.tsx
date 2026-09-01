import { ArrowLeft, BookOpenCheck, Check, ChevronRight, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { modeSimulations, playModes } from '../data/playModes'
import type { PlayerProfile, PlayModeDefinition } from '../types'

interface Props { profile: PlayerProfile; onChange: (profile: PlayerProfile) => void }

export default function TrainingScreen({ profile, onChange }: Props) {
  const [selected, setSelected] = useState<PlayModeDefinition | null>(null)
  const [showDesign, setShowDesign] = useState<PlayModeDefinition | null>(null)

  if (selected) return <ModeRun key={selected.id} mode={selected} profile={profile} onChange={onChange} onExit={() => setSelected(null)} />

  const completed = Object.values(profile.modeMastery ?? {}).filter((score) => (score ?? 0) > 0).length
  return <div className="training-screen screen-enter">
    <header className="page-title training-title"><div><span className="eyebrow">SYSTEM LAB / 11 PLAYABLE LOOPS</span><h1>循环训练场</h1><p>这里不是玩法说明书。每个系统都有可实玩的三阶段训练、双指标取舍、失败反馈和完整设计档案；行动关卡会把这些规则组合成不同路线。</p></div><div className="training-total"><b>{completed}/11</b><span>系统已掌握</span></div></header>
    <div className="mode-grid">{playModes.map((mode, index) => {
      const score = profile.modeMastery?.[mode.id] ?? 0
      return <article key={mode.id} className="mode-card pixel-panel">
        <div className="mode-card-top"><span className="mode-number">{String(index + 1).padStart(2, '0')}</span><span className="mode-glyph">{mode.icon}</span>{score > 0 && <span className="mode-score"><Check /> {score}</span>}</div>
        <small>{mode.shortName}</small><h2>{mode.name}</h2><p>{mode.fantasy}</p>
        <div className="mode-card-actions"><button className="secondary-button" onClick={() => setShowDesign(mode)}><BookOpenCheck /> 详细规则</button><button className="primary-button" onClick={() => setSelected(mode)}>开始训练 <ChevronRight /></button></div>
      </article>
    })}</div>
    {showDesign && <DesignModal mode={showDesign} onClose={() => setShowDesign(null)} />}
  </div>
}

function DesignModal({ mode, onClose }: { mode: PlayModeDefinition; onClose: () => void }) {
  return <div className="mode-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="mode-design-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="mode-design pixel-panel">
    <header><div><span className="eyebrow">PLAY MODE DESIGN / {mode.icon}</span><h2 id="mode-design-title">{mode.name}</h2></div><button onClick={onClose} aria-label="关闭">×</button></header>
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

  return <div className="mode-run screen-enter">
    <header className="mode-run-header"><button onClick={onExit}><ArrowLeft /> 退出训练</button><div><small>{mode.name}</small><b>{done ? '行动复盘' : current.title}</b></div><span>{done ? simulation.rounds.length : round + 1} / {simulation.rounds.length}</span></header>
    <div className="mode-run-progress"><span style={{ width: `${(done ? 1 : (round + 1) / simulation.rounds.length) * 100}%` }} /></div>
    <section className="mode-meter-board">{simulation.meters.map((label, index) => <div key={label}><span>{label}</span><b>{meters[index]}</b><i><em style={{ width: `${meters[index]}%` }} /></i></div>)}</section>
    {!done ? <section className="simulation-stage">
      <div className="simulation-object"><span>{mode.icon}</span><small>当前对象</small><b>{current.object}</b></div>
      <div className="simulation-copy"><span className="eyebrow">STAGE {round + 1} / DECISION</span><h1>{current.title}</h1><p>{current.situation}</p><div className="simulation-options">{current.options.map((option, index) => <button key={option.label} className={answer === null ? '' : index === current.best ? 'best' : answer === index ? 'chosen-wrong' : 'dim'} onClick={() => choose(index)}><span>{String.fromCharCode(65 + index)}</span><b>{option.label}</b></button>)}</div>
        {answer !== null && <div className={`simulation-feedback ${answer === current.best ? 'best' : 'warning'}`}><div>{answer === current.best ? <ShieldCheck /> : <Sparkles />}<b>{answer === current.best ? '系统判断有效' : '这个选择产生了代价'}</b></div><p>{current.options[answer].feedback}</p><em>本轮原则 · {current.options[answer].principle}</em><button className="primary-button" onClick={next}>{round === simulation.rounds.length - 1 ? '完成并复盘' : '进入下一阶段'} <ChevronRight /></button></div>}
      </div>
    </section> : <section className="mode-result pixel-panel"><div className="result-grade">{score >= 80 ? 'S' : score >= 65 ? 'A' : score >= 50 ? 'B' : 'C'}</div><span className="eyebrow">SYSTEM MASTERY</span><h1>{mode.shortName} · {score}分</h1><p>本次有 {correctChoices}/{simulation.rounds.length} 个阶段选择了兼顾安全、材料价值与系统后果的方案。仪表数值用于表达玩法资源，不再直接换算为成绩。</p><p>{mode.mastery}</p><div className="principle-log">{principles.map((principle, index) => <div key={`${principle}-${index}`}><Check /> <span>阶段 {index + 1}</span><b>{principle}</b></div>)}</div><div className="result-actions"><button className="secondary-button" onClick={restart}><RotateCcw /> 再次训练</button><button className="primary-button" onClick={onExit}>返回系统列表</button></div></section>}
  </div>
}
