import type { AdventureDefinition, Collectible, EquipmentItem } from '../types'
import { assetUrl } from '../utils/assets'

const legacy = assetUrl('art/legacy')

const baseAdventures: AdventureDefinition[] = [
  {
    id: 'lujiazui-circuit', name: '陆家嘴·失控电流', subtitle: '上海首发行动', location: '浦东新区 · 陆家嘴环线', wasteType: 'electronic', icon: '⚡', accent: '#41e7ff',
    background: `${legacy}/generated/bg_electronic.png`, available: true,
    briefing: '一批被错误混投的电子设备在高湿环境下形成污染外壳。切断能量、隔离电池，再找回仍可利用的稳定原型。',
    lesson: ['废旧电器应交给正规回收渠道', '含电池设备先断电，避免挤压和穿刺', '清除个人数据后再流转设备'],
    boss: '失控锂芯兽', prototype: '陆家嘴·稳定锂芯原型',
  },
  {
    id: 'suzhou-plastic', name: '苏州河·塑潮回声', subtitle: '水岸净化行动', location: '普陀区 · 苏州河生态段', wasteType: 'plastic', icon: '≈', accent: '#3cc9ff',
    background: `${legacy}/generated/bg_plastic.png`, available: true,
    briefing: '漂浮塑料在河道节点聚合成微塑潮。先清空残液、按材质分离，再压缩洁净材料，避免二次污染。',
    lesson: ['可回收物需保持适度清洁干燥', '不同塑料并非都能进入同一条回收线', '减量和重复使用优先于一次性回收'],
    boss: '微塑潮汐兽', prototype: '苏州河·澄净树脂原型',
  },
  {
    id: 'yangpu-paper', name: '杨浦·潮纸档案', subtitle: '城市记忆行动', location: '杨浦滨江 · 旧仓库群', wasteType: 'paper', icon: '▤', accent: '#ffd86b',
    background: `${legacy}/generated/bg_paper.png`, available: true,
    briefing: '雨水和油污让成片纸材失去价值。维持干燥、去除胶带与异物，抢救还能进入再生流程的纤维。',
    lesson: ['被油污严重污染的纸张不宜混入可回收物', '纸箱应拆平、保持干燥', '胶带和塑料覆膜会增加再生难度'],
    boss: '湿纸堡垒', prototype: '杨浦·再生纤维原型',
  },
  {
    id: 'changning-textile', name: '长宁·衣物流转站', subtitle: '织物新生行动', location: '长宁区 · 社区更新带', wasteType: 'textile', icon: '✦', accent: '#ff78ad',
    background: `${legacy}/generated/bg_textile.png`, available: true,
    briefing: '快速淘汰的衣物挤满流转站。优先修补、交换和捐赠，确实无法继续使用的部分再按纤维进入再生。',
    lesson: ['能继续穿的衣物优先延长使用寿命', '捐赠前应清洁并确认接收要求', '混纺面料比单一纤维更难回收'],
    boss: '快时尚拼接兽', prototype: '长宁·循环织物原型',
  },
  {
    id: 'heixushan-future', name: '黑独山·风蚀遗物', subtitle: '区域资料筹备中', location: '青海 · 黑独山', wasteType: 'electronic', icon: '◆', accent: '#b7a5ff',
    background: `${legacy}/generated/arena.png`, available: false,
    briefing: '脆弱地貌中的遗留物需要完全不同的行动边界：不把“清理”变成新的打扰。该场景将在后续区域资料核验后开放。',
    lesson: ['尊重脆弱地貌与管理边界', '不擅自搬动不明遗留物', '以正规组织和在地规则为准'],
    boss: '风蚀污染壳', prototype: '黑独山·风痕原型',
  },
]

const extraAdventures: AdventureDefinition[] = [
  { id: 'hongqiao-event', name: '虹桥·撤展倒计时', subtitle: '公益展会复合行动', location: '闵行区 · 虹桥会展带', wasteType: 'plastic', icon: '▦', accent: '#ff9b5e', background: assetUrl('art/scenes/event-hall.png'), available: true, briefing: '闭馆前一小时，餐区包装、喷绘物料和电子体验设备同时回流。先稳住人流与危险物，再让可复用展具进入下一场活动。', lesson: ['公益活动自身也要为物料负责', '纸塑复合包装以现场专项标识为准', '展具应在设计与合同阶段预设去向'], boss: '一次性巨幕兽', prototype: '虹桥·周转展具原型' },
  { id: 'lingang-logistics', name: '临港·逆向物流线', subtitle: '材料护送行动', location: '浦东新区 · 临港物流中心', wasteType: 'plastic', icon: '⇢', accent: '#68d6ff', background: assetUrl('art/scenes/logistics-terminal.png'), available: true, briefing: '清洁缠绕膜与周转箱等待返程车，混装、雨水和错误交接正在让价值快速下降。你需要护送材料，而不是只清空仓库。', lesson: ['单一清洁材料更容易稳定再生', '逆向物流要与真实返程容量衔接', '交接记录让去向可以核验'], boss: '混装吞运体', prototype: '临港·透明物流原型' },
  { id: 'chongming-ecology', name: '崇明·风散边界', subtitle: '生态区域控制行动', location: '崇明区 · 社区农园', wasteType: 'plastic', icon: '≈', accent: '#75eda0', background: `${legacy}/generated/bg_plastic.png`, available: true, briefing: '轻薄膜材在大风中越过围栏。阻止逸散、保护人员与作物，并为园区建立季节性收集节点。', lesson: ['轻薄塑料应防止逸散', '不以露天焚烧缩小体积', '生产场景需要专门管理与回收安排'], boss: '风膜群落', prototype: '崇明·定风薄膜原型' },
  { id: 'campus-lab', name: '校园·维修实验课', subtitle: '诊断与风险隔离行动', location: '杨浦区 · 校园实验楼', wasteType: 'electronic', icon: '⌁', accent: '#aa91ff', background: assetUrl('art/scenes/repair-campus.png'), available: true, briefing: '故障玩具、旧灯管和未擦除数据的平板同时进入实验楼。先识别哪些能修、哪些必须停止普通操作。', lesson: ['故障不等于报废', '危险维修有明确边界', '易破损有害垃圾需轻放并妥善包裹'], boss: '误诊拼装兽', prototype: '校园·维修判断原型' },
  { id: 'mall-foodcourt', name: '五角场·午间分流', subtitle: '高峰分类行动', location: '杨浦区 · 商场餐区', wasteType: 'paper', icon: '▤', accent: '#ffd65a', background: `${legacy}/generated/market.png`, available: true, briefing: '餐区高峰让餐余、纸杯、餐盒和饮料瓶黏成一团。通过分离台、现场标识与人流引导守住批次纯度。', lesson: ['湿垃圾与包装先分离', '餐盒等专项回收取决于区域条件', '正确动线能降低每个人的判断负担'], boss: '油渍混投王', prototype: '五角场·清洁分流原型' },
  { id: 'public-exhibition', name: '世博园·闭环公众日', subtitle: '四类材料终局预演', location: '浦东新区 · 公益活动现场', wasteType: 'textile', icon: '◆', accent: '#ff78ad', background: assetUrl('art/scenes/event-hall.png'), available: true, briefing: '四类物料与数百名玩家同时进入现场。你要在安全、教育、流畅度和现实奖励之间完成一次公开可复盘的系统行动。', lesson: ['按风险和价值而不是曝光度分配资源', '实体奖励应按需生产并公开材料去向', '数字护照与实物兑换可以互补'], boss: '公益幻象壳', prototype: '世博园·城市闭环原型' },
]

const modeByRoute: Record<string, NonNullable<AdventureDefinition['modes']>> = {
  'lujiazui-circuit': ['hazard-isolation', 'repair-bench', 'branch-expedition'], 'suzhou-plastic': ['pollution-control', 'eco-mechanism', 'material-escort'],
  'yangpu-paper': ['material-escort', 'sorting-line', 'passport-hunt'], 'changning-textile': ['repair-bench', 'npc-commission', 'passport-hunt'],
  'hongqiao-event': ['sorting-line', 'facility-defense', 'npc-commission'], 'lingang-logistics': ['material-escort', 'eco-mechanism', 'facility-defense'],
  'chongming-ecology': ['pollution-control', 'eco-mechanism', 'passport-hunt'], 'campus-lab': ['repair-bench', 'hazard-isolation', 'npc-commission'],
  'mall-foodcourt': ['sorting-line', 'pollution-control', 'facility-defense'], 'public-exhibition': ['finale-operation', 'facility-defense', 'branch-expedition'],
  'heixushan-future': ['passport-hunt', 'npc-commission', 'branch-expedition'],
}

const buildRouteNodes = (route: AdventureDefinition): NonNullable<AdventureDefinition['routeNodes']> => [
  { id: `${route.id}-story`, name: '现场证词', kind: 'story', description: '先听物品与当事人说完，获得一条风险证据。' },
  { id: `${route.id}-skill`, name: '系统节点', kind: 'skill', description: '调用本区域专属玩法，改变污染与材料价值。' },
  { id: `${route.id}-combat`, name: '污染压制', kind: 'combat', description: '移动、蓄力与定向技能净化游离污染体。' },
  { id: `${route.id}-rest`, name: '维修整备', kind: 'rest', description: '根据前面判断选择本局构筑，不固定为纯伤害升级。' },
  { id: `${route.id}-boss`, name: route.boss, kind: 'boss', description: `用证据击破污染外壳，回收${route.prototype}。` },
]

export const adventures: AdventureDefinition[] = [...baseAdventures, ...extraAdventures].map((route) => ({ ...route, chapter: route.id === 'heixushan-future' ? '未来区域' : '上海首发篇', modes: modeByRoute[route.id], routeNodes: buildRouteNodes(route) }))

export const equipment: EquipmentItem[] = [
  { id: 'wrench-basic', name: '现场校准器', slot: 'weapon', rarity: '普通', setId: 'city', setName: '城市巡检', weaponMode: 'bolt', description: '可靠的近未来巡检工具，以高频手动点射修正污染外壳。', stat: '净化 +2', power: 10, modifiers: { attack: 2 }, perk: '每第 4 次点击追加三向校准弹', icon: assetUrl('art/equipment/v2/field-calibrator.webp'), cost: 0 },
  { id: 'wrench-green', name: '回流链束器', slot: 'weapon', rarity: '精良', setId: 'river', setName: '水岸回流', weaponMode: 'chain', description: '用磁场把分散污染重新拉回可控处理链。', stat: '净化 +3 · 吸附 +10%', power: 20, modifiers: { attack: 3, aimAssist: .1 }, perk: '命中后向附近目标跳转一次', icon: assetUrl('art/equipment/v2/chain-reclaimer.webp'), cost: 140 },
  { id: 'wrench-blue', name: '绝缘脉冲罗盘', slot: 'weapon', rarity: '稀有', setId: 'insulation', setName: '绝缘净化', weaponMode: 'sigil', description: '把电子风险圈进法阵，再进行延迟范围净化。', stat: '净化 +4 · 技能循环 +10%', power: 32, modifiers: { attack: 4, cooldownRate: .1 }, perk: '点击场地布置绝缘净化阵', icon: assetUrl('art/equipment/v2/pulse-compass.webp'), cost: 260 },
  { id: 'wrench-gold', name: '闭环原型炮', slot: 'weapon', rarity: '原型', setId: 'prototype', setName: '闭环原型', weaponMode: 'hybrid', description: '在定向净化与材料保留之间自动切换工作模式。', stat: '净化 +5 · 价值 +12%', power: 46, modifiers: { attack: 5, valueGain: .12 }, perk: '点击交替释放弹体与小型法阵', icon: assetUrl('art/equipment/v2/prototype-loop.webp'), cost: 460 },
  { id: 'wrench-prism', name: '分色棱镜炮', slot: 'weapon', rarity: '精良', weaponMode: 'prism', description: '将混合目标拆成三个处理方向，适合近距离覆盖。', stat: '攻速 +10% · 弱点率 +3%', power: 20, modifiers: { attackSpeed: .1, critChance: .03 }, perk: '每次点击发射三色扇形弹', icon: assetUrl('art/equipment/v2/sorting-prism.webp'), cost: 155 },
  { id: 'wrench-swarm', name: '维修蜂群杖', slot: 'weapon', rarity: '稀有', weaponMode: 'swarm', description: '释放微型维修机主动追踪最接近指针的污染体。', stat: '攻速 +15% · 吸附 +8%', power: 32, modifiers: { attackSpeed: .15, aimAssist: .08 }, perk: '连续点击派出三枚追踪维修机', icon: assetUrl('art/equipment/v2/repair-swarm.webp'), cost: 275 },
  { id: 'wrench-anchor', name: '潮汐锚定器', slot: 'weapon', rarity: '稀有', weaponMode: 'anchor', description: '牺牲频率换取大范围控制，稳住扩散中的污染。', stat: '净化 +4 · 污染防护 +6%', power: 32, modifiers: { attack: 4, pollutionGuard: .06 }, perk: '点击投放大范围减速重击锚场', icon: assetUrl('art/equipment/v2/tidal-anchor.webp'), cost: 290 },
  { id: 'wrench-shear', name: '弧光切割钳', slot: 'weapon', rarity: '原型', weaponMode: 'shear', description: '用极短点击间隔切开近身污染外壳，风险与收益并存。', stat: '攻速 +22% · 弱点率 +8%', power: 46, modifiers: { attackSpeed: .22, critChance: .08 }, perk: '朝指针方向挥出高速近身扇形电弧', icon: assetUrl('art/equipment/v2/arc-shear.webp'), cost: 440 },
  { id: 'helmet-basic', name: '巡检感知盔', slot: 'helmet', rarity: '普通', setId: 'city', setName: '城市巡检', description: '扫描灯标出道路风险与污染薄弱点。', stat: '弱点率 +3%', power: 10, modifiers: { critChance: .03 }, icon: assetUrl('art/equipment/v2/city-helmet.webp'), cost: 0 },
  { id: 'helmet-green', name: '水岸流向盔', slot: 'helmet', rarity: '精良', setId: 'river', setName: '水岸回流', description: '同步显示水岸流向、接收点与材料去路。', stat: '弱点率 +4% · 吸附 +6%', power: 20, modifiers: { critChance: .04, aimAssist: .06 }, icon: assetUrl('art/equipment/v2/river-helmet.webp'), cost: 125 },
  { id: 'helmet-blue', name: '绝缘弧盾盔', slot: 'helmet', rarity: '稀有', setId: 'insulation', setName: '绝缘净化', description: '在电弧形成前给出清晰预警，并锁定高风险节点。', stat: '弱点率 +7% · 价值 +5%', power: 32, modifiers: { critChance: .07, valueGain: .05 }, icon: assetUrl('art/equipment/v2/insulation-helmet.webp'), cost: 235 },
  { id: 'helmet-gold', name: '闭环光晕盔', slot: 'helmet', rarity: '原型', setId: 'prototype', setName: '闭环原型', description: '同时读取污染外壳与内部稳定原型的状态。', stat: '弱点率 +8% · 价值 +8%', power: 46, modifiers: { critChance: .08, valueGain: .08 }, icon: assetUrl('art/equipment/v2/prototype-helmet.webp'), cost: 390 },
  { id: 'armor-basic', name: '巡检机能服', slot: 'armor', rarity: '普通', setId: 'city', setName: '城市巡检', description: '反光条与模块化工具位让现场行动更可靠。', stat: '生命 +10', power: 10, modifiers: { maxHp: 10 }, icon: assetUrl('art/equipment/v2/city-armor.webp'), cost: 0 },
  { id: 'armor-green', name: '水岸回收服', slot: 'armor', rarity: '精良', setId: 'river', setName: '水岸回流', description: '再生织物与轻量浮力层兼顾防护和移动。', stat: '生命 +16 · 移速 +5', power: 20, modifiers: { maxHp: 16, moveSpeed: 5 }, icon: assetUrl('art/equipment/v2/river-armor.webp'), cost: 145 },
  { id: 'armor-blue', name: '绝缘电容甲', slot: 'armor', rarity: '稀有', setId: 'insulation', setName: '绝缘净化', description: '分层绝缘板将冲击导向可控的泄能模块。', stat: '生命 +20 · 技能循环 +7%', power: 32, modifiers: { maxHp: 20, cooldownRate: .07 }, icon: assetUrl('art/equipment/v2/insulation-armor.webp'), cost: 255 },
  { id: 'armor-gold', name: '闭环原型甲', slot: 'armor', rarity: '原型', setId: 'prototype', setName: '闭环原型', description: '再生复合板围绕环形核心循环分配防护能量。', stat: '生命 +24 · 污染防护 +10%', power: 46, modifiers: { maxHp: 24, pollutionGuard: .1 }, icon: assetUrl('art/equipment/v2/prototype-armor.webp'), cost: 410 },
  { id: 'boots-basic', name: '巡检防滑靴', slot: 'boots', rarity: '普通', setId: 'city', setName: '城市巡检', description: '强化鞋头与防滑底适应复杂活动现场。', stat: '移速 +10', power: 10, modifiers: { moveSpeed: 10 }, icon: assetUrl('art/equipment/v2/city-boots.webp'), cost: 0 },
  { id: 'boots-green', name: '水岸涉流靴', slot: 'boots', rarity: '精良', setId: 'river', setName: '水岸回流', description: '湿地抓地结构减少在水岸污染区的移动损失。', stat: '移速 +14 · 技能循环 +5%', power: 20, modifiers: { moveSpeed: 14, cooldownRate: .05 }, icon: assetUrl('art/equipment/v2/river-boots.webp'), cost: 135 },
  { id: 'boots-blue', name: '绝缘脉冲靴', slot: 'boots', rarity: '稀有', setId: 'insulation', setName: '绝缘净化', description: '线圈鞋跟在冲刺时提供短促稳定的绝缘推力。', stat: '移速 +20 · 污染防护 +5%', power: 32, modifiers: { moveSpeed: 20, pollutionGuard: .05 }, icon: assetUrl('art/equipment/v2/insulation-boots.webp'), cost: 245 },
  { id: 'boots-gold', name: '闭环无痕靴', slot: 'boots', rarity: '原型', setId: 'prototype', setName: '闭环原型', description: '悬浮鞋底避免把污染带出作业边界。', stat: '移速 +24 · 价值 +6%', power: 46, modifiers: { moveSpeed: 24, valueGain: .06 }, icon: assetUrl('art/equipment/v2/prototype-boots.webp'), cost: 385 },
]

const portrait = (name: string) => name === 'bluecat' ? assetUrl('art/characters/loop-guide.png') : `${legacy}/sprites/char_${name}.png`
const souvenir = (type: string, index: number) => `${legacy}/themes/${type}_souvenir_${index}.png`

const baseCollectibles: Collectible[] = [
  { id: 'battery', name: '鼓包电池', type: 'electronic', source: '陆家嘴·失控电流', portrait: portrait('battery'), rarity: '常见', summary: '我不是普通垃圾，挤压和穿刺都可能让我失控。', before: '被随手塞进混合垃圾后，我在潮湿与挤压中逐渐发热。', action: '保持完整并单独存放，交给正规回收渠道；设备先断电。', after: '经过安全放电与专业处理，金属材料重新进入合规流程。' },
  { id: 'phone', name: '旧手机', type: 'electronic', source: '陆家嘴·失控电流', portrait: portrait('phone'), rarity: '珍贵', summary: '别急着拆开我，数据安全和再使用都值得先考虑。', before: '屏幕碎了，但许多部件仍能工作，里面还有未清除的数据。', action: '备份并清除数据，优先维修或官方回收，不交给无资质拆解。', after: '整机翻新优先于材料回收；无法修复时再规范拆解。' },
  { id: 'circuit', name: '服务器板卡', type: 'electronic', source: '陆家嘴·失控电流', portrait: souvenir('electronic', 0), rarity: '稀有', summary: '我的价值藏在精密部件里，也藏着处理不当的风险。', before: '从机房退役后混在杂物中，连接器和芯片仍有利用价值。', action: '建立资产清单，数据擦除后分级检测，优先备件再利用。', after: '可用部件成为备件，剩余部分进入专业金属回收。' },
  { id: 'bottle', name: '饮料瓶', type: 'plastic', source: '苏州河·塑潮回声', portrait: portrait('bottle'), rarity: '常见', summary: '给我倒空、简单清洁，我才不会污染整袋材料。', before: '残液和吸管留在瓶中，沿途沾染了其他可回收物。', action: '倒空内容物，按当地要求简单清洁，瓶身与杂物分开。', after: '洁净单一的材料更容易被识别和稳定再生。' },
  { id: 'plastic-shell', name: '外卖餐盒', type: 'plastic', source: '苏州河·塑潮回声', portrait: souvenir('plastic', 1), rarity: '少见', summary: '不是所有“塑料”都能在同一条线上被回收。', before: '油污、餐余和不同材质叠在一起，让分选变得困难。', action: '先减量复用；投放时去除残余，并遵循上海本地分类要求。', after: '符合条件的洁净材料进入再生，无法回收的部分妥善处置。' },
  { id: 'paper-box', name: '快递纸箱', type: 'paper', source: '杨浦·潮纸档案', portrait: portrait('box'), rarity: '常见', summary: '拆平并保持干燥，我就能节省运输空间并保住纤维。', before: '完整箱体占据大量空间，胶带和填充物仍黏在上面。', action: '取出填充物、撕除明显胶带、拆平后保持干燥。', after: '更高效的收运和更纯净的纸浆，让纤维继续循环。' },
  { id: 'receipt', name: '热敏小票', type: 'paper', source: '杨浦·潮纸档案', portrait: souvenir('paper', 2), rarity: '少见', summary: '看起来像纸，不代表一定适合混入废纸回收。', before: '特殊涂层使我与普通办公纸的处理条件不同。', action: '减少不必要打印，投放遵循上海当前指引和现场标识。', after: '从源头减量，比把所有纸都假设为可回收更可靠。' },
  { id: 'shirt', name: '旧衬衫', type: 'textile', source: '长宁·衣物流转站', portrait: portrait('shirt'), rarity: '常见', summary: '一颗扣子掉了，不代表我的使用生命已经结束。', before: '轻微破损让我被闲置，但面料整体仍然完好。', action: '先清洁修补，再考虑交换、二手流转或符合要求的捐赠。', after: '延长使用寿命通常比立即打碎成纤维保留更多价值。' },
  { id: 'blend-fabric', name: '混纺运动衣', type: 'textile', source: '长宁·衣物流转站', portrait: souvenir('textile', 3), rarity: '珍贵', summary: '舒适来自多种纤维，也让我的再生更复杂。', before: '不同纤维紧密混合，普通机械回收难以彻底分离。', action: '延长穿着、修补和转售；购买时关注耐用性和可维护性。', after: '只有在无法继续使用后，才进入适配的专业再生路径。' },
  { id: 'lujiazui-core', name: '稳定锂芯原型', type: 'electronic', source: '失控锂芯兽', portrait: souvenir('electronic', 2), rarity: '原型', summary: '污染只是我的外壳，规范处置让价值重新显现。', before: '危险混投将我包裹成失控污染壳。', action: '战斗中切断能量、隔离风险，并完成正确流转判断。', after: '稳定原型被记录，可用于活动纪念章或模型兑换凭证。' },
  { id: 'suzhou-core', name: '澄净树脂原型', type: 'plastic', source: '微塑潮汐兽', portrait: souvenir('plastic', 4), rarity: '原型', summary: '洁净和分材，是我重新成为材料的门票。', before: '残液和混材让我变成难以处理的污染潮。', action: '清空、分离、压缩，并让减量优先于回收。', after: '稳定树脂原型可作为现实奖励的数字凭证。' },
  { id: 'yangpu-core', name: '再生纤维原型', type: 'paper', source: '湿纸堡垒', portrait: souvenir('paper', 5), rarity: '原型', summary: '干燥、去杂和压平，让纤维价值留下来。', before: '水分、油污和胶带把纸材封成沉重堡垒。', action: '阻断污染源，再按处理顺序净化材料。', after: '被抢救的纤维成为城市记忆原型。' },
  { id: 'changning-core', name: '循环织物原型', type: 'textile', source: '快时尚拼接兽', portrait: souvenir('textile', 6), rarity: '原型', summary: '最好的回收，有时是继续被使用。', before: '过度购买和快速淘汰把衣物缝成巨大的污染壳。', action: '修补、交换、捐赠、再设计，最后才是材料再生。', after: '循环织物原型记录了一次价值保留行动。' },
  { id: 'hongqiao-event-core', name: '周转展具原型', type: 'plastic', source: '一次性巨幕兽', portrait: souvenir('plastic', 6), rarity: '原型', summary: '活动物料的去向，应在搭建之前就被设计。', before: '短期喷绘、包装和展具在撤展时叠成一次性外壳。', action: '提前登记、拆分、回仓并为可复用模块匹配下一场活动。', after: '周转展具原型记录了从采购到撤场的完整责任链。' },
  { id: 'lingang-logistics-core', name: '透明物流原型', type: 'plastic', source: '混装吞运体', portrait: souvenir('plastic', 7), rarity: '原型', summary: '正确分类以后，还需要可靠的返程与交接。', before: '清洁膜材和周转箱因雨水、混装与错单失去价值。', action: '按材料特性选择路线、防护与接收点，并如实记录损耗。', after: '透明物流原型让每一次去向都可以被核验。' },
  { id: 'chongming-ecology-core', name: '定风薄膜原型', type: 'plastic', source: '风膜群落', portrait: souvenir('plastic', 5), rarity: '原型', summary: '轻质材料的第一条边界，是不让它离开管理区域。', before: '薄膜被大风带出围栏，在作物与水体之间扩散。', action: '先阻断逸散，再建立与季节用量匹配的收集和交接节点。', after: '定风薄膜原型记录了一套源头防逸散方案。' },
  { id: 'campus-lab-core', name: '维修判断原型', type: 'electronic', source: '误诊拼装兽', portrait: souvenir('electronic', 1), rarity: '原型', summary: '会修不只是会拆，更是知道何时停止。', before: '故障设备、破损灯管和数据载体被同一种“动手欲”包围。', action: '先诊断、安全隔离和处理数据，再选择维修或正规退役。', after: '维修判断原型保存了最小干预与安全边界。' },
  { id: 'mall-foodcourt-core', name: '清洁分流原型', type: 'paper', source: '油渍混投王', portrait: souvenir('paper', 6), rarity: '原型', summary: '好的动线能让正确选择变得更容易。', before: '餐余、纸杯、餐盒和饮料瓶在高峰人流中黏成混投外壳。', action: '通过倒液、拆分、清晰标识与满载管理保护批次纯度。', after: '清洁分流原型记录了人员、容器与收运共同工作的结果。' },
  { id: 'public-exhibition-core', name: '城市闭环原型', type: 'textile', source: '公益幻象壳', portrait: souvenir('textile', 7), rarity: '原型', summary: '公益奖励本身也要经得起材料与去向的追问。', before: '活动为了传播环保而制造新的无计划物料，形成公益幻象。', action: '按风险分流现场物料，用数字护照和按需兑换连接真实行动。', after: '城市闭环原型成为可复盘、可兑现但不过度生产的纪念凭证。' },
]

const addedCollectibles: Collectible[] = [
  { id: 'earphone-module', name: '可修耳机模组', type: 'electronic', source: '人民广场 · 地铁服务点', portrait: souvenir('electronic', 1), rarity: '少见', summary: '先确认物权与故障，体积小也不能随意混投。', before: '一侧失声让我被遗忘在失物箱，接口与线材仍可能修复。', action: '完成失物流程后检测，优先清洁维修，含电池部分规范流转。', after: '可用耳机重返使用，其余部件留下清楚交接记录。', unlockStory: 'e04-earphone-knot', unlockHint: '完成剧场《耳机线打成的结》' },
  { id: 'cartridge-passport', name: '耗材回收护照', type: 'electronic', source: '虹桥 · 会展办公区', portrait: souvenir('electronic', 0), rarity: '稀有', summary: '采购、使用与回收服务，应该写在同一张记录上。', before: '残余粉末与外壳被当成普通塑料，采购方也忘了供应商回收约定。', action: '保留包装、避免扬尘，按单位专项渠道移交并核验回执。', after: '耗材流向可追踪，下一次采购也加入减量条件。', unlockStory: 'e07-printer-cartridge', unlockHint: '完成剧场《打印室的黑色指纹》' },
  { id: 'repair-toy-motor', name: '玩具维修电机', type: 'electronic', source: '浦东 · 社区亲子中心', portrait: souvenir('electronic', 1), rarity: '珍贵', summary: '一次卡住不等于寿命终点，安全检查让维修发生。', before: '车轮被线头缠住，整车险些连同电池一起丢弃。', action: '由工作人员断电排查，去除缠绕并完成安全复检。', after: '电机继续工作，玩具多了一张维护生日卡。', unlockStory: 'e08-toy-battery', unlockHint: '完成剧场《玩具车停在斑马线》' },
  { id: 'dujiangyan-monitor', name: '协同流量仪', type: 'electronic', source: '四川 · 宝瓶口研学站', portrait: souvenir('electronic', 2), rarity: '珍贵', summary: '我不替人决定答案，只把上下游后果同时照亮。', before: '单项奖励诱使玩家把全部水量交给眼前的一方。', action: '比较水情、需求与余量，小步调节并设置复核点。', after: '仪表增加影响对象与交班记录，支持多目标判断。', unlockStory: 'd04-water-allocation', unlockHint: '完成都江堰篇《同一股水，三封来信》' },
  { id: 'river-lid-sample', name: '异材瓶盖样本', type: 'plastic', source: '苏州河 · 水岸补给点', portrait: souvenir('plastic', 0), rarity: '少见', summary: '外形相似，不代表我能和瓶身走同一条路线。', before: '瓶盖、吸管与残液混在瓶中，让分选判断失真。', action: '倒空并按现场要求拆分，不用“都是塑料”代替识别。', after: '样本成为活动现场的材质差异教学件。', unlockStory: 'p03-coffee-lid', unlockHint: '完成剧场《杯盖上的小数字》' },
  { id: 'event-banner-tab', name: '可拆展布接片', type: 'plastic', source: '虹桥 · 会展撤场', portrait: souvenir('plastic', 2), rarity: '稀有', summary: '撤场不是结尾，接口决定我能不能进入下一场。', before: '写死日期的大幅物料，在短暂展示后失去用途。', action: '拆开通用底材与信息层，记录尺寸、材质和周转次数。', after: '通用接片回仓，下一场只更换小面积信息。', unlockStory: 'p07-event-banner', unlockHint: '完成剧场《撤展后的大画面》' },
  { id: 'wind-film-clip', name: '定风膜夹', type: 'plastic', source: '崇明 · 农业设施带', portrait: souvenir('plastic', 3), rarity: '珍贵', summary: '最有效的清理，是先不让我被风带走。', before: '轻薄膜材从露天堆放处逸散，追赶回收扩大了作业范围。', action: '源头固定、封闭暂存，再按季节用量配置回收节点。', after: '膜夹与交接袋组成一套可复用防逸散工具。', unlockStory: 'p08-agricultural-film', unlockHint: '完成剧场《风起之前收好薄膜》' },
  { id: 'rain-model-channel', name: '雨后水流模型', type: 'plastic', source: '四川 · 都江堰数字研学馆', portrait: souvenir('plastic', 4), rarity: '珍贵', summary: '保留变化，模型才不是一件永远正确的摆设。', before: '演示者想清空雨后沉积，恢复唯一的标准画面。', action: '保存数据、重新标定，使用可替换零件呈现多种水情。', after: '同一模型支持旱季、常水与洪水三套研学情境。', unlockStory: 'd05-model-after-rain', unlockHint: '完成都江堰篇《一场雨后的沙盘》' },
  { id: 'box-address-shield', name: '面单遮码卡', type: 'paper', source: '闵行 · 社区快递站', portrait: souvenir('paper', 0), rarity: '少见', summary: '保护隐私，也是纸箱进入下一站前的一部分。', before: '姓名、电话和住址随纸箱暴露在公共回收区域。', action: '遮盖个人信息，拆分明显异物并把箱体压平。', after: '遮码工具成为快递站拆箱台的固定服务。', unlockStory: 'r08-courier-label', unlockHint: '完成剧场《纸箱上的住址》' },
  { id: 'draft-notebook', name: '背面草稿本', type: 'paper', source: '杨浦 · 中学教室', portrait: souvenir('paper', 1), rarity: '少见', summary: '复用之前先排除敏感信息，节约不应制造暴露。', before: '大量单面试卷尚有空白，却混有姓名和成绩。', action: '由教师分检无敏感内容的纸张，裁切装订后使用。', after: '安全纸张成为草稿本，总打印量也进入班级指标。', unlockStory: 'r09-exam-papers', unlockHint: '完成剧场《试卷背面的空白》' },
  { id: 'location-note-card', name: '边界观察卡', type: 'paper', source: '青海 · 黑独山资料站', portrait: souvenir('paper', 3), rarity: '稀有', summary: '留下准确位置，不代表要亲自越线抵达。', before: '遗落物位于管理线外，热心行动可能留下更持久痕迹。', action: '远距离观察、记录位置并交给有权限的现场人员。', after: '“零越线”成为可核验的行动成果。', unlockStory: 'r10-black-rock-notebook', unlockHint: '完成剧场《风里的一页记录》' },
  { id: 'maintenance-logbook', name: '双源交班本', type: 'paper', source: '四川 · 灌区维护站', portrait: souvenir('paper', 4), rarity: '珍贵', summary: '经验写下来，系统才不会在换班时失忆。', before: '一次水位跳变只有口头提醒，没有时间、点位和操作记录。', action: '补全结构化记录，冲突资料保留来源并注明修订理由。', after: '两次异常得以互相印证，待复核事项清楚传递。', unlockStory: 'd06-maintenance-handover', unlockHint: '完成都江堰篇《交班本上的空白水位》' },
  { id: 'uniform-extension', name: '校服成长缝份', type: 'textile', source: '杨浦 · 校园缝纫角', portrait: souvenir('textile', 0), rarity: '少见', summary: '多留一厘米，就可能多穿一个学期。', before: '几乎全新的校服因为裤脚稍短进入淘汰箱。', action: '检查状态，放长缝份或进入尊重隐私的尺码交换。', after: '可调设计与统一清洁让校服跨学年继续使用。', unlockStory: 't04-school-uniform', unlockHint: '完成剧场《校服长高计划》' },
  { id: 'costume-fastener', name: '舞台角色扣', type: 'textile', source: '黄浦 · 社区剧场', portrait: souvenir('textile', 1), rarity: '稀有', summary: '换下一个名字，我还能在下一出戏里登场。', before: '角色名称永久缝在复杂服装上，谢幕后难以复用。', action: '保留通用底衣，用可拆组件表达角色并记录维护状态。', after: '共享衣橱按尺寸与部件索引，减少重复制作。', unlockStory: 't05-stage-costume', unlockHint: '完成剧场《谢幕后不散场》' },
  { id: 'linen-repair-tag', name: '布草返修标', type: 'textile', source: '虹桥 · 会展酒店', portrait: souvenir('textile', 2), rarity: '珍贵', summary: '卫生与强度合格时，一段开线可以被修好。', before: '局部线缝松脱，让整件布草被直接判为报废。', action: '按专业标准检查、返修、复检，并记录洗涤使用次数。', after: '维修等级把安全要求与材料延寿同时留下。', unlockStory: 't06-hotel-linen', unlockHint: '完成剧场《床单边缘的第二条线》' },
  { id: 'windproof-carrybag', name: '无痕周转袋', type: 'textile', source: '青海 · 黑独山活动集合点', portrait: souvenir('textile', 4), rarity: '珍贵', summary: '出发前管好自己的物资，比越线追赶更重要。', before: '活动轻薄包装在强风中逸散，清单却没有封闭容器。', action: '减少物资、分组封装，设置责任人与撤场逐件核验。', after: '活动以逸散为零、越线为零完成，周转袋继续使用。', unlockStory: 'h06-windproof-kit', unlockHint: '完成黑独山篇《出发前少带的一只袋子》' },
]

export const collectibles: Collectible[] = [...baseCollectibles, ...addedCollectibles]

const legacyStories = [
  {
    id: 'battery-night', title: '电池没有睡着', subtitle: '一次发生在写字楼回收间的深夜对话', location: '陆家嘴 · 地下回收间', duration: '约 2 分钟', type: 'electronic', cover: `${legacy}/generated/lab.png`,
    beats: [
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '巡检灯在凌晨两点闪了三次。回收间里没有风，一只鼓包电池却在塑料袋里轻轻响。别急着靠近，先观察周围。' },
      { speaker: '鼓包电池', portrait: portrait('battery'), text: '我以前住在一台平板里。主人觉得续航变差，就把我和纸杯、钥匙、硬币一起扔进袋子。硬币碰到触点，我开始发热。' },
      { speaker: '玩家', text: '你准备怎么处理眼前的风险？', choices: [
        { text: '戴好防护，停止挤压并联系场地方专业人员', reply: '对。未知状态的鼓包电池不适合由普通玩家自行拆解或搬运。先隔离人群，再交给专业人员。', insight: '风险控制优先' },
        { text: '把电池扎破，让里面的气体跑掉', reply: '千万不要。穿刺可能引发短路、起火和有害物质泄漏。', insight: '不可穿刺' },
        { text: '用水冲凉以后继续扔回袋子', reply: '这会增加新的风险，也没有解决混投和短路问题。', insight: '不要自行冲洗' },
      ] },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '我们拉起警示带并通知物业。专业人员带来合适的容器，把电池与金属物分开。真正重要的不是“勇敢地拿走它”，而是知道什么时候不该自己动手。' },
      { speaker: '鼓包电池', portrait: portrait('battery'), text: '我并不想成为怪物。错误的存放方式才是污染外壳。只要停止挤压、隔离触点并进入正规渠道，里面的材料仍有机会被妥善处理。' },
      { speaker: '玩家', text: '如果一台旧手机还能开机，你会先做什么？', choices: [
        { text: '备份并清除个人数据，再判断维修、转赠或正规回收', reply: '这条顺序同时照顾了数据安全和物品价值。', insight: '数据安全＋再使用优先' },
        { text: '立刻砸碎，方便取出里面的金属', reply: '非专业拆解既危险，也会让可继续使用的整机价值消失。', insight: '整机价值优先' },
      ] },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '天亮时，回收间恢复安静。你在行动记录上写下：电子废弃物不是“越快扔掉越好”，而是要断电、护数据、辨风险、走正规渠道。' },
    ],
  },
  {
    id: 'bottle-river', title: '瓶子想去哪里', subtitle: '苏州河边，一只饮料瓶的三条岔路', location: '苏州河 · 亲水步道', duration: '约 2 分钟', type: 'plastic', cover: `${legacy}/generated/bg_plastic.png`,
    beats: [
      { speaker: '饮料瓶', portrait: portrait('bottle'), text: '我从便利店出发，只用了十二分钟就被喝空。有人把我放在长椅上，以为清洁工会替我决定下一站。风一吹，我差点滚进河里。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '“可回收”不是材料天生拥有的永久身份。残液、油污、混材和当地处理能力，都会改变它接下来能不能被利用。' },
      { speaker: '玩家', text: '你捡起瓶子，第一步怎么做？', choices: [
        { text: '倒空残液，按现场标识投入可回收物容器', reply: '正确。适度清洁和正确投放能避免它污染同袋纸张。', insight: '清空＋正确投放' },
        { text: '连着半杯饮料直接投入可回收物', reply: '残液会增加运输重量，还可能污染其他材料。', insight: '保持适度清洁' },
      ] },
      { speaker: '饮料瓶', portrait: portrait('bottle'), text: '我最害怕的不是被用过，而是和所有东西黏在一起。被污染的一整袋材料，可能因为一个随手的动作失去价值。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '但也别把回收当成无限通行证。重复使用自己的水杯、减少不必要的一次性包装，往往比事后分得再准确更靠前。' },
      { speaker: '玩家', text: '面对一次性用品，你更愿意采用哪条原则？', choices: [
        { text: '能不用就不用，必须使用时再正确分类', reply: '这是“减量—复用—回收”的优先顺序。', insight: '源头减量优先' },
        { text: '只要能回收，就可以无限增加使用量', reply: '回收也消耗收运、清洗和再加工资源，不能替代减量。', insight: '回收不是免罪券' },
      ] },
      { speaker: '饮料瓶', portrait: portrait('bottle'), text: '最后我没有掉进河里。比起成为英雄纪念品，我更希望下一次，你出门时先带上一只能重复使用的水杯。' },
    ],
  },
  {
    id: 'box-rain', title: '纸箱的雨天', subtitle: '一场关于干燥、胶带和空间的仓库争论', location: '杨浦滨江 · 旧仓库', duration: '约 2 分钟', type: 'paper', cover: `${legacy}/generated/bg_paper.png`,
    beats: [
      { speaker: '快递纸箱', portrait: portrait('box'), text: '我装过一台台灯，跨过两座城市。主人拆开我，却没有拆平，只把我塞在露天回收点。那晚下雨，我像吸满水的海绵。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '纸纤维怕水，也怕油。收运空间、含水量和异物都会影响后续处理。一个简单的“拆平”，能让同一辆车带走更多材料。' },
      { speaker: '玩家', text: '在投放纸箱前，哪组动作更合适？', choices: [
        { text: '取出填充物、拆平、去除明显胶带并保持干燥', reply: '这能降低异物和体积，让纸材更适合后续流转。', insight: '拆平＋干燥＋去杂' },
        { text: '连塑料泡沫一起封好，防止东西掉出来', reply: '不同材料混在一起会把分拣压力留给下游。', insight: '先分离异物' },
      ] },
      { speaker: '快递纸箱', portrait: portrait('box'), text: '我不要求你把每一丝胶都处理得像实验室，但至少别让我抱着泡沫、塑料袋和半杯咖啡一起出发。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '规则不是一句“纸就是可回收物”就结束。热敏纸、覆膜纸、严重油污纸各有不同，现场标识和当地要求才是最后依据。' },
      { speaker: '玩家', text: '不确定一种纸制品怎么投放时，你会怎么做？', choices: [
        { text: '查看上海分类指引或现场标识，不凭外观猜', reply: '可靠的环境行动包含“知道去哪里核对”。', insight: '以本地规则为准' },
        { text: '只要能撕开就全部算可回收物', reply: '能撕开无法证明涂层、污染程度或处理路径相同。', insight: '避免单一经验判断' },
      ] },
      { speaker: '快递纸箱', portrait: portrait('box'), text: '雨停以后，蓝猫把我的故事写进展馆：价值不是材料标签，而是一连串被人维护出来的条件。' },
    ],
  },
  {
    id: 'shirt-button', title: '掉下来的纽扣', subtitle: '旧衬衫在社区交换站等待第二位主人', location: '长宁区 · 社区衣物站', duration: '约 2 分钟', type: 'textile', cover: `${legacy}/generated/market.png`,
    beats: [
      { speaker: '旧衬衫', portrait: portrait('shirt'), text: '我只少了一颗纽扣。主人站在衣柜前看了很久，最后说：“修起来太麻烦了。”于是我来到装满旧衣的袋子里。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '衣物的处理不只有“扔掉”和“回收”两格。继续穿、修补、交换、二手流转、符合要求的捐赠，都可能比打碎成纤维保留更多价值。' },
      { speaker: '玩家', text: '你会先为衬衫选择哪条路径？', choices: [
        { text: '清洁并补上纽扣，继续使用或进入二手流转', reply: '小修补延长了整件衣物的寿命，也保留了制造它已经消耗的资源。', insight: '再使用优先' },
        { text: '立刻剪碎，证明我在做回收', reply: '材料再生通常会损失一部分价值，能继续使用时不必急着降级。', insight: '避免过早降级' },
      ] },
      { speaker: '旧衬衫', portrait: portrait('shirt'), text: '捐赠也不是把不想要的东西交给别人处理。污损、潮湿或完全不能穿的衣服，不该披着“爱心”的名字增加接收方负担。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '混纺面料带来弹性和舒适，却让纤维分离更困难。购买耐用、可维护的衣物，了解接收点要求，也是循环的一部分。' },
      { speaker: '玩家', text: '整理待捐衣物时，哪项判断最重要？', choices: [
        { text: '确认清洁、可继续穿，并查看接收机构的具体要求', reply: '尊重接收者和处理能力，才是真正有效的捐赠。', insight: '合格捐赠' },
        { text: '只要装进袋子，任何状态都可以捐', reply: '这可能把处置成本转移给公益机构。', insight: '不转移负担' },
      ] },
      { speaker: '旧衬衫', portrait: portrait('shirt'), text: '第二天，我换上一颗并不完全同色的新纽扣。新主人说这像一枚小小的勋章——证明旧东西也能继续讲新的故事。' },
    ],
  },
  {
    id: 'phone-memory', title: '删除之前', subtitle: '旧手机离开主人前，最后一次确认自己的记忆', location: '陆家嘴 · 企业资产室', duration: '约 2 分钟', type: 'electronic', cover: `${legacy}/generated/lab.png`,
    beats: [
      { speaker: '旧手机', portrait: portrait('phone'), text: '我在抽屉里待了三年。相册、聊天记录、门禁凭证和旧账号都还在。今天公司准备清理设备，有人说：“反正屏幕坏了，直接卖掉吧。”' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '电子设备的流转有两条同时发生的线：物质去哪里，数据去哪里。只处理外壳，却把个人信息留在里面，并不算完整的循环。' },
      { speaker: '玩家', text: '设备还能开机，但屏幕损坏。更稳妥的第一步是？', choices: [
        { text: '建立资产记录，备份所需内容并用可靠方式清除数据', reply: '正确。先确认所有权和数据，再判断维修、翻新或正规回收。', insight: '数据流与材料流并行' },
        { text: '交给陌生买家，让对方帮忙删除', reply: '数据责任不该留给未知接收者，来源不明的拆解也可能带来风险。', insight: '先清除再流转' },
      ] },
      { speaker: '旧手机', portrait: portrait('phone'), text: '检测员接上外部屏幕，完成备份和清除。我的主板仍能工作，换一块合格屏幕就可以进入内部备用机池，不必立刻被拆成一堆材料。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '再使用保留了制造和装配已经投入的价值。只有确实无法修复、无法作为备件时，专业拆解和材料回收才成为下一层选择。' },
      { speaker: '玩家', text: '你把行动顺序写成哪一句？', choices: [{ text: '确权与数据处理 → 检测维修 → 再使用 → 合规拆解', reply: '这是一条兼顾隐私、安全与价值保留的顺序。', insight: '完整电子设备流转' }, { text: '先砸开取金属，再考虑里面有什么', reply: '暴力拆解会同时破坏数据安全、可修复性和操作安全。', insight: '避免非专业拆解' }] },
      { speaker: '旧手机', portrait: portrait('phone'), text: '离开资产室时，我已经不再保存原主人的任何秘密，却仍保留着作为一台设备继续工作的可能。告别数据，不等于告别价值。' },
    ],
  },
  {
    id: 'meal-box', title: '餐盒上的小数字', subtitle: '一次午餐之后，材质符号并没有替你做完决定', location: '静安区 · 午间街区', duration: '约 2 分钟', type: 'plastic', cover: `${legacy}/generated/bg_plastic.png`,
    beats: [
      { speaker: '餐盒', portrait: portrait('bottle'), text: '我的底部有一个小小的材质符号。有人看到后很高兴，以为这等于“百分之百能被回收”，于是连汤汁、筷子和塑料膜一起塞进了可回收物桶。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '材质标识能帮助识别，但不自动保证当地有对应回收路径。污染程度、复合结构、收运系统和现场规则，都决定了真正去向。' },
      { speaker: '玩家', text: '面对明显油污和残余食物，你先做什么？', choices: [{ text: '先去除残余，再按上海现场标识判断投放路径', reply: '正确。不要把清洗负担无限扩大，但应避免残余污染其他材料。', insight: '去残余＋本地规则' }, { text: '看到回收标志就整盒投入', reply: '标志不是通行证，混入餐余会影响整批材料。', insight: '材质符号不等于可回收承诺' }] },
      { speaker: '餐盒', portrait: portrait('bottle'), text: '如果每顿饭都出现一个新的我，即使分类完全正确，收运、清洗和再加工也会持续消耗资源。循环并不是把一次性使用变得没有代价。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '能自带餐盒、选择少包装、合并配送时，源头减量已经发生。必须使用一次性包装时，再尽力让它不污染其他材料。' },
      { speaker: '玩家', text: '哪句话更接近今天的结论？', choices: [{ text: '识别材质、遵循本地路径，但首先减少不必要的一次性使用', reply: '正确。减量和复用在回收之前。', insight: '回收有边界' }, { text: '只要标着塑料编号，使用越多越能支持回收产业', reply: '增加一次性消费不会自动形成高质量循环。', insight: '拒绝伪循环' }] },
      { speaker: '餐盒', portrait: portrait('bottle'), text: '我身上的小数字仍然重要，但它只是问题的开头。真正的答案藏在你是否需要我、我是否洁净，以及这座城市能否接住我。' },
    ],
  },
  {
    id: 'coffee-paper', title: '咖啡越过了纸边', subtitle: '办公室里，一张纸和半杯咖啡改变了一袋材料', location: '徐汇区 · 联合办公区', duration: '约 2 分钟', type: 'paper', cover: `${legacy}/generated/bg_paper.png`,
    beats: [
      { speaker: '办公纸', portrait: portrait('box'), text: '我只打印了一面，背面还很干净。午后咖啡杯倒在桌上，液体沿着纸堆流进回收袋。有人把湿纸团压在最下面，假装没有发生。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '“已经投进可回收桶”并不等于过程完成。水分、油污和异物会降低纸纤维质量，也会增加储运中的霉变和气味。' },
      { speaker: '玩家', text: '还没被污染的单面纸，可以先怎么做？', choices: [{ text: '作为草稿纸继续使用，再保持干燥进入合适路径', reply: '延长纸张使用能直接减少新纸需求。', insight: '先复用再回收' }, { text: '全部揉皱扔掉，反正最后会回收', reply: '揉皱不是核心问题，但跳过复用会过早结束纸张的使用价值。', insight: '避免过早处置' }] },
      { speaker: '办公纸', portrait: portrait('box'), text: '工作人员把未受污染的纸移到干燥容器，严重浸湿的一部分按现场要求另行处理。错误已经发生，但继续混在一起只会扩大损失。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '分类不是追求“每件都回收”的完美表演，而是诚实识别状态，防止一件不合格物污染一整批可利用材料。' },
      { speaker: '玩家', text: '当一件物品已经不适合回收时，最负责任的选择是？', choices: [{ text: '按本地规则妥善处置，并改进下次使用和收集方式', reply: '正确。承认边界，才能避免把污染转移给下游。', insight: '不追求虚假回收率' }, { text: '仍放进可回收桶，让分拣员想办法', reply: '这会把判断成本和污染风险转移给别人。', insight: '不转移责任' }] },
      { speaker: '办公纸', portrait: portrait('box'), text: '第二天，咖啡杯旁多了一个防洒托盘，打印机旁也放着草稿纸盒。一次失误没有被包装成胜利，却真正改变了下一次。' },
    ],
  },
  {
    id: 'exhibition-jacket', title: '展会只穿一天的外套', subtitle: '活动结束后，定制服装该成为纪念还是负担', location: '浦东 · 公益活动展馆', duration: '约 2 分钟', type: 'textile', cover: `${legacy}/generated/hub.png`,
    beats: [
      { speaker: '活动外套', portrait: portrait('shirt'), text: '我被设计得很醒目，胸前印着活动年份和岗位。展会三天结束后，几十件同款外套堆在仓库里。下一年换了主题，大家觉得我“过期”了。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '公益活动也可能制造短命物品。把环保口号印在只能使用一次的服装上，并不会自动让它变得可持续。设计阶段就决定了大部分后续路径。' },
      { speaker: '玩家', text: '下一届活动采购前，哪项设计更合理？', choices: [{ text: '使用可拆换身份贴，选择耐用通用款并建立回收清单', reply: '这样能让外套跨活动复用，减少年份和主题造成的淘汰。', insight: '为多次使用而设计' }, { text: '每年换一种复杂混纺和大面积永久印花', reply: '这会增加库存和后续分离难度。', insight: '避免一次性定制' }] },
      { speaker: '活动外套', portrait: portrait('shirt'), text: '工作人员拆下可替换徽章，清洁并检查拉链。状态良好的外套进入下一场活动，少量损坏件被送到修补台，只有无法使用的部分才进入材料路径。' },
      { speaker: '蓝猫', portrait: portrait('bluecat'), text: '线下奖励也一样：纪念章和模型不应只追求“发得多”。按需兑换、透明标注材料、提供维修和回收入口，才能让现实连接不是新的负担。' },
      { speaker: '玩家', text: 'S-game的实物奖励应该遵循什么原则？', choices: [{ text: '自愿、按需、耐用、材料透明，并提供回收或维修路径', reply: '这让奖励成为行动证据，而不是新的冲动消费。', insight: '实物闭环原则' }, { text: '通关就默认快递一件，不考虑玩家是否需要', reply: '默认发放会制造闲置、包装与运输负担。', insight: '按需兑换' }] },
      { speaker: '活动外套', portrait: portrait('shirt'), text: '下一年，我换上一枚新的可拆徽章继续站在入口。真正的纪念不是日期被印得多牢，而是一件东西被认真使用了多久。' },
    ],
  },
]

export const buildCards = [
  { id: 'pulse', name: '绝缘脉冲', tag: '控制', description: '攻击有 18% 概率使污染外壳停滞 0.7 秒。', color: '#41e7ff' },
  { id: 'magnet', name: '磁吸回流', tag: '续航', description: '拾取价值碎片时恢复 2 点生命。', color: '#70f0a8' },
  { id: 'cascade', name: '分拣连锁', tag: '输出', description: '连续命中同类目标，伤害逐步提升至 35%。', color: '#ffd65a' },
  { id: 'clean', name: '洁净压缩', tag: '教育', description: '分类正确后，本节点污染率额外下降 12%。', color: '#75d8ff' },
  { id: 'repair', name: '优先修复', tag: '价值', description: '可复用物品的价值保留奖励提升 25%。', color: '#ff93bd' },
  { id: 'barrier', name: '安全隔离', tag: '防御', description: '冲刺后获得 1.5 秒减伤屏障。', color: '#aa91ff' },
]

export const classificationChallenges = [
  { item: '鼓包锂电池', icon: '🔋', prompt: '它混在普通袋中并有挤压风险，你先做什么？', options: ['继续压紧节省空间', '停止挤压并联系专业人员处理', '扎破后投入可回收物'], answer: 1, explain: '鼓包或受损电池存在安全风险，不应挤压、穿刺或由普通玩家自行拆解。' },
  { item: '仍有半杯饮料的塑料瓶', icon: '🧴', prompt: '怎样更有利于后续流转？', options: ['倒空残液并按标识投放', '连残液直接投入', '投入有害垃圾'], answer: 0, explain: '倒空残液、适度清洁可避免污染同袋材料；具体仍以现场标识为准。' },
  { item: '干燥快递纸箱', icon: '📦', prompt: '投放前的合理动作是？', options: ['装入泡沫后封死', '浇湿避免扬尘', '取出异物、拆平并保持干燥'], answer: 2, explain: '去杂、拆平和保持干燥能提升收运效率并保留纸纤维价值。' },
  { item: '只掉一颗纽扣的衬衫', icon: '👕', prompt: '更优先的价值路径是？', options: ['修补后继续使用或流转', '立即剪碎做填充物', '当作其他垃圾'], answer: 0, explain: '能够继续使用的衣物优先修补、交换或二手流转，通常比材料降级更保值。' },
]

void legacyStories
export { stories, knowledgeSources } from './stories'
