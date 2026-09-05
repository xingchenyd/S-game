import type { CombatStats, EquipmentSetId, WeaponMode } from '../types'

export interface WeaponBehavior {
  mode: WeaponMode
  name: string
  detail: string
  clickCooldown: number
  color: number
}

export const weaponBehaviors: Record<string, WeaponBehavior> = {
  'wrench-basic': { mode: 'bolt', name: '校准点射', detail: '点击快速点射；每第 4 次点击追加三向扇射。', clickCooldown: 210, color: 0x65e8ff },
  'wrench-green': { mode: 'chain', name: '回流链束', detail: '命中后跳转附近目标，适合清理聚集污染。', clickCooldown: 245, color: 0x78f0a4 },
  'wrench-blue': { mode: 'sigil', name: '绝缘法阵', detail: '点击指定位置布置延迟范围净化阵。', clickCooldown: 500, color: 0x8a9dff },
  'wrench-gold': { mode: 'hybrid', name: '闭环混合武装', detail: '点击交替释放高速弹体与小型法阵。', clickCooldown: 330, color: 0xffd86a },
  'wrench-prism': { mode: 'prism', name: '分色棱镜', detail: '每次点击发射三色扇形弹，近距离覆盖更强。', clickCooldown: 255, color: 0xffb347 },
  'wrench-swarm': { mode: 'swarm', name: '维修蜂群', detail: '连续点击派出三枚追踪微型维修机。', clickCooldown: 225, color: 0xff7fa8 },
  'wrench-anchor': { mode: 'anchor', name: '潮汐锚场', detail: '点击投放大范围减速锚场，蓄势后造成重击。', clickCooldown: 680, color: 0x4fa6ff },
  'wrench-shear': { mode: 'shear', name: '弧光切割', detail: '点击朝指针方向快速挥出近身扇形电弧。', clickCooldown: 165, color: 0xc77dff },
}

export const equipmentSets: Record<EquipmentSetId, {
  name: string
  color: string
  twoPiece: string
  fourPiece: string
  twoModifiers: Partial<CombatStats>
  fourModifiers: Partial<CombatStats>
}> = {
  city: { name: '城市巡检', color: '#55e5ee', twoPiece: '移动速度 +8', fourPiece: '净化强度 +2、弱点率 +3%', twoModifiers: { moveSpeed: 8 }, fourModifiers: { attack: 2, critChance: .03 } },
  river: { name: '水岸回流', color: '#74e89c', twoPiece: '吸附范围 +8%', fourPiece: '污染防护 +6%、价值保留 +5%', twoModifiers: { aimAssist: .08 }, fourModifiers: { pollutionGuard: .06, valueGain: .05 } },
  insulation: { name: '绝缘净化', color: '#72aaff', twoPiece: '技能循环 +7%', fourPiece: '生命 +12、攻速 +8%', twoModifiers: { cooldownRate: .07 }, fourModifiers: { maxHp: 12, attackSpeed: .08 } },
  prototype: { name: '闭环原型', color: '#ffd568', twoPiece: '价值保留 +8%', fourPiece: '净化强度 +3、污染防护 +8%', twoModifiers: { valueGain: .08 }, fourModifiers: { attack: 3, pollutionGuard: .08 } },
}

export const getWeaponBehavior = (weaponId: string) => weaponBehaviors[weaponId] ?? weaponBehaviors['wrench-basic']
