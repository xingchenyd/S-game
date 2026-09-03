import { Check } from 'lucide-react'
import GameIcon from '../components/GameIcon'
import { canUnlockSkill, skillNodes } from '../data/skills'
import type { PlayerProfile } from '../types'

interface Props { profile: PlayerProfile; onChange: (profile: PlayerProfile) => void; notify: (text: string, tone?: 'success' | 'warning') => void }
const branches = ['行动', '系统', '共情'] as const

export default function SkillTreeScreen({ profile, onChange, notify }: Props) {
  const unlock = (id: string) => {
    const skill = skillNodes.find((entry) => entry.id === id)
    if (!skill || profile.unlockedSkills.includes(id)) return
    if (!canUnlockSkill(id, profile.unlockedSkills)) return notify('需要先掌握前置能力。', 'warning')
    if (profile.skillPoints < skill.cost) return notify('技能点不足，推进上海主线可继续获得。', 'warning')
    onChange({ ...profile, skillPoints: profile.skillPoints - skill.cost, unlockedSkills: [...profile.unlockedSkills, id] })
    notify(`永久能力已解锁：${skill.name}`, 'success')
  }
  return <div className="skill-screen screen-enter">
    <header className="page-title"><div><span className="eyebrow">PERMANENT GROWTH / CITY PRACTICE</span><h1>循环能力树</h1><p>永久成长分为行动、系统与共情。高阶能力不仅提高战斗数值，也会改变地图信息、人物回应和材料去向。</p></div><div className="points-box">可用技能点 <b><GameIcon name="skills" size={42} /> {profile.skillPoints}</b></div></header>
    <div className="skill-legend"><span><i className="unlocked" />已掌握</span><span><i className="available" />可解锁</span><span><i />未满足前置</span></div>
    <div className="ability-tree"><div className="tree-canopy" aria-hidden="true"><i /><i /><i /></div><div className="tree-core"><span><GameIcon name="skills" size={64} /></span><small>CIRCULAR CORE</small><b>城市循环核心</b><em>完成行动，让经验沿枝干生长</em></div><div className="tree-trunk" aria-hidden="true" />
    <div className="skill-branches">{branches.map((branch) => <section key={branch} className={`skill-branch branch-${branch}`}>
      <header><GameIcon name={branch === '行动' ? 'training' : branch === '系统' ? 'knowledge' : 'theater'} size={58} /><div><small>{branch === '行动' ? 'ACTION' : branch === '系统' ? 'SYSTEM' : 'EMPATHY'}</small><h2>{branch}分支</h2></div></header>
      <div className="skill-track">{skillNodes.filter((skill) => skill.branch === branch).map((skill, index) => {
        const unlocked = profile.unlockedSkills.includes(skill.id)
        const available = canUnlockSkill(skill.id, profile.unlockedSkills)
        return <div key={skill.id} className={`skill-node ${unlocked ? 'unlocked' : available ? 'available' : 'locked'}`}>
          {index > 0 && <span className="skill-link" />}
          <button onClick={() => unlock(skill.id)} disabled={unlocked || !available} aria-label={`${skill.name}，${unlocked ? '已掌握' : available ? '可解锁' : '未解锁'}`}>
            <span className="skill-tier">T{skill.tier}</span>{unlocked ? <Check /> : <GameIcon name={available ? 'skills' : 'locked'} size={46} />}
          </button>
          <div><h3>{skill.name}</h3><p>{skill.description}</p><b>{skill.effect}</b>{skill.routeAbility && <em>路线能力 · {skill.routeAbility}</em>}<small>{unlocked ? '已掌握' : `${skill.cost} 技能点`}</small></div>
        </div>
      })}</div>
    </section>)}</div></div>
    <aside className="skill-note"><b>设计约束</b><span>技能点不能购买，只能通过主线与重要教育节点获得。每条分支总成本 6 点，首次通关上海篇约能完成两条分支，保留构筑选择。</span></aside>
  </div>
}
