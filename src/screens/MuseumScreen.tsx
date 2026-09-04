import { CheckCircle2, ChevronRight, LockKeyhole, Search, X } from 'lucide-react'
import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { collectibles } from '../data/content'
import type { Collectible, PlayerProfile, WasteType } from '../types'
import GameIcon from '../components/GameIcon'
import { assetUrl } from '../utils/assets'

const materialRooms: Record<WasteType, { name: string; accent: string; caption: string }> = {
  electronic: { name: '电子之芯', accent: '#83dfff', caption: '让功能与数据各得其所' },
  plastic: { name: '塑料新生', accent: '#98e2b4', caption: '从一次使用到再次出发' },
  paper: { name: '纸上记忆', accent: '#f2ce86', caption: '留住纤维，也留住故事' },
  textile: { name: '织物时光', accent: '#f4accb', caption: '修补一处，延续一段时光' },
}
const roomStyle = (type: WasteType): CSSProperties => ({ '--exhibit-accent': materialRooms[type].accent }) as CSSProperties

const filters: { value: 'all' | WasteType; label: string }[] = [
  { value: 'all', label: '全部' }, { value: 'electronic', label: '电子' }, { value: 'plastic', label: '塑料' }, { value: 'paper', label: '纸类' }, { value: 'textile', label: '织物' },
]

export default function MuseumScreen({ profile }: { profile: PlayerProfile }) {
  const [filter, setFilter] = useState<'all' | WasteType>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Collectible | null>(() => collectibles.find((item) => profile.collectibles.includes(item.id)) ?? null)
  const detailRef = useRef<HTMLElement>(null)
  const shown = useMemo(() => collectibles.filter((item) => (filter === 'all' || item.type === filter) && (!query || `${item.name}${item.source}${item.summary}`.includes(query))), [filter, query])
  const unlocked = collectibles.filter((item) => profile.collectibles.includes(item.id)).length

  return <div className="museum-screen screen-enter">
    <header className="facility-hero museum-title">
      <img className="facility-hero-art" src={assetUrl('art/campaign/sh-05.webp')} alt="杨浦仓库中保存着城市记忆的材料档案与藏品" />
      <div className="facility-hero-copy"><span className="facility-kicker">基地设施 / 材料记忆馆</span><h1>价值展馆</h1><p>每件旧物，都有下一章。把行动中找回的藏品放上展台，翻开它从污染前、正确行动到新去向的材料护照。</p><div className="facility-tags"><span>四类材料展区</span><span>行动解锁藏品</span><span>记录真实去向</span></div><a className="facility-entry" href="#museum-collection">浏览我的收藏 <ChevronRight size={19} /></a></div>
      <div className="museum-curator-seal"><GameIcon name="museum" size={70} /><b>{unlocked}<small> / {collectibles.length}</small></b><span>已入馆藏品</span><div className="facility-meter"><i style={{ width: `${unlocked / collectibles.length * 100}%` }} /></div></div>
    </header>
    <nav className="material-rooms" aria-label="材料主题展区">{Object.entries(materialRooms).map(([type, room]) => {
      const items = collectibles.filter((item) => item.type === type)
      return <button key={type} style={roomStyle(type as WasteType)} className={filter === type ? 'active' : ''} aria-pressed={filter === type} onClick={() => setFilter(filter === type ? 'all' : type as WasteType)}><img src={items[0]?.portrait} alt="" /><span><b>{room.name}</b><small>{room.caption}</small><em>{items.filter((item) => profile.collectibles.includes(item.id)).length} / {items.length} 已入馆</em></span><ChevronRight size={18} /></button>
    })}</nav>
    <div className="museum-toolbar" id="museum-collection"><div className="museum-tabs" aria-label="筛选藏品">{filters.map((item) => <button key={item.value} aria-pressed={filter === item.value} className={filter === item.value ? 'active' : ''} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div><label className="search-box"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索藏品、地点或关键词" aria-label="搜索藏品、地点或关键词" />{query && <button onClick={() => setQuery('')} aria-label="清空搜索"><X /></button>}</label></div>
    <div className="museum-layout">
      <section className="album-page"><div className="exhibit-section-heading"><div><span>城市记忆 / 馆藏目录</span><h2>{filter === 'all' ? '每一件，都值得留下' : materialRooms[filter].name}</h2></div><b>{shown.length} 件</b></div>
        <div className="collection-grid">{shown.map((item) => {
          const isUnlocked = profile.collectibles.includes(item.id)
          return <button key={item.id} style={roomStyle(item.type)} className={`collection-card ${selected?.id === item.id ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`} onClick={() => { if (!isUnlocked) return; setSelected(item); detailRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' }); detailRef.current?.focus({ preventScroll: true }) }} disabled={!isUnlocked} aria-label={isUnlocked ? `查看${item.name}的材料护照` : `尚未发现，获取线索：${item.source}`} aria-pressed={selected?.id === item.id}>
            <span className="card-image"><img src={item.portrait} alt="" loading="lazy" /><span className="exhibit-plinth" />{!isUnlocked && <span className="lock-fog"><LockKeyhole /><b>等待发现</b></span>}{selected?.id === item.id && <span className="exhibit-selected"><CheckCircle2 size={15} /> 展示中</span>}</span>
            <span className="card-copy"><small>{isUnlocked ? `${materialRooms[item.type].name} · ${item.rarity}` : '探索线索'}</small><b>{isUnlocked ? item.name : '未记录的故事'}</b><em>{item.source}</em><span className="exhibit-open">{isUnlocked ? '查看材料护照' : '完成对应行动后解锁'}{isUnlocked && <ChevronRight size={16} />}</span></span>
          </button>
        })}</div>
        {shown.length === 0 && <div className="empty-state">没有符合条件的材料护照。</div>}
      </section>
      <aside ref={detailRef} className="display-case" tabIndex={-1} aria-label="藏品材料护照" style={selected ? roomStyle(selected.type) : undefined}>{selected ? <div key={selected.id} className="exhibit-detail-content">
        <div className="exhibit-detail-heading"><span>专属展台 · {materialRooms[selected.type].name}</span><a href="#museum-collection">返回目录</a></div>
        <div className="display-stage"><span className={`rarity ${selected.rarity}`}>{selected.rarity}</span><img src={selected.portrait} alt={selected.name} /><span className="stage-shadow" /></div>
        <span className="eyebrow">一件旧物的下一章 / 材料护照</span><h2>{selected.name}</h2><p className="object-voice">“{selected.summary}”</p>
        <div className="passport-flow"><div><span>01</span><b>污染前</b><p>{selected.before}</p></div><ChevronRight /><div><span>02</span><b>正确行动</b><p>{selected.action}</p></div><ChevronRight /><div><span>03</span><b>新去向</b><p>{selected.after}</p></div></div>
        <div className="source-stamp"><CheckCircle2 /><div><small>记录来源</small><b>{selected.source}</b></div></div>
      </div> : <div className="empty-display"><GameIcon name="museum" size={110} /><h2>为第一件藏品留一束光</h2><p>完成城市行动，找回稳定原型。获得的藏品会点亮这里的展台，并记录它的新去向。</p><span>从馆藏目录查看各件藏品的获取线索</span></div>}</aside>
    </div>
  </div>
}
