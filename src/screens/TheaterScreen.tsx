import { ArrowLeft, BookOpen, Check, ChevronRight, Clock3, ExternalLink, MapPin, Pause, Play, RotateCcw, Search, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { knowledgeSources, stories } from '../data/content'
import { speakChinese, stopSpeech } from '../store/audio'
import type { PlayerProfile, StoryDefinition, WasteType } from '../types'

interface Props { profile: PlayerProfile; onChange: (profile: PlayerProfile) => void }
const typeNames: Record<WasteType, string> = { electronic: '电子物', plastic: '塑料', paper: '纸材', textile: '织物' }

export default function TheaterScreen({ profile, onChange }: Props) {
  const [story, setStory] = useState<StoryDefinition | null>(null)
  const [beat, setBeat] = useState(0)
  const [reply, setReply] = useState<{ text: string; insight?: string } | null>(null)
  const [finished, setFinished] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | WasteType>('all')
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const filtered = useMemo(() => stories.filter((item) => (filter === 'all' || item.type === filter) && `${item.title}${item.subtitle}${item.location}${item.tags.join('')}`.toLowerCase().includes(query.trim().toLowerCase())), [filter, query])
  const open = (item: StoryDefinition) => { stopSpeech(); setStory(item); setBeat(0); setReply(null); setFinished(false); setSpeaking(false) }
  const next = () => {
    if (!story) return
    stopSpeech(); setSpeaking(false)
    if (reply) { setReply(null); setBeat((value) => value + 1); return }
    if (beat >= story.beats.length - 1) {
      setFinished(true)
      if (!profile.storiesCompleted.includes(story.id)) onChange({ ...profile, storiesCompleted: [...profile.storiesCompleted, story.id], points: profile.points + 30, stats: { ...profile.stats, storiesRead: profile.stats.storiesRead + 1 } })
    } else setBeat((value) => value + 1)
  }

  const spokenText = story ? (reply?.text ?? story.beats[beat]?.text ?? '') : ''
  const speak = () => {
    if (speaking) { stopSpeech(); setSpeaking(false); return }
    setSpeaking(speakChinese(spokenText, profile.settings.voiceVolume, () => setSpeaking(false)))
  }
  useEffect(() => {
    if (!story || finished || !profile.settings.voicePreview || !spokenText) return
    setSpeaking(speakChinese(spokenText, profile.settings.voiceVolume, () => setSpeaking(false)))
    return stopSpeech
  }, [story?.id, spokenText, finished, profile.settings.voicePreview, profile.settings.voiceVolume])
  useEffect(() => stopSpeech, [])

  if (!story) return <div className="theater-screen screen-enter">
    <header className="page-title"><div><span className="eyebrow">CIRCULAR THEATER / 40 INTERACTIVE STORIES</span><h1>循环剧场</h1><p>40个约2–3分钟故事，四类各10篇。每篇都有两次互动选择、知识来源、学习目标与审校状态；真实地点是背景，事件和角色均为虚构。</p></div><div className="points-box">已完成<b>{profile.storiesCompleted.length} / 40</b></div></header>
    <section className="theater-toolbar pixel-panel"><div className="theater-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索故事、地点或标签" /><span>{filtered.length} 篇</span></div><div className="theater-filters"><SlidersHorizontal />{(['all', 'electronic', 'plastic', 'paper', 'textile'] as const).map((type) => <button key={type} className={filter === type ? 'active' : ''} onClick={() => setFilter(type)}>{type === 'all' ? '全部' : typeNames[type]}</button>)}</div><button className="source-library-button" onClick={() => setSourcesOpen(true)}><BookOpen /> 资料来源</button></section>
    <div className="story-library">{filtered.map((item, index) => <button key={item.id} className="story-card" onClick={() => open(item)}><img src={item.cover} alt="" /><span className="story-overlay" /><span className="story-index">EP.{String(stories.indexOf(item) + 1).padStart(2, '0')}</span>{profile.storiesCompleted.includes(item.id) && <span className="completed-chip"><Check /> 已读</span>}<span className="story-info"><small>{item.location}</small><b>{item.title}</b><em>{item.subtitle}</em><span><Clock3 /> {item.duration} · {item.estimatedCharacters}字</span><i>{item.tags.slice(0, 3).map((tag) => <u key={tag}>{tag}</u>)}</i></span></button>)}</div>
    {!filtered.length && <div className="empty-state">没有匹配的故事，试试清空搜索或切换材料类别。</div>}
    {sourcesOpen && <SourceModal onClose={() => setSourcesOpen(false)} />}
  </div>

  const current = story.beats[beat]
  const storySources = knowledgeSources.filter((source) => story.sourceIds.includes(source.id))
  return <div className="dialogue-stage screen-enter" style={{ backgroundImage: `linear-gradient(0deg,#030a0ef5 0%,#030a0e44 65%), url(${story.cover})` }}>
    <header className="dialogue-header"><button onClick={() => { stopSpeech(); setStory(null) }}><ArrowLeft /> 退出故事</button><div><small>{story.location}</small><b>{story.title}</b></div><span>{beat + 1} / {story.beats.length}</span></header>
    <div className="dialogue-progress"><span style={{ width: `${(beat + 1) / story.beats.length * 100}%` }} /></div>
    {!finished ? <section className="dialogue-box">
      {current.portrait && <div className="dialogue-portrait"><img src={current.portrait} alt="" /></div>}
      <div className="dialogue-copy"><div className="dialogue-speaker"><span>{reply ? '回应' : current.speaker}</span><button onClick={speak} aria-label={speaking ? '停止语音' : '播放本句语音'}>{speaking ? <Pause /> : <Volume2 />}{speaking ? '停止' : '语音预览'}</button></div><p>{reply ? reply.text : current.text}</p>{reply?.insight && <em>行动笔记 · {reply.insight}</em>}
        {!reply && current.choices ? <div className="dialogue-choices">{current.choices.map((choice) => <button key={choice.text} onClick={() => { stopSpeech(); setSpeaking(false); setReply({ text: choice.reply, insight: choice.insight }) }}>{choice.text}<ChevronRight /></button>)}</div> : <button className="dialogue-next" onClick={next}>{reply || beat < story.beats.length - 1 ? '继续' : '完成故事'} <ChevronRight /></button>}
      </div>
    </section> : <section className="story-complete pixel-panel"><BookOpen /><span className="eyebrow">STORY COMPLETE</span><h2>故事已收录</h2><p>你完成了《{story.title}》，获得30行动积分。以下学习目标会在材料护照与行动关卡中再次出现。</p><div className="story-goals">{story.learningGoals.map((goal) => <span key={goal}><Check />{goal}</span>)}</div><div className="story-source-stamp"><b>{story.reviewStatus}</b><span>{storySources.map((source) => source.publisher).join(' · ')}</span></div><div><button className="secondary-button" onClick={() => { setBeat(0); setFinished(false) }}><RotateCcw /> 再读一次</button><button className="primary-button" onClick={() => setStory(null)}>返回剧场</button></div></section>}
  </div>
}

function SourceModal({ onClose }: { onClose: () => void }) {
  return <div className="mode-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="source-modal-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="source-modal pixel-panel"><header><div><span className="eyebrow">KNOWLEDGE BASE / CHECKED 2026-09-01</span><h2 id="source-modal-title">剧情知识来源</h2></div><button onClick={onClose} aria-label="关闭资料来源">×</button></header><p>来源用于核对上海分类定义、投放要求与电子废弃物专业处理边界。剧情是教育性虚构，不替代现场标识、专业人员意见或当地最新规则。</p>{knowledgeSources.map((source) => <article key={source.id}><div><MapPin /><span><b>{source.title}</b><small>{source.publisher}</small></span></div><p>{source.scope}</p><a href={source.url} target="_blank" rel="noreferrer">查看官方来源 <ExternalLink /></a></article>)}</section></div>
}
