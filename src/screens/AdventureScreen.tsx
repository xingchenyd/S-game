import { ArrowLeft, Check, ChevronRight, LockKeyhole, Users } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import GameIcon from '../components/GameIcon'
import { adventures, buildCards, classificationChallenges } from '../data/content'
import { getPlayMode, modeSimulations } from '../data/playModes'
import type { BattleResult } from '../game/PhaserCombat'
import ExplorationRoom from '../components/ExplorationRoom'
import { isMissionUnlocked, shanghaiCampaign } from '../data/campaign'
import { resolveSkillEffects } from '../data/skills'
import { difficultyTuning, resolveCombatStats } from '../data/balance'
import { startMusic } from '../store/audio'
import type { AdventureDefinition, CampaignMission, Difficulty, PlayerProfile, RunMetrics } from '../types'
import { assetUrl } from '../utils/assets'

type Phase = 'briefing' | 'room' | 'combat' | 'classify' | 'build' | 'boss' | 'result' | 'defeat'

interface Props { profile: PlayerProfile; onChange: (profile: PlayerProfile) => void; onImmersive: (value: boolean) => void }
const PhaserCombat = lazy(() => import('../game/PhaserCombat'))

const difficultyCopy: Record<Difficulty, string> = { experience: '简单：活动现场与首次体验', standard: '普通：完整机制与标准节奏', challenge: '困难：更短预警与更高污染压力' }
const missionKindCopy: Record<CampaignMission['kind'], string> = { story: '剧情调查', explore: '场景探索', combat: '污染战斗', system: '系统决策', rest: '修复整备', elite: '精英行动', boss: '终局行动' }
const legacyPrototypeIds: Record<string, string> = { 'lujiazui-circuit': 'lujiazui-core', 'suzhou-plastic': 'suzhou-core', 'yangpu-paper': 'yangpu-core', 'changning-textile': 'changning-core' }
const getPrototypeCollectibleId = (routeId: string) => legacyPrototypeIds[routeId] ?? `${routeId}-core`
const missionCover = (mission: CampaignMission) => assetUrl(`art/campaign/${mission.id}.webp`)

export default function AdventureScreen({ profile, onChange, onImmersive }: Props) {
  const [selected, setSelected] = useState<AdventureDefinition | null>(null)
  const [selectedMission, setSelectedMission] = useState<CampaignMission | null>(null)
  const [mapMode, setMapMode] = useState<'campaign' | 'routes'>('campaign')
  const [difficulty, setDifficulty] = useState<Difficulty>(() => profile.settings.eventMode ? 'experience' : 'standard')
  const [phase, setPhase] = useState<Phase>('briefing')
  const [metrics, setMetrics] = useState<RunMetrics>({ hp: 100, maxHp: 100, pollution: 68, value: 0, accuracy: 100, combo: 0, finisher: 0, stage: 0, totalStages: 5 })
  const [builds, setBuilds] = useState<string[]>([])
  const [purified, setPurified] = useState(0)
  const [challenge] = useState(() => classificationChallenges[Math.floor(Math.random() * classificationChallenges.length)])
  const [answer, setAnswer] = useState<number | null>(null)
  const [correct, setCorrect] = useState(false)
  const [systemIndex, setSystemIndex] = useState(0)
  const [correctSystems, setCorrectSystems] = useState(0)
  const buildOptions = useMemo(() => [...buildCards].sort(() => Math.random() - .5).slice(0, 3), [phase === 'build'])
  const routeMode = selected?.modes?.[Math.min(systemIndex, (selected.modes?.length ?? 1) - 1)]
  const modeDesign = routeMode ? getPlayMode(routeMode) : undefined
  const modeRound = routeMode ? modeSimulations.find((simulation) => simulation.modeId === routeMode)?.rounds[0] : undefined
  const prototypeCollectibleId = getPrototypeCollectibleId(selected?.id ?? 'unknown')
  const combatStats = useMemo(() => resolveCombatStats(profile), [profile])

  const skillEffects = resolveSkillEffects(profile.unlockedSkills)
  const musicVolume = profile.settings.musicVolume * profile.settings.masterVolume
  const begin = () => { startMusic('adventure', musicVolume); setPhase(selectedMission ? 'room' : 'combat'); setMetrics((m) => ({ ...m, stage: 1 })); onImmersive(true) }
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
    if (isCorrect) setCorrectSystems((value) => value + 1)
    const modeCount = Math.max(1, selected?.modes?.length ?? 1)
    setMetrics((m) => ({ ...m, pollution: Math.max(0, m.pollution - (isCorrect ? 10 + skillEffects.decisionPollution : 1)), accuracy: Math.round(((correctSystems + (isCorrect ? 1 : 0)) / (systemIndex + 1)) * 100), value: m.value + (isCorrect ? 22 + skillEffects.decisionValue : 5), stage: 2 + (systemIndex + 1) / modeCount }))
  }
  const advanceSystem = () => {
    const finalSystem = systemIndex >= (selected?.modes?.length ?? 1) - 1
    if (finalSystem) { setPhase('build'); return }
    setSystemIndex((value) => value + 1); setAnswer(null); setCorrect(false)
  }
  const chooseBuild = (id: string) => { setBuilds((value) => [...value, id]); startMusic('boss', musicVolume); setPhase('boss'); setMetrics((m) => ({ ...m, stage: 4 })) }
  const finish = (result: BattleResult) => {
    if (!selected) return
    const multiplier = difficultyTuning[difficulty].reward
    const finalPollution = Math.max(0, metrics.pollution - 18)
    const points = Math.round((result.value + correctSystems * 18 + (correctSystems === 0 ? 8 : 0)) * multiplier) + (finalPollution <= 25 ? skillEffects.cleanFinishBonus : 0)
    const prototypeId = getPrototypeCollectibleId(selected.id)
    const firstMissionClear = Boolean(selectedMission && !profile.campaignCompleted.includes(selectedMission.id))
    const skillReward = firstMissionClear && ['sh-02', 'sh-04', 'sh-05'].includes(selectedMission?.id ?? '') ? 1 : firstMissionClear && selectedMission?.id === 'sh-08' ? 2 : 0
    const missionIndex = selectedMission ? shanghaiCampaign.findIndex((mission) => mission.id === selectedMission.id) : -1
    const nextMission = shanghaiCampaign[missionIndex + 1]?.id ?? selectedMission?.id ?? profile.currentMission
    const next = {
      ...profile,
      points: profile.points + points,
      tokens: profile.tokens + 1,
      printShards: profile.printShards + 1,
      prototypes: [...new Set([...profile.prototypes, selected.prototype])],
      collectibles: [...new Set([...profile.collectibles, prototypeId])],
      campaignCompleted: selectedMission ? [...new Set([...profile.campaignCompleted, selectedMission.id])] : profile.campaignCompleted,
      currentMission: selectedMission ? nextMission : profile.currentMission,
      skillPoints: profile.skillPoints + skillReward,
      stats: {
        ...profile.stats,
        runs: profile.stats.runs + 1,
        victories: profile.stats.victories + 1,
        enemiesPurified: profile.stats.enemiesPurified + purified + result.purified,
        classificationTotal: profile.stats.classificationTotal + Math.max(1, selected.modes?.length ?? 1),
        classificationCorrect: profile.stats.classificationCorrect + correctSystems,
        bestPollution: Math.min(profile.stats.bestPollution, finalPollution),
        valuePreserved: profile.stats.valuePreserved + points,
      },
    }
    onChange(next)
    startMusic('result', musicVolume)
    setMetrics((m) => ({ ...m, stage: 5, value: points }))
    setPhase('result')
    onImmersive(false)
  }
  const reset = () => { startMusic('adventure', musicVolume); setSelected(null); setSelectedMission(null); setPhase('briefing'); setBuilds([]); setAnswer(null); setCorrect(false); setSystemIndex(0); setCorrectSystems(0); setPurified(0); setMetrics({ hp: 100, maxHp: 100, pollution: 68, value: 0, accuracy: 100, combo: 0, finisher: 0, stage: 0, totalStages: 5 }); onImmersive(false) }

  if (!selected) return <div className="adventure-select screen-enter">
    <header className="page-title"><div><span className="eyebrow">SHANGHAI CAMPAIGN / CHAPTER 01</span><h1>上海循环行动</h1><p>主线从虹桥撤展异常开始，沿城市材料流向追查污染源，最终在世博公众日完成闭环验证。</p></div><div className="campaign-progress"><b>{profile.campaignCompleted.length}/10</b><span>篇章节点</span></div></header>
    <div className="adventure-mode-tabs"><button className={mapMode === 'campaign' ? 'active' : ''} onClick={() => setMapMode('campaign')}><GameIcon name="map" size={38} /> 上海主线</button><button className={mapMode === 'routes' ? 'active' : ''} onClick={() => setMapMode('routes')}><GameIcon name="prototype" size={38} /> 自由行动</button></div>
    <div className="difficulty-bar pixel-panel"><b>行动难度</b>{(Object.keys(difficultyCopy) as Difficulty[]).map((item) => <button key={item} className={difficulty === item ? 'active' : ''} onClick={() => setDifficulty(item)}><strong>{difficultyTuning[item].name}</strong><small>{difficultyCopy[item]}</small><em>奖励 ×{difficultyTuning[item].reward}</em></button>)}</div>
    {mapMode === 'campaign' && <section className="campaign-map pixel-panel"><header className="campaign-map-heading"><div><span className="eyebrow">CHAPTER ROUTE · SHANGHAI</span><h2>选择你的下一次行动</h2></div><p>场景画面展示本节点真正要解决的问题。已发光的节点可直接进入，锁定节点会在完成前序行动后开放。</p></header>{shanghaiCampaign.map((mission) => { const unlocked = isMissionUnlocked(mission, profile.campaignCompleted); const completed = profile.campaignCompleted.includes(mission.id); const route = adventures.find((item) => item.id === mission.routeId); return <button key={mission.id} className={`campaign-node ${completed ? 'completed' : unlocked ? 'unlocked' : 'locked'}`} disabled={!unlocked || !route} onClick={() => { if (route) { setSelectedMission(mission); setSelected(route) } }} style={{ '--node-accent': route?.accent } as React.CSSProperties} aria-label={`${mission.title}，${completed ? '已完成，可再次进入' : unlocked ? '可进入' : '尚未解锁'}`}>
      <span className="campaign-art"><img src={missionCover(mission)} alt={`${mission.location}行动场景`} loading="lazy" /><i className="campaign-art-shade" /><span className="campaign-order">{completed ? <Check /> : unlocked ? String(mission.order).padStart(2, '0') : <LockKeyhole />}</span><em className={`campaign-kind kind-${mission.kind}`}>{missionKindCopy[mission.kind]}</em></span>
      <span className="campaign-copy"><small>{mission.location}</small><b>{mission.title}</b><em>{mission.subtitle}</em><p>{mission.summary}</p><u><Users /> {mission.cast.join(' · ')}</u><span className="campaign-card-footer"><strong>{mission.reward}</strong><span className="mission-entry">{completed ? '再次进入' : unlocked ? '进入行动' : `完成 ${mission.requires[0]?.toUpperCase() ?? '前序节点'}`} <ChevronRight /></span></span></span>
    </button> })}</section>}
    {mapMode === 'routes' && <div className="adventure-grid">{adventures.map((item, index) => <button key={item.id} className={`adventure-card ${!item.available ? 'locked' : ''}`} style={{ '--accent': item.accent } as React.CSSProperties} onClick={() => item.available && setSelected(item)} disabled={!item.available}>
      <img src={item.background} alt="" /><span className="adventure-shade" /><span className="route-number">{String(index + 1).padStart(2, '0')}</span>{!item.available && <span className="locked-chip"><LockKeyhole /> 筹备中</span>}
      <span className="adventure-info"><span className="eyebrow">{item.location}</span><b>{item.name}</b><small>{item.briefing}</small><span className="route-card-modes">{item.modes?.map((mode) => <em key={mode}>{getPlayMode(mode)?.shortName}</em>)}</span><span className="boss-line"><GameIcon name="boss" size={36} /> BOSS · {item.boss}</span></span><ChevronRight className="route-arrow" />
    </button>)}</div>}
  </div>

  if (phase === 'briefing') return <div className="briefing-screen screen-enter">
    <button className="back-button" onClick={reset}><ArrowLeft /> 返回路线</button>
    <section className="briefing-hero" style={{ backgroundImage: `linear-gradient(90deg,#061319f2,#0613198c), url(${selectedMission ? missionCover(selectedMission) : selected.background})` }}>
      <span className="eyebrow">行动委托 · {selected.location}</span><h1>{selected.name}</h1><p>{selected.briefing}</p>
      {selectedMission && <div className="mission-brief"><small>上海主线 {selectedMission.order}/10 · {selectedMission.subtitle}</small><h2>{selectedMission.objective}</h2>{selectedMission.dialogue.map((line) => <p key={`${line.speaker}-${line.text}`}><b>{line.speaker}</b><span>{line.text}</span></p>)}</div>}
      <div className="lesson-list">{selected.lesson.map((line) => <div key={line}><Check />{line}</div>)}</div>
      <div className="boss-preview"><span>污染外壳</span><b>{selected.boss}</b><small>净化后掉落：{selected.prototype}</small></div>
      <div className="route-node-preview">{selected.routeNodes?.map((node, index) => <div key={node.id}><span>{String(index + 1).padStart(2, '0')}</span><b>{node.name}</b><small>{node.description}</small></div>)}</div>
      <div className="route-mode-tags">本路线系统 {selected.modes?.map((mode) => <span key={mode}>{getPlayMode(mode)?.shortName}</span>)}</div>
      <button className="primary-button" onClick={begin}>{selectedMission ? '进入可移动调查房间' : '进入行动'} <ChevronRight /></button>
    </section>
  </div>

  const weaponMode = profile.equipped.weapon === 'wrench-blue' ? { name: '定点法阵', detail: '点击场地召唤延迟范围净化阵', tone: 'sigil' } : profile.equipped.weapon === 'wrench-gold' ? { name: '原型混合武装', detail: '点击交替发射弹体与范围法阵', tone: 'hybrid' } : profile.equipped.weapon === 'wrench-green' ? { name: '链式净化弹', detail: '命中后跳转至附近第二个目标', tone: 'chain' } : { name: '定向净化弹', detail: '每第四次点击发射三向散射弹', tone: 'bolt' }
  return <div className={`run-screen run-theme-${selected.wasteType} screen-enter`}>
    <header className="run-hud">
      <button onClick={reset} aria-label="退出本局"><ArrowLeft /></button>
      <div className="run-title"><small>{selected.location}</small><b>{selected.name}</b></div>
      <div className="run-progress"><div><span style={{ width: `${metrics.stage / metrics.totalStages * 100}%` }} /></div><small><b>行动进度</b><em>{Math.round(metrics.stage / metrics.totalStages * 100)}%</em><span>{metrics.stage}/{metrics.totalStages} 节点</span></small></div>
      <div className="survival-bars">
        <div className="survival-bar health"><GameIcon name="health" size={38} /><span><small>行动生命</small><i><em style={{ width: `${Math.max(0, metrics.hp / metrics.maxHp * 100)}%` }} /></i></span><b>{Math.ceil(metrics.hp)}</b></div>
        <div className="survival-bar shield"><GameIcon name="shield" size={38} /><span><small>循环护盾</small><i><em style={{ width: `${Math.max(0, (metrics.shield ?? 0) / Math.max(1, metrics.maxShield ?? 1) * 100)}%` }} /></i></span><b>{Math.ceil(metrics.shield ?? 0)}</b></div>
      </div>
      <div className="hud-stat pollution"><GameIcon name="pollution" size={34} /> <span>污染 <b>{metrics.pollution}%</b></span></div>
      <div className="hud-stat value"><GameIcon name="value" size={34} /> <span>价值 <b>{metrics.value}</b></span></div>
    </header>

    {phase === 'room' && selectedMission && <ExplorationRoom mission={selectedMission} adventure={selected} previewTargets={profile.unlockedSkills.includes('system-scan')} onComplete={() => setPhase('combat')} />}

    {(phase === 'combat' || phase === 'boss') && <>
      <div className="objective-chip"><GameIcon name={phase === 'boss' ? 'boss' : 'radar'} size={38} /> <span>{phase === 'boss' ? `击破 ${selected.boss} 的污染外壳` : '稳定区域，净化游离污染体'}</span><b>连击 {metrics.combo} · 终结 {metrics.finisher}%</b></div>
      {phase === 'boss' && Boolean(metrics.bossMaxHp) && <div className="boss-hud"><span><GameIcon name="boss" size={44} /><small>污染外壳 · 阶段作战</small><b>{selected.boss}</b></span><div><i style={{ width: `${Math.max(0, (metrics.bossHp ?? 0) / Math.max(1, metrics.bossMaxHp ?? 1) * 100)}%` }} /></div><em>{Math.ceil(metrics.bossHp ?? 0)} / {metrics.bossMaxHp}</em></div>}
      <div className="combat-corner-ui">
        <div className="combat-minimap" aria-label="战斗雷达"><header><GameIcon name="radar" size={30} /><span>区域雷达</span></header><div>{metrics.radar?.map((enemy, index) => <i key={`${index}-${enemy.x}-${enemy.y}`} className={enemy.boss ? 'boss' : ''} style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }} />)}<b style={{ left: `${metrics.playerX ?? 50}%`, top: `${metrics.playerY ?? 50}%` }} /></div></div>
        <div className={`active-attack-guide ${weaponMode.tone}`}><GameIcon name="attack" size={44} /><span><small>主动武器 · 主要伤害</small><b>{weaponMode.name}</b><em>{weaponMode.detail}</em></span></div>
      </div>
      <div className="combat-buff-stack">{metrics.activeBuffs?.map((buff) => <div key={buff.id} className={buff.tone}><b>{buff.label}</b><span>{buff.remaining}s</span></div>)}{Boolean(metrics.drops) && <div className="drops"><b>场内掉落物</b><span>{metrics.drops}</span></div>}</div>
      <div className="combat-skill-tray" aria-label="主动技能状态">
        <div className={(metrics.skillCooldowns?.pulse ?? 0) <= 0 ? 'ready' : ''}><GameIcon name="pulse" size={42} /><kbd>Q</kbd><span><b>定向脉冲</b><small>{(metrics.skillCooldowns?.pulse ?? 0) <= 0 ? '可释放' : `${metrics.skillCooldowns?.pulse?.toFixed(1)}s`}</small></span><i><em style={{ width: `${Math.max(0, 100 - (metrics.skillCooldowns?.pulse ?? 0) / 6.5 * 100)}%` }} /></i></div>
        <div className="ready"><GameIcon name="charge" size={42} /><kbd>E</kbd><span><b>蓄力工具</b><small>按住后释放</small></span><i><em style={{ width: '100%' }} /></i></div>
        <div className={(metrics.skillCooldowns?.dash ?? 0) <= 0 ? 'ready' : ''}><GameIcon name="dash" size={42} /><kbd>空格</kbd><span><b>无敌冲刺</b><small>{(metrics.skillCooldowns?.dash ?? 0) <= 0 ? '可释放' : `${metrics.skillCooldowns?.dash?.toFixed(1)}s`}</small></span><i><em style={{ width: `${Math.max(0, 100 - (metrics.skillCooldowns?.dash ?? 0) / 1.8 * 100)}%` }} /></i></div>
        <div className={metrics.finisher >= 100 ? 'ready ultimate' : 'ultimate'}><GameIcon name="ultimate" size={42} /><kbd>R</kbd><span><b>原型终结</b><small>{metrics.finisher}%</small></span><i><em style={{ width: `${metrics.finisher}%` }} /></i></div>
      </div>
      <Suspense fallback={<div className="loading-screen"><span /><b>正在装配精细2D战斗场景…</b></div>}><PhaserCombat adventure={selected} difficulty={difficulty} boss={phase === 'boss'} builds={builds} weaponId={profile.equipped.weapon} combatStats={combatStats} skillEffects={skillEffects} screenShake={profile.settings.screenShake} initialPollution={metrics.pollution} initialValue={metrics.value} finisherCharge={metrics.finisher} pulseCooldown={metrics.skillCooldowns?.pulse} dashCooldown={metrics.skillCooldowns?.dash} onHud={(value) => setMetrics((m) => ({ ...m, ...value }))} onComplete={battleDone} onDefeat={() => { setPhase('defeat'); onImmersive(false) }} /></Suspense>
    </>}

    {phase === 'classify' && <section className="decision-overlay">
      <div className="decision-card pixel-panel"><span className="eyebrow">系统节点 {systemIndex + 1}/{selected.modes?.length ?? 1} · {modeDesign?.name ?? '材料判断'}</span><div className="item-orb"><GameIcon name={selected.wasteType === 'electronic' ? 'energy' : selected.wasteType === 'plastic' ? 'materials' : selected.wasteType === 'paper' ? 'knowledge' : 'equipment'} size={104} /></div><h2>{modeRound?.object ?? challenge.item}</h2><p>{modeRound?.situation ?? challenge.prompt}</p>
        <div className="decision-options">{(modeRound?.options.map((option) => option.label) ?? challenge.options).map((option, index) => <button key={option} className={answer === null ? '' : index === (modeRound?.best ?? challenge.answer) ? 'correct' : answer === index ? 'wrong' : 'muted'} onClick={() => submitAnswer(index)}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>
        {answer !== null && <div className={`answer-feedback ${correct ? 'correct' : 'wrong'}`}><b>{correct ? '系统判断有效：后续路线被改善' : '本次选择产生了系统代价'}</b><p>{modeRound?.options[answer].feedback ?? challenge.explain}</p><em>{modeRound ? `教育原则 · ${modeRound.options[answer].principle}` : ''}</em><button className="primary-button" onClick={advanceSystem}>{systemIndex >= (selected.modes?.length ?? 1) - 1 ? '完成系统节点，进入构筑' : '进入下一套路线玩法'} <ChevronRight /></button></div>}
      </div>
    </section>}

    {phase === 'build' && <section className="decision-overlay"><div className="build-panel"><span className="eyebrow">本局升级 · 三选一</span><h2>把刚才的处理经验变成战斗能力</h2><div className="build-grid">{buildOptions.map((card) => <button key={card.id} onClick={() => chooseBuild(card.id)} style={{ '--card-color': card.color } as React.CSSProperties}><span>{card.tag}</span><b>{card.name}</b><p>{card.description}</p><small>选择并进入Boss节点</small></button>)}</div></div></section>}

    {phase === 'result' && <section className="result-screen"><div className="prototype-orb"><img src={assetUrl('art/legacy/sprites/item_print.png')} alt="稳定原型" /></div><span className="eyebrow">POLLUTION SHELL CLEARED</span><h1>稳定原型已回收</h1><p>你没有消灭一件废物，而是拆除了让它失控的污染外壳。</p><div className="result-grid"><div><b>{metrics.value}</b><span>本局价值保留</span></div><div><b>{metrics.pollution}%</b><span>最终污染率</span></div><div><b>{correctSystems}/{selected.modes?.length ?? 1}</b><span>系统判断有效</span></div></div><div className="prototype-ticket"><small>获得原型凭证 · {prototypeCollectibleId}</small><b>{selected.prototype}</b><span>可在现实兑换站查看纪念章 / 模型方案</span></div><button className="primary-button" onClick={reset}>返回行动地图</button></section>}
    {phase === 'defeat' && <section className="result-screen defeat"><span className="eyebrow">ACTION INTERRUPTED</span><h1>行动暂时中止</h1><p>污染值不是道德分数。调整构筑与移动节奏，再来一次。</p><button className="primary-button" onClick={() => { setPhase('briefing'); setBuilds([]); setAnswer(null); setCorrect(false); setSystemIndex(0); setCorrectSystems(0); setPurified(0); setMetrics({ hp: 100, maxHp: 100, pollution: 68, value: 0, accuracy: 100, combo: 0, finisher: 0, stage: 0, totalStages: 5 }) }}>重新整备</button></section>}
  </div>
}
