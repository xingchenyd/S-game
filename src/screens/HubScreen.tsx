import { ArrowRight, BookOpen, Boxes, ChartNoAxesCombined, Gift, Map, Shirt, Sparkles } from 'lucide-react'
import type { PlayerProfile, Screen } from '../types'

interface Props { profile: PlayerProfile; onNavigate: (screen: Screen) => void }

export default function HubScreen({ profile, onNavigate }: Props) {
  const accuracy = profile.stats.classificationTotal ? Math.round(profile.stats.classificationCorrect / profile.stats.classificationTotal * 100) : 0
  return (
    <div className="hub-screen screen-enter">
      <section className="hub-hero pixel-panel">
        <img src="/art/legacy/sprites/char_bluecat.png" alt="蓝猫守护员" />
        <div>
          <span className="eyebrow">循环基地 · 上海站</span>
          <h1>早上好，{profile.username}</h1>
          <p>城市里出现了新的污染外壳。今天也不是去“消灭垃圾”，而是把危险控制住，把仍有价值的材料带回正确路径。</p>
          <button className="primary-button" onClick={() => onNavigate('adventure')}>选择行动 <ArrowRight /></button>
        </div>
        <div className="hero-metrics">
          <div><strong>{profile.prototypes.length}</strong><span>稳定原型</span></div>
          <div><strong>{accuracy}%</strong><span>分类准确率</span></div>
          <div><strong>{profile.stats.valuePreserved}</strong><span>价值保留</span></div>
        </div>
      </section>

      <section className="section-heading"><div><span className="eyebrow">BASE MAP 01</span><h2>选择基地设施</h2></div><span className="live-chip"><i /> 系统在线</span></section>
      <div className="facility-grid">
        <button className="facility-card action" onClick={() => onNavigate('adventure')}>
          <span className="facility-icon"><Map /></span><span className="facility-copy"><b>行动中枢</b><small>随机路线 · 战斗 · 分类 · Boss</small></span><ArrowRight />
        </button>
        <button className="facility-card museum" onClick={() => onNavigate('museum')}>
          <span className="facility-icon"><Boxes /></span><span className="facility-copy"><b>价值展馆</b><small>材料护照 · 原型档案 · 对话</small></span><span className="count-chip">{profile.collectibles.length}</span>
        </button>
        <button className="facility-card theater" onClick={() => onNavigate('theater')}>
          <span className="facility-icon"><BookOpen /></span><span className="facility-copy"><b>循环剧场</b><small>约两分钟的互动环境故事</small></span><span className="count-chip">{profile.storiesCompleted.length}</span>
        </button>
        <button className="facility-card equipment" onClick={() => onNavigate('equipment')}>
          <span className="facility-icon"><Shirt /></span><span className="facility-copy"><b>装备工坊</b><small>模块化装配 · 遗产装备保留</small></span><ArrowRight />
        </button>
        <button className="facility-card exchange" onClick={() => onNavigate('exchange')}>
          <span className="facility-icon"><Gift /></span><span className="facility-copy"><b>现实兑换站</b><small>原型凭证 · 纪念章 · 模型预览</small></span><ArrowRight />
        </button>
        <button className="facility-card profile" onClick={() => onNavigate('profile')}>
          <span className="facility-icon"><ChartNoAxesCombined /></span><span className="facility-copy"><b>个人行动档案</b><small>仅本机统计 · 学习与行动反馈</small></span><ArrowRight />
        </button>
      </div>

      <section className="daily-brief pixel-panel">
        <Sparkles />
        <div><b>今日提示：回收不等于无限使用</b><p>在“减量—复用—维修—回收”的顺序里，分类只是让材料价值不在最后一步丢失。</p></div>
      </section>
    </div>
  )
}
