import type { SkillNode } from '../types'

export const skillNodes: SkillNode[] = [
  { id: 'action-footwork', name: '安全步法', branch: '行动', tier: 1, cost: 1, description: '学习在狭窄处理区保持安全间距。', effect: '移速 +12，冲刺冷却缩短 5%', requires: [], modifiers: { moveSpeed: 12, cooldownRate: .05 } },
  { id: 'action-calibration', name: '工具校准', branch: '行动', tier: 2, cost: 2, description: '让每次净化命中更稳定，而不是盲目加大功率。', effect: '净化强度 +2，弱点率 +3%', requires: ['action-footwork'], modifiers: { attack: 2, critChance: .03 } },
  { id: 'action-second-wind', name: '二次整备', branch: '行动', tier: 3, cost: 3, description: '首次低血量时触发一次临时防护。', effect: '生命 +12；解锁濒危护盾', requires: ['action-calibration'], modifiers: { maxHp: 12 }, routeAbility: 'second-wind' },
  { id: 'system-scan', name: '材质扫描', branch: '系统', tier: 1, cost: 1, description: '进房前标出一个高风险物与一个高价值物。', effect: '污染防护 +4%；解锁房间预览', requires: [], modifiers: { pollutionGuard: .04 }, routeAbility: 'room-preview' },
  { id: 'system-routing', name: '逆向路线', branch: '系统', tier: 2, cost: 2, description: '看见材料离场后的真实接收节点。', effect: '价值保留 +8%；地图出现隐藏系统节点', requires: ['system-scan'], modifiers: { valueGain: .08 }, routeAbility: 'hidden-system-node' },
  { id: 'system-purity', name: '批次纯度', branch: '系统', tier: 3, cost: 3, description: '连续正确判断会保护整批材料价值。', effect: '正确系统判断额外降低污染 3%', requires: ['system-routing'], routeAbility: 'purity-chain' },
  { id: 'empathy-listen', name: '先听完', branch: '共情', tier: 1, cost: 1, description: '与物品和现场角色对话后再决定处理方式。', effect: '解锁额外证词；吸附范围 +8%', requires: [], modifiers: { aimAssist: .08 }, routeAbility: 'extra-testimony' },
  { id: 'empathy-memory', name: '城市记忆', branch: '共情', tier: 2, cost: 2, description: '让曾经的选择在后续人物关系中被记住。', effect: '剧情节点额外获得 12 行动积分', requires: ['empathy-listen'], routeAbility: 'relationship-memory' },
  { id: 'empathy-prototype', name: '原型叙事', branch: '共情', tier: 3, cost: 3, description: '为稳定原型建立来源、选择与去向三段记录。', effect: 'Boss奖励价值 +10%；解锁原型档案', requires: ['empathy-memory'], modifiers: { valueGain: .1 }, routeAbility: 'prototype-record' },
]

export const canUnlockSkill = (id: string, unlocked: string[]) => {
  const skill = skillNodes.find((entry) => entry.id === id)
  return Boolean(skill && !unlocked.includes(id) && skill.requires.every((required) => unlocked.includes(required)))
}
