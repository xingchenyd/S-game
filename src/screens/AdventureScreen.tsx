import { ArrowLeft, Check, ChevronRight, Gauge, Heart, LockKeyhole, ShieldAlert, Sparkles, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { adventures, buildCards, classificationChallenges } from '../data/content'
import { getPlayMode, modeSimulations } from '../data/playModes'
import PhaserCombat, { type BattleResult } from '../game/PhaserCombat'
import { startMusic } from '../store/audio'
import type { AdventureDefinition, Difficulty, PlayerProfile, RunMetrics } from '../types'

type Phase = 'briefing' | 'combat' | 'classify' | 'build' | 'boss' | 'result' | 'defeat'

interface Props { profile: PlayerProfile; onChange: (profile: PlayerProfile) => void; onImmersive: (value: boolean) => void }

const difficultyCopy: Record<Difficulty, string> = { experience: '体验：敌人较少，适合活动现场', standard: '标准：完整战斗与教育反馈', challenge: '环线：敌人更密集，奖励更高' }
const legacyPrototypeIds: Record<string, string> = { 'lujiazui-circuit': 'lujiazui-core', 'suzhou-plastic': 'suzhou-core', 'yangpu-paper': 'yangpu-core', 'changning-textile': 'changning-core' }
const getPrototypeCollectibleId = (routeId: string) => legacyPrototypeIds[routeId] ?? `${routeId}-core`

export default function AdventureScreen({ profile, onChange, onImmersive }: Props) {
  const [selected, setSelected] = useState<AdventureDefinition | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('standard')
  const [phase, setPhase] = useState<Phase>('briefing')
  const [metrics, setMetrics] = useState<RunMetrics>({ hp: 100, maxHp: 100, pollution: 68, value: 0, accuracy: 100, combo: 0, finisher: 0, stage: 0, totalStages: 5 })
  const [builds, setBuilds] = useState<string[]>([])
  const [purified, setPurified] = useState(0)
  const [challenge] = useState(() => classificationChallenges[Math.floor(Math.random() * classificationChallenges.length)])
  const [answer, setAnswer] = useState<number | null>(null)
  const [correct, setCorrect] = useState(false)
  const buildOptions = useMemo(() => [...buildCards].sort(() => Math.random() - .5).slice(0, 3), [phase === 'build'])
  const routeMode = selected?.modes?.[Math.min(builds.length, (selected.modes?.length ?? 1) - 1)]
  const modeDesign = routeMode ? getPlayMode(routeMode) : undefined
  const modeRound = routeMode ? modeSimulations.find((simulation) => simulation.modeId === routeMode)?.rounds[0] : undefined
  const prototypeCollectibleId = getPrototypeCollectibleId(selected?.id ?? 'unknown')

  const musicVolume = profile.settings.musicVolume * profile.settings.masterVolume
  const begin = () => { startMusic('adventure', musicVolume); setPhase('combat'); setMetrics((m) => ({ ...m, stage: 1 })); onImmersive(true) }
  const battleDone = (result: BattleResult) => {
    setPurified((value) => value + result.purified)
    setMetrics((m) => ({ ...m, value: result.value, pollution: Math.max(0, m.pollution - 18), stage: phase === 'boss' ? 5 : 2 }))
    if (phase === 'boss') finish(result)
    else setPhase('classify')
  }
  const submitAnswer = (index: number) => {
    if (answer !== null) return
    const isCorrect = index === (modeRound?.best ?? challenge.answer)
    setAnswer(index); setCorrect(isCorrect)
    setMetrics((m) => ({ ...m, pollution: Math.max(0, m.pollution - (isCorrect ? (builds.includes('clean') ? 22 : 12) : 2)), accuracy: isCorrect ? 100 : 0, value: m.value + (isCorrect ? 35 : 8), stage: 3 }))
  }
  const chooseBuild = (id: string) => { setBuilds((value) => [...value, id]); startMusic('boss', musicVolume); setPhase('boss'); setMetrics((m) => ({ ...m, stage: 4 })) }
  const finish = (result: BattleResult) => {
    if (!selected) return
    const multiplier = difficulty === 'challenge' ? 1.5 : difficulty === 'experience' ? .8 : 1
    const points = Math.round((result.value + (correct ? 50 : 15)) * multiplier)
    const prototypeId = getPrototypeCollectibleId(selected.id)
    const next = {
      ...profile,
      points: profile.points + points,
      tokens: profile.tokens + 1,
      printShards: profile.printShards + 1,
      prototypes: [...new Set([...profile.prototypes, selected.prototype])],
      collectibles: [...new Set([...profile.collectibles, prototypeId])],
      stats: {
        ...profile.stats,
        runs: profile.stats.runs + 1,
        victories: profile.stats.victories + 1,
        enemiesPurified: profile.stats.enemiesPurified + purified + result.purified,
        classificationTotal: profile.stats.classificationTotal + 1,
        classificationCorrect: profile.stats.classificationCorrect + (correct ? 1 : 0),
        bestPollution: Math.min(profile.stats.bestPollution, metrics.pollution),
        valuePreserved: profile.stats.valuePreserved + points,
      },
    }
    onChange(next)
    startMusic('result', musicVolume)
    setMetrics((m) => ({ ...m, stage: 5, value: points }))
    setPhase('result')
    onImmersive(false)
  }
  const reset = () => { startMusic('adventure', musicVolume); setSelected(null); setPhase('briefing'); setBuilds([]); setAnswer(null); setCorrect(false); setPurified(0); setMetrics({ hp: 100, maxHp: 100, pollution: 68, value: 0, accuracy: 100, combo: 0, finisher: 0, stage: 0, totalStages: 5 }); onImmersive(false) }

  if (!selected) return <div className="adventure-select screen-enter">
    <header className="page-title"><div><span className="eyebrow">ACTION ROUTES / SHANGHAI</span><h1>选择城市行动</h1><p>每条路线把战斗、处理决策和Boss原型串成一次完整价值保留行动。</p></div></header>
    <div className="difficulty-bar pixel-panel"><b>行动强度</b>{(Object.keys(difficultyCopy) as Difficulty[]).map((item) => <button key={item} className={difficulty === item ? 'active' : ''} onClick={() => setDifficulty(item)}>{item === 'experience' ? '体验' : item === 'standard' ? '标准' : '环线挑战'}<small>{difficultyCopy[item]}</small></button>)}</div>
    <div className="adventure-grid">{adventures.map((item, index) => <button key={item.id} className={`adventure-card ${!item.available ? 'locked' : ''}`} style={{ '--accent': item.accent } as React.CSSProperties} onClick={() => item.available && setSelected(item)} disabled={!item.available}>
      <img src={item.background} alt="" /><span className="adventure-shade" /><span className="route-number">{String(index + 1).padStart(2, '0')}</span>{!item.available && <span className="locked-chip"><LockKeyhole /> 筹备中</span>}
      <span className="adventure-info"><span className="eyebrow">{item.location}</span><b>{item.name}</b><small>{item.briefing}</small><span className="route-card-modes">{item.modes?.map((mode) => <em key={mode}>{getPlayMode(mode)?.shortName}</em>)}</span><span className="boss-line"><ShieldAlert /> BOSS · {item.boss}</span></span><ChevronRight className="route-arrow" />
    </button>)}</div>
  </div>

  if (phase === 'briefing') return <div className="briefing-screen screen-enter">
    <button className="back-button" onClick={reset}><ArrowLeft /> 返回路线</button>
    <section className="briefing-hero" style={{ backgroundImage: `linear-gradient(90deg,#061319f2,#0613198c), url(${selected.background})` }}>
      <span className="eyebrow">行动委托 · {selected.location}</span><h1>{selected.name}</h1><p>{selected.briefing}</p>
      <div className="lesson-list">{selected.lesson.map((line) => <div key={line}><Check />{line}</div>)}</div>
      <div className="boss-preview"><span>污染外壳</span><b>{selected.boss}</b><small>净化后掉落：{selected.prototype}</small></div>
      <div className="route-node-preview">{selected.routeNodes?.map((node, index) => <div key={node.id}><span>{String(index + 1).padStart(2, '0')}</span><b>{node.name}</b><small>{node.description}</small></div>)}</div>
      <div className="route-mode-tags">本路线系统 {selected.modes?.map((mode) => <span key={mode}>{getPlayMode(mode)?.shortName}</span>)}</div>
      <button className="primary-button" onClick={begin}>进入行动 <ChevronRight /></button>
    </section>
  </div>

  return <div className="run-screen screen-enter">
    <header className="run-hud">
      <button onClick={reset} aria-label="退出本局"><ArrowLeft /></button>
      <div className="run-title"><small>{selected.location}</small><b>{selected.name}</b></div>
      <div className="run-progress"><div><span style={{ width: `${metrics.stage / metrics.totalStages * 100}%` }} /></div><small>本局进度 {metrics.stage}/{metrics.totalStages}</small></div>
      <div className="hud-stat hp"><Heart /> <span>{Math.ceil(metrics.hp)}/{metrics.maxHp}</span></div>
      <div className="hud-stat pollution"><Gauge /> <span>污染 {metrics.pollution}%</span></div>
      <div className="hud-stat value"><Sparkles /> <span>价值 {metrics.value}</span></div>
    </header>

    {(phase === 'combat' || phase === 'boss') && <>
      <div className="objective-chip"><Target /> {phase === 'boss' ? `击破 ${selected.boss} 的污染外壳` : '稳定区域，净化游离污染体'} <b>连击 {metrics.combo} · 终结 {metrics.finisher}%</b></div>
      <PhaserCombat adventure={selected} difficulty={difficulty} boss={phase === 'boss'} builds={builds} screenShake={profile.settings.screenShake} initialPollution={metrics.pollution} initialValue={metrics.value} onHud={(value) => setMetrics((m) => ({ ...m, ...value }))} onComplete={battleDone} onDefeat={() => { setPhase('defeat'); onImmersive(false) }} />
    </>}

    {phase === 'classify' && <section className="decision-overlay">
      <div className="decision-card pixel-panel"><span className="eyebrow">系统节点 · {modeDesign?.name ?? '材料判断'}</span><div className="item-orb">{modeDesign?.icon ?? challenge.icon}</div><h2>{modeRound?.object ?? challenge.item}</h2><p>{modeRound?.situation ?? challenge.prompt}</p>
        <div className="decision-options">{(modeRound?.options.map((option) => option.label) ?? challenge.options).map((option, index) => <button key={option} className={answer === null ? '' : index === (modeRound?.best ?? challenge.answer) ? 'correct' : answer === index ? 'wrong' : 'muted'} onClick={() => submitAnswer(index)}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>
        {answer !== null && <div className={`answer-feedback ${correct ? 'correct' : 'wrong'}`}><b>{correct ? '系统判断有效：后续路线被改善' : '本次选择产生了系统代价'}</b><p>{modeRound?.options[answer].feedback ?? challenge.explain}</p><em>{modeRound ? `教育原则 · ${modeRound.options[answer].principle}` : ''}</em><button className="primary-button" onClick={() => setPhase('build')}>进入构筑选择 <ChevronRight /></button></div>}
      </div>
    </section>}

    {phase === 'build' && <section className="decision-overlay"><div className="build-panel"><span className="eyebrow">本局升级 · 三选一</span><h2>把刚才的处理经验变成战斗能力</h2><div className="build-grid">{buildOptions.map((card) => <button key={card.id} onClick={() => chooseBuild(card.id)} style={{ '--card-color': card.color } as React.CSSProperties}><span>{card.tag}</span><b>{card.name}</b><p>{card.description}</p><small>选择并进入Boss节点</small></button>)}</div></div></section>}

    {phase === 'result' && <section className="result-screen"><div className="prototype-orb"><img src="/art/legacy/sprites/item_print.png" alt="稳定原型" /></div><span className="eyebrow">POLLUTION SHELL CLEARED</span><h1>稳定原型已回收</h1><p>你没有消灭一件废物，而是拆除了让它失控的污染外壳。</p><div className="result-grid"><div><b>{metrics.value}</b><span>本局价值保留</span></div><div><b>{metrics.pollution}%</b><span>最终污染率</span></div><div><b>{correct ? '正确' : '待改进'}</b><span>处理判断</span></div></div><div className="prototype-ticket"><small>获得原型凭证 · {prototypeCollectibleId}</small><b>{selected.prototype}</b><span>可在现实兑换站查看纪念章 / 模型方案</span></div><button className="primary-button" onClick={reset}>返回行动地图</button></section>}
    {phase === 'defeat' && <section className="result-screen defeat"><span className="eyebrow">ACTION INTERRUPTED</span><h1>行动暂时中止</h1><p>污染值不是道德分数。调整构筑与移动节奏，再来一次。</p><button className="primary-button" onClick={() => { setPhase('briefing'); setMetrics((m) => ({ ...m, hp: 100, stage: 0 })) }}>重新整备</button></section>}
  </div>
}
