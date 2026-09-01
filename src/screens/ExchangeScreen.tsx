import { Box, CheckCircle2, Gift, PackageCheck, Printer, Ticket } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { PlayerProfile } from '../types'

interface Props { profile: PlayerProfile; onChange: (profile: PlayerProfile) => void; notify: (text: string, tone?: 'success' | 'warning') => void }
const rewards = [
  { id: 'badge', name: '稳定原型纪念章', cost: 1, icon: Gift, copy: '活动现场可兑换的金属/再生塑料纪念章方案。' },
  { id: 'figure', name: '污染壳净化模型', cost: 3, icon: Box, copy: 'Boss外壳打开、中心原型发光的桌面模型方案。' },
  { id: 'workshop', name: '循环工坊体验券', cost: 2, icon: Ticket, copy: '连接线下修补、分类或再设计活动的凭证方案。' },
]

export default function ExchangeScreen({ profile, onChange, notify }: Props) {
  const [voucher, setVoucher] = useState<string | null>(null)
  const qr = useMemo(() => Array.from({ length: 121 }, (_, index) => ((index * 17 + (voucher?.length ?? 0) * 13 + Math.floor(index / 11) * 7) % 5 < 2)), [voucher])
  const exchange = (id: string, cost: number, name: string) => {
    if (profile.printShards < cost) return notify('原型碎片不足。击破Boss污染外壳可获得碎片。', 'warning')
    onChange({ ...profile, printShards: profile.printShards - cost })
    setVoucher(`SG-${id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`)
    notify(`已生成「${name}」本机兑换凭证`, 'success')
  }
  return <div className="exchange-screen screen-enter"><header className="page-title"><div><span className="eyebrow">PHYSICAL LINK / CONCEPT STATION</span><h1>现实兑换站</h1><p>当前版本只生成本机凭证与实物概念，不接入物流或3D打印。真正部署展会时可由工作人员扫码核销。</p></div><div className="points-box">原型碎片 <b>◆ {profile.printShards}</b></div></header>
    <section className="prototype-shelf pixel-panel"><div className="shelf-copy"><span className="eyebrow">STABLE PROTOTYPES</span><h2>你已经稳定的原型</h2><p>Boss掉落的不是“尸体”，而是从污染外壳中被保护下来的材料原型。每种原型对应独立纪念物设计。</p></div><div className="prototype-list">{profile.prototypes.length ? profile.prototypes.map((item) => <span key={item}><CheckCircle2 />{item}</span>) : <span className="empty"><PackageCheck />完成一条城市行动后在此显示</span>}</div></section>
    <div className="reward-grid">{rewards.map((item) => <article key={item.id} className="reward-card"><item.icon /><small>实物方案 / 暂不履约</small><h2>{item.name}</h2><p>{item.copy}</p><button className="primary-button" onClick={() => exchange(item.id, item.cost, item.name)}>◆ {item.cost} 生成凭证</button></article>)}</div>
    <section className="physical-roadmap pixel-panel"><Printer /><div><b>后续线下闭环</b><p>Boss原型编号 → 玩家自选纪念物 → 现场扫码核销 / 总部审核 → 本地打印或集中制作 → 领取 / 快递。材料、打印能耗、通风和回收来源必须在实物卡上透明标注。</p></div></section>
    {voucher && <div className="voucher-backdrop" onClick={() => setVoucher(null)}><section className="voucher" onClick={(event) => event.stopPropagation()}><span className="eyebrow">LOCAL REDEMPTION PREVIEW</span><h2>兑换凭证预览</h2><div className="qr-placeholder" aria-label="演示二维码，不可实际核销">{qr.map((on, index) => <i key={index} className={on ? 'on' : ''} />)}</div><code>{voucher}</code><p>演示凭证仅保存在当前设备，不代表真实订单或物流承诺。</p><button className="secondary-button" onClick={() => setVoucher(null)}>关闭</button></section></div>}
  </div>
}
