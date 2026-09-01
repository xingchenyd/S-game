import { Check, LockKeyhole, ShoppingBag, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { equipment } from '../data/content'
import { resolveCombatStats, statLabels } from '../data/balance'
import type { CombatStats, EquipmentItem, PlayerProfile } from '../types'
import { assetUrl } from '../utils/assets'
import GameIcon from '../components/GameIcon'

interface Props { profile: PlayerProfile; onChange: (profile: PlayerProfile) => void; notify: (text: string, tone?: 'success' | 'warning') => void }

const slots = [{ id: 'weapon', label: '工具' }, { id: 'helmet', label: '头部' }, { id: 'armor', label: '行动服' }, { id: 'boots', label: '工作靴' }] as const

export default function EquipmentScreen({ profile, onChange, notify }: Props) {
  const [slot, setSlot] = useState<EquipmentItem['slot']>('weapon')
  const [previewId, setPreviewId] = useState(profile.equipped.weapon)
  const selected = equipment.filter((item) => item.slot === slot)
  const currentStats = useMemo(() => resolveCombatStats(profile), [profile])
  const preview = equipment.find((item) => item.id === previewId) ?? selected[0]
  const previewStats = useMemo(() => preview ? resolveCombatStats({ ...profile, equipped: { ...profile.equipped, [preview.slot]: preview.id } }) : currentStats, [preview, profile, currentStats])
  const workshopDiscount = profile.campaignCompleted.includes('sh-06') ? .85 : 1
  const itemCost = (item: EquipmentItem) => Math.round(item.cost * workshopDiscount)
  const equip = (item: EquipmentItem) => {
    const owned = profile.equipmentOwned.includes(item.id)
    if (!owned) {
      const cost = itemCost(item)
      if (profile.points < cost) return notify('行动积分不足，先完成关卡或故事。', 'warning')
      onChange({ ...profile, points: profile.points - cost, equipmentOwned: [...profile.equipmentOwned, item.id], equipped: { ...profile.equipped, [item.slot]: item.id } })
      notify(`已兑换并装备：${item.name}`, 'success')
    } else {
      onChange({ ...profile, equipped: { ...profile.equipped, [item.slot]: item.id } }); notify(`已装备：${item.name}`, 'success')
    }
  }
  const activeRarity = equipment.find((item) => item.id === profile.equipped.weapon)?.rarity ?? '普通'

  const visibleStats = (Object.keys(statLabels) as (keyof CombatStats)[]).filter((key) => key !== 'aimAssist')
  const formatStat = (key: keyof CombatStats, value: number) => ['attackSpeed', 'cooldownRate', 'critChance', 'valueGain', 'pollutionGuard'].includes(key) ? `${Math.round(value * 100)}%` : Math.round(value)

  return <div className="equipment-screen screen-enter"><header className="page-title"><div><span className="eyebrow">MODULAR LOADOUT / POWER BUDGET V3</span><h1>装备工坊</h1><p>每件装备都有明确战力预算和玩法取向。属性会在关卡开始时真实结算到生命、净化、移速、冷却、弱点与价值保留。</p></div><div className="points-box">行动积分 <b><GameIcon name="value" size={38} /> {profile.points}</b></div></header>
    <div className="equipment-layout"><section className="paper-doll pixel-panel"><div className={`character-platform aura-${activeRarity}`}><span className="scan-ring" /><img className="hero-base" src={assetUrl('art/legacy/sprites/hero_idle_front.png')} alt="行动者" /><span className="loadout-status">已应用整套属性</span><span className="platform-shadow" /></div><div className="equipped-list">{slots.map((item) => { const equipped = equipment.find((gear) => gear.id === profile.equipped[item.id]); return <button key={item.id} className={slot === item.id ? 'active' : ''} onClick={() => setSlot(item.id)}><span>{item.label}</span><b>{equipped?.name}</b><img src={equipped?.icon} alt="" /></button> })}</div></section>
      <section className="gear-inventory"><div className="slot-tabs">{slots.map((item) => <button key={item.id} className={slot === item.id ? 'active' : ''} onClick={() => { setSlot(item.id); setPreviewId(profile.equipped[item.id]) }}>{item.label}</button>)}{workshopDiscount < 1 && <span className="workshop-discount">主线维修许可 · 85 折</span>}</div><div className="loadout-stats pixel-panel"><header><span><small>当前综合属性</small><b>装配评分 {equipment.filter((item) => Object.values(profile.equipped).includes(item.id)).reduce((sum, item) => sum + item.power, 0)}</b></span>{preview && <em>预览 · {preview.name}</em>}</header><div>{visibleStats.map((key) => { const delta = previewStats[key] - currentStats[key]; return <span key={key}><small>{statLabels[key]}</small><b>{formatStat(key, previewStats[key])}</b>{delta !== 0 && <i className={delta > 0 ? 'up' : 'down'}>{delta > 0 ? <TrendingUp /> : <TrendingDown />}{delta > 0 ? '+' : ''}{formatStat(key, delta)}</i>}</span> })}</div></div><div className="gear-grid">{selected.map((item) => { const owned = profile.equipmentOwned.includes(item.id); const active = profile.equipped[item.slot] === item.id; return <article key={item.id} onPointerEnter={() => setPreviewId(item.id)} onFocus={() => setPreviewId(item.id)} className={`gear-card rarity-${item.rarity} ${previewId === item.id ? 'is-preview' : ''}`}><span className="gear-image"><img src={item.icon} alt="" />{!owned && <GameIcon name="locked" size={42} />}</span><small>{item.rarity} · 预算 {item.power}</small><h3>{item.name}</h3><p>{item.description}</p><em>{item.stat}</em>{item.perk && <u>{item.perk}</u>}<button disabled={active} onClick={() => equip(item)}>{active ? <><Check /> 已装备</> : owned ? '装备' : <><ShoppingBag /> ◈ {itemCost(item)}</>}</button></article> })}</div></section></div>
    <div className="equipment-note"><GameIcon name="equipment" size={52} /><p><b>装配规则：</b>同稀有度遵循相近战力预算，但分配方向不同。旧装备图暂时作为库存图标；只有通过统一锚点验收的精细2D部件才会进入角色穿戴层，避免再次出现悬空、穿模和闪烁。</p></div>
  </div>
}
