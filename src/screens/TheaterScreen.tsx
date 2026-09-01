import { ArrowLeft, BookOpen, Check, ChevronRight, Clock3, MapPin, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { stories } from '../data/content'
import type { PlayerProfile, StoryDefinition } from '../types'

interface Props { profile: PlayerProfile; onChange: (profile: PlayerProfile) => void }

export default function TheaterScreen({ profile, onChange }: Props) {
  const [story, setStory] = useState<StoryDefinition | null>(null)
  const [beat, setBeat] = useState(0)
  const [reply, setReply] = useState<{ text: string; insight?: string } | null>(null)
  const [finished, setFinished] = useState(false)

  const open = (item: StoryDefinition) => { setStory(item); setBeat(0); setReply(null); setFinished(false) }
  const next = () => {
    if (!story) return
    if (reply) { setReply(null); setBeat((value) => value + 1); return }
    if (beat >= story.beats.length - 1) {
      setFinished(true)
      if (!profile.storiesCompleted.includes(story.id)) onChange({ ...profile, storiesCompleted: [...profile.storiesCompleted, story.id], points: profile.points + 30, stats: { ...profile.stats, storiesRead: profile.stats.storiesRead + 1 } })
    } else setBeat((value) => value + 1)
  }

  if (!story) return <div className="theater-screen screen-enter"><header className="page-title"><div><span className="eyebrow">CIRCULAR THEATER / INTERACTIVE STORIES</span><h1>循环剧场</h1><p>每个故事约两分钟。你会听见废物怎么描述自己的风险、价值与可能去向，并在关键处替行动者作答。</p></div></header><div className="story-library">{stories.map((item, index) => <button key={item.id} className="story-card" onClick={() => open(item)}><img src={item.cover} alt="" /><span className="story-overlay" /><span className="story-index">EP.0{index + 1}</span>{profile.storiesCompleted.includes(item.id) && <span className="completed-chip"><Check /> 已读</span>}<span className="story-info"><small>{item.location}</small><b>{item.title}</b><em>{item.subtitle}</em><span><Clock3 /> {item.duration}</span></span></button>)}</div></div>

  const current = story.beats[beat]
  return <div className="dialogue-stage screen-enter" style={{ backgroundImage: `linear-gradient(0deg,#030a0ef5 0%,#030a0e44 65%), url(${story.cover})` }}>
    <header className="dialogue-header"><button onClick={() => setStory(null)}><ArrowLeft /> 退出故事</button><div><small>{story.location}</small><b>{story.title}</b></div><span>{beat + 1} / {story.beats.length}</span></header>
    <div className="dialogue-progress"><span style={{ width: `${(beat + 1) / story.beats.length * 100}%` }} /></div>
    {!finished ? <section className="dialogue-box">
      {current.portrait && <div className="dialogue-portrait"><img src={current.portrait} alt="" /></div>}
      <div className="dialogue-copy"><span>{reply ? '回应' : current.speaker}</span><p>{reply ? reply.text : current.text}</p>{reply?.insight && <em>行动笔记 · {reply.insight}</em>}
        {!reply && current.choices ? <div className="dialogue-choices">{current.choices.map((choice) => <button key={choice.text} onClick={() => setReply({ text: choice.reply, insight: choice.insight })}>{choice.text}<ChevronRight /></button>)}</div> : <button className="dialogue-next" onClick={next}>{reply || beat < story.beats.length - 1 ? '继续' : '完成故事'} <ChevronRight /></button>}
      </div>
    </section> : <section className="story-complete pixel-panel"><BookOpen /><span className="eyebrow">STORY COMPLETE</span><h2>故事已收录</h2><p>你完成了《{story.title}》，获得 30 行动积分。相关知识会在对应材料护照与关卡决策中再次出现。</p><div><button className="secondary-button" onClick={() => { setBeat(0); setFinished(false) }}><RotateCcw /> 再读一次</button><button className="primary-button" onClick={() => setStory(null)}>返回剧场</button></div></section>}
  </div>
}
