import { Check, LockKeyhole, ShoppingBag, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { equipment } from '../data/content'
import type { EquipmentItem, PlayerProfile } from '../types'

interface Props { profile: PlayerProfile; onChange: (profile: PlayerProfile) => void; notify: (text: string, tone?: 'success' | 'warning') => void }

const slots = [{ id: 'weapon', label: '工具' }, { id: 'helmet', label: '头部' }, { id: 'armor', label: '行动服' }, { id: 'boots', label: '工作靴' }] as const

export default function EquipmentScreen({ profile, onChange, notify }: Props) {
  const [slot, setSlot] = useState<EquipmentItem['slot']>('weapon')
  const selected = equipment.filter((item) => item.slot === slot)
  const equip = (item: EquipmentItem) => {
    const owned = profile.equipmentOwned.includes(item.id)
    if (!owned) {
      if (profile.points < item.cost) return notify('行动积分不足，先完成关卡或故事。', 'warning')
      onChange({ ...profile, points: profile.points - item.cost, equipmentOwned: [...profile.equipmentOwned, item.id], equipped: { ...profile.equipped, [item.slot]: item.id } })
      notify(`已兑换并装备：${item.name}`, 'success')
    } else {
      onChange({ ...profile, equipped: { ...profile.equipped, [item.slot]: item.id } }); notify(`已装备：${item.name}`, 'success')
    }
  }
  const activeRarity = equipment.find((item) => item.id === profile.equipped.weapon)?.rarity ?? '普通'

  return <div className="equipment-screen screen-enter"><header className="page-title"><div><span className="eyebrow">MODULAR LOADOUT / LEGACY ITEMS</span><h1>装备工坊</h1><p>保留旧项目已制作的装备资产，但重新组织成清晰的插槽系统。游戏内只显示适配后的武器与头部层，不再把整张图标贴在角色身上。</p></div><div className="points-box">行动积分 <b>◈ {profile.points}</b></div></header>
    <div className="equipment-layout"><section className="paper-doll pixel-panel"><div className={`character-platform aura-${activeRarity}`}><span className="scan-ring" /><img className="hero-base" src="/art/legacy/sprites/hero_idle_front.png" alt="行动者" /><span className="loadout-status">已应用整套属性</span><span className="platform-shadow" /></div><div className="equipped-list">{slots.map((item) => { const equipped = equipment.find((gear) => gear.id === profile.equipped[item.id]); return <button key={item.id} className={slot === item.id ? 'active' : ''} onClick={() => setSlot(item.id)}><span>{item.label}</span><b>{equipped?.name}</b><img src={equipped?.icon} alt="" /></button> })}</div></section>
      <section className="gear-inventory"><div className="slot-tabs">{slots.map((item) => <button key={item.id} className={slot === item.id ? 'active' : ''} onClick={() => setSlot(item.id)}>{item.label}</button>)}</div><div className="gear-grid">{selected.map((item) => { const owned = profile.equipmentOwned.includes(item.id); const active = profile.equipped[item.slot] === item.id; return <article key={item.id} className={`gear-card rarity-${item.rarity}`}><span className="gear-image"><img src={item.icon} alt="" />{!owned && <LockKeyhole />}</span><small>{item.rarity}</small><h3>{item.name}</h3><p>{item.description}</p><em>{item.stat}</em><button disabled={active} onClick={() => equip(item)}>{active ? <><Check /> 已装备</> : owned ? '装备' : <><ShoppingBag /> ◈ {item.cost}</>}</button></article> })}</div></section></div>
    <div className="equipment-note"><Sparkles /><p><b>装配规则：</b>装备属性在每局开始时结算。旧装备图没有可靠穿戴锚点，因此不再硬贴到人物身上；当前以状态光效表达，后续只有通过统一锚点验收的武器和头部资产才会进入角色模型。</p></div>
  </div>
}
