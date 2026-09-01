import { CheckCircle2, ChevronRight, LockKeyhole, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { collectibles } from '../data/content'
import type { Collectible, PlayerProfile, WasteType } from '../types'

const filters: { value: 'all' | WasteType; label: string }[] = [
  { value: 'all', label: '全部' }, { value: 'electronic', label: '电子' }, { value: 'plastic', label: '塑料' }, { value: 'paper', label: '纸类' }, { value: 'textile', label: '织物' },
]

export default function MuseumScreen({ profile }: { profile: PlayerProfile }) {
  const [filter, setFilter] = useState<'all' | WasteType>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Collectible | null>(() => collectibles.find((item) => profile.collectibles.includes(item.id)) ?? null)
  const shown = useMemo(() => collectibles.filter((item) => (filter === 'all' || item.type === filter) && (!query || `${item.name}${item.source}${item.summary}`.includes(query))), [filter, query])
  const unlocked = collectibles.filter((item) => profile.collectibles.includes(item.id)).length

  return <div className="museum-screen screen-enter">
    <header className="page-title museum-title"><div><span className="eyebrow">VALUE ARCHIVE / MATERIAL PASSPORT</span><h1>价值展馆</h1><p>收藏的不是“垃圾图鉴”，而是每件物品从风险、行动到新去向的材料护照。</p></div><div className="completion-ring" style={{ '--progress': `${unlocked / collectibles.length * 360}deg` } as React.CSSProperties}><span><b>{unlocked}</b>/{collectibles.length}</span></div></header>
    <div className="museum-toolbar pixel-panel"><div className="museum-tabs">{filters.map((item) => <button key={item.value} className={filter === item.value ? 'active' : ''} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div><label className="search-box"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索藏品、地点或关键词" />{query && <button onClick={() => setQuery('')} aria-label="清空搜索"><X /></button>}</label></div>
    <div className="museum-layout">
      <section className="album-page pixel-panel"><div className="album-spine" />
        <div className="collection-grid">{shown.map((item) => {
          const isUnlocked = profile.collectibles.includes(item.id)
          return <button key={item.id} className={`collection-card ${selected?.id === item.id ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`} onClick={() => isUnlocked && setSelected(item)} disabled={!isUnlocked}>
            <span className="card-image"><img src={item.portrait} alt="" />{!isUnlocked && <span className="lock-fog"><LockKeyhole /></span>}</span>
            <span className="card-copy"><small>{isUnlocked ? item.rarity : '尚未发现'}</small><b>{isUnlocked ? item.name : '？？？'}</b><em>{isUnlocked ? item.source : '完成对应行动后记录'}</em></span>
          </button>
        })}</div>
        {shown.length === 0 && <div className="empty-state">没有符合条件的材料护照。</div>}
      </section>
      <aside className="display-case pixel-panel">{selected ? <>
        <div className="display-stage"><span className={`rarity ${selected.rarity}`}>{selected.rarity}</span><img src={selected.portrait} alt={selected.name} /><span className="stage-shadow" /></div>
        <span className="eyebrow">MATERIAL PASSPORT</span><h2>{selected.name}</h2><p className="object-voice">“{selected.summary}”</p>
        <div className="passport-flow"><div><span>01</span><b>污染前</b><p>{selected.before}</p></div><ChevronRight /><div><span>02</span><b>正确行动</b><p>{selected.action}</p></div><ChevronRight /><div><span>03</span><b>新去向</b><p>{selected.after}</p></div></div>
        <div className="source-stamp"><CheckCircle2 /><div><small>记录来源</small><b>{selected.source}</b></div></div>
      </> : <div className="empty-display">从左侧选择一件已解锁藏品。</div>}</aside>
    </div>
  </div>
}
