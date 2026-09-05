import type { SkillEffects, SkillNode } from '../types'

export const skillNodes: SkillNode[] = [
  { id: 'action-footwork', name: '安全步法', branch: '行动', tier: 1, cost: 1, description: '先学会留出安全距离，再向污染体靠近。', effect: '移速 +12；技能循环 +5%', requires: [], modifiers: { moveSpeed: 12, cooldownRate: .05 } },
  { id: 'action-calibration', name: '工具校准', branch: '行动', tier: 2, cost: 2, description: '校准净化工具，让主动攻击更稳定地命中弱点。', effect: '净化强度 +2；弱点率 +3%', requires: ['action-footwork'], modifiers: { attack: 2, critChance: .03 } },
  { id: 'action-second-wind', name: '二次整备', branch: '行动', tier: 3, cost: 3, description: '每场战斗首次受伤后生命不高于30%且仍存活时，启用备用防护；不能抵挡致命一击。', effect: '生命 +12；濒危获得30护盾，每场一次', requires: ['action-calibration'], modifiers: { maxHp: 12 }, perks: { secondWindShield: 30 }, routeAbility: '应急防护' },
  { id: 'action-wide-pulse', name: '环形共振', branch: '行动', tier: 4, cost: 3, description: '扩展Q脉冲的覆盖边界，适合处理聚集目标。', effect: '脉冲半径 +24场景单位', requires: ['action-second-wind'], perks: { pulseRadius: 24 }, routeAbility: '范围净化' },
  { id: 'action-field-repair', name: '随行修复', branch: '行动', tier: 5, cost: 4, description: '提高生命补给利用率，恢复量不会超过最大生命。', effect: '生命补给额外恢复最大生命的5%', requires: ['action-wide-pulse'], perks: { healingBonus: .05 }, routeAbility: '补给强化' },
  { id: 'action-energy-loop', name: '能量回环', branch: '行动', tier: 6, cost: 4, description: '从能量掉落物里回收更多电量，帮助蓄满原型终结。', effect: '能量拾取 +6终结能量，上限100', requires: ['action-field-repair'], perks: { energyBonus: 6 }, routeAbility: '终结循环' },
  { id: 'action-dash-barrier', name: '流动屏障', branch: '行动', tier: 7, cost: 5, description: '成功冲刺时修复护盾；冷却中按键不生效，也不提高护盾上限。', effect: '每次有效冲刺恢复6护盾', requires: ['action-energy-loop'], perks: { dashShield: 6 }, routeAbility: '机动防护' },
  { id: 'action-regrowth', name: '生生不息', branch: '行动', tier: 8, cost: 5, description: '净化普通或精英污染体时回收修复能量，维持连续战斗。', effect: '每净化一个非Boss目标恢复2生命', requires: ['action-dash-barrier'], perks: { killHeal: 2 }, routeAbility: '行动冠层' },
  { id: 'system-scan', name: '材质扫描', branch: '系统', tier: 1, cost: 1, description: '在主线调查房间中预览风险与价值目标。', effect: '污染防护 +4%；调查目标预览', requires: [], modifiers: { pollutionGuard: .04 }, routeAbility: '房间扫描' },
  { id: 'system-routing', name: '逆向路线', branch: '系统', tier: 2, cost: 2, description: '减少流转损失，净化目标与材料掉落采用更高的价值系数。', effect: '战斗价值保留系数 +8%', requires: ['system-scan'], modifiers: { valueGain: .08 } },
  { id: 'system-purity', name: '批次纯度', branch: '系统', tier: 3, cost: 3, description: '在行动的系统判断节点作出正确选择，保护后续批次。', effect: '每次正确系统判断额外降低污染3点', requires: ['system-routing'], perks: { decisionPollution: 3 }, routeAbility: '判断联动' },
  { id: 'system-containment', name: '分区围护', branch: '系统', tier: 4, cost: 3, description: '把防护资源放在扩散路径上，同时降低受伤和污染累积。', effect: '污染防护 +4%', requires: ['system-purity'], modifiers: { pollutionGuard: .04 } },
  { id: 'system-ledger', name: '完整交接', branch: '系统', tier: 5, cost: 4, description: '正确判断留下完整流转记录，价值带入下一场Boss战。', effect: '正确系统判断额外保留12价值', requires: ['system-containment'], perks: { decisionValue: 12 }, routeAbility: '材料账本' },
  { id: 'system-efficient', name: '低耗工具', branch: '系统', tier: 6, cost: 4, description: '优化弹体与技能触发节奏，不用无限提高单次威力。', effect: '攻速系数 +12%；技能循环 +5%', requires: ['system-ledger'], modifiers: { attackSpeed: .12, cooldownRate: .05 } },
  { id: 'system-watershed', name: '流域协同', branch: '系统', tier: 7, cost: 5, description: '理解上游控制对下游的保护，进一步减少战斗污染压力。', effect: '污染防护 +8%；生命 +8', requires: ['system-efficient'], modifiers: { pollutionGuard: .08, maxHp: 8 } },
  { id: 'system-closed-loop', name: '完整闭环', branch: '系统', tier: 8, cost: 5, description: '把观察、判断和交接连成一条线，与前序节点效果叠加。', effect: '正确判断再降4污染、再获18价值', requires: ['system-watershed'], perks: { decisionPollution: 4, decisionValue: 18 }, routeAbility: '系统冠层' },
  { id: 'empathy-listen', name: '先听完', branch: '共情', tier: 1, cost: 1, description: '剧场阅读可展开观察提示，先看学习目标；战斗更易吸附掉落。', effect: '解锁阅读观察提示；吸附范围 +8%', requires: [], modifiers: { aimAssist: .08 }, perks: { readingHint: 1 }, routeAbility: '观察手记' },
  { id: 'empathy-memory', name: '城市记忆', branch: '共情', tier: 2, cost: 2, description: '把完整听过的故事留在行动册，重读不重复领取奖励。', effect: '首次完成故事额外获得12行动积分', requires: ['empathy-listen'], perks: { storyBonus: 12 }, routeAbility: '故事收录' },
  { id: 'empathy-prototype', name: '原型叙事', branch: '共情', tier: 3, cost: 3, description: '不只保存污染外壳的战利品，也重视它留下的材料价值。', effect: '战斗价值保留系数 +10%（含Boss）', requires: ['empathy-memory'], modifiers: { valueGain: .1 } },
  { id: 'empathy-care', name: '互助补给', branch: '共情', tier: 4, cost: 3, description: '把补给留给真正需要的时刻，可与随行修复叠加。', effect: '生命补给再增加最大生命的5%', requires: ['empathy-prototype'], perks: { healingBonus: .05 }, routeAbility: '照护协同' },
  { id: 'empathy-workshop', name: '共同练习', branch: '共情', tier: 5, cost: 4, description: '训练首次完成或刷新最高分时分享经验，重复旧成绩不加成。', effect: '训练刷新纪录额外获得10行动积分', requires: ['empathy-care'], perks: { trainingBonus: 10 }, routeAbility: '训练复盘' },
  { id: 'empathy-gather', name: '不留遗落', branch: '共情', tier: 6, cost: 4, description: '扩大材料、补给与原型的吸附范围，减少清场遗漏。', effect: '掉落吸附范围系数再增加25%', requires: ['empathy-workshop'], modifiers: { aimAssist: .25 } },
  { id: 'empathy-archive', name: '山河档案', branch: '共情', tier: 7, cost: 5, description: '为新收录的区域故事补全观察记录，与城市记忆奖励叠加。', effect: '首次故事收录再增加18行动积分', requires: ['empathy-gather'], perks: { storyBonus: 18 }, routeAbility: '区域叙事' },
  { id: 'empathy-steward', name: '无痕守护者', branch: '共情', tier: 8, cost: 5, description: '击败Boss后，最终污染不高于25时获得额外奖励，并非道德评分。', effect: '低污染胜利额外获得50行动积分', requires: ['empathy-archive'], perks: { cleanFinishBonus: 50 }, routeAbility: '共情冠层' },
]

export const canUnlockSkill = (id: string, unlocked: string[]) => {
  const skill = skillNodes.find((entry) => entry.id === id)
  return Boolean(skill && !unlocked.includes(id) && skill.requires.every((required) => unlocked.includes(required)))
}

export const resolveSkillEffects = (unlocked: string[]): SkillEffects => {
  const effects: SkillEffects = { secondWindShield: 0, pulseRadius: 0, healingBonus: 0, energyBonus: 0, dashShield: 0, killHeal: 0, decisionPollution: 0, decisionValue: 0, storyBonus: 0, trainingBonus: 0, cleanFinishBonus: 0, readingHint: 0 }
  for (const node of skillNodes) if (unlocked.includes(node.id)) {
    for (const [key, value] of Object.entries(node.perks ?? {}) as [keyof SkillEffects, number][]) effects[key] += value
  }
  return effects
}
export const firstStoryReward = (skills: string[]) => 30 + resolveSkillEffects(skills).storyBonus
export const trainingReward = (skills: string[], score: number, previous: number) => score > previous ? Math.max(10, score - previous) + resolveSkillEffects(skills).trainingBonus : 5
