import type { WasteType } from '../types'

export type EnemyRole = 'chaser' | 'ranged' | 'charger' | 'support' | 'hazard' | 'splitter'
export interface EnemyDefinition {
  id: string; name: string; type: WasteType; tier: 'base' | 'elite' | 'boss'; role: EnemyRole; sprite: number
  hp: number; speed: number; contactDamage: number; color: number; telegraph: string; behavior: string; counter: string; lesson: string
  phases?: { at: number; name: string; change: string }[]
}

const enemy = (id: string, name: string, type: WasteType, role: EnemyRole, sprite: number, hp: number, speed: number, contactDamage: number, color: number, telegraph: string, behavior: string, counter: string, lesson: string): EnemyDefinition => ({ id, name, type, tier: 'base', role, sprite, hp, speed, contactDamage, color, telegraph, behavior, counter, lesson })

export const baseEnemies: EnemyDefinition[] = [
  enemy('e-battery-mite', '短路电池螨', 'electronic', 'chaser', 0, 46, 70, 8, 0x41e7ff, '触点闪白两次', '贴近后短暂蓄能并扑击', '冲刺穿过蓄能圈或脉冲断能', '异常电池先停止普通操作'),
  enemy('e-data-eye', '数据窥视眼', 'electronic', 'ranged', 1, 38, 48, 7, 0xaa91ff, '镜头收缩为红点', '保持距离并发射追踪数据束', '绕到遮挡后蓄力击破', '电子流转前先处理个人数据'),
  enemy('e-cable-knot', '线缆缠结体', 'electronic', 'hazard', 2, 58, 38, 6, 0x65d9ff, '地面出现蓝色绳圈', '铺设减速线圈限制移动', '定向切割端点而非打击中段', '小型配件也需要整理与分类'),
  enemy('e-screen-shard', '碎屏刃片', 'electronic', 'charger', 3, 44, 78, 10, 0x78f1ff, '沿直线投出高亮轨迹', '锁定后高速直线冲锋', '侧闪后从背面反击', '破损设备注意尖锐边缘'),
  enemy('e-board-swarm', '板卡蜂群', 'electronic', 'splitter', 4, 66, 45, 7, 0x70f0a8, '外壳接缝逐格亮起', '死亡后分裂成两个小型单元', '终结技一次净化避免分裂', '板卡先检测，部件可作为备件'),
  enemy('e-charge-leech', '待机耗能蛭', 'electronic', 'support', 5, 52, 42, 5, 0xffd65a, '与同伴之间拉出电弧', '连接同伴并持续回复外壳稳定', '切断连线或先击破支援者', '共享设备仍需要维护与退役机制'),
  enemy('p-residue-slime', '残液黏团', 'plastic', 'hazard', 0, 52, 42, 7, 0x3cc9ff, '身体膨胀并滴落蓝点', '留下持续污染的黏液池', '引离材料区再用脉冲清空', '包装先清空残余内容物'),
  enemy('p-film-wisp', '轻膜风灵', 'plastic', 'charger', 1, 34, 92, 6, 0x75eda0, '顺风方向出现白色箭头', '借风连续位移并越过障碍', '在风向改变前用定向技能拦截', '防止轻薄塑料逸散'),
  enemy('p-cap-crab', '瓶盖钳蟹', 'plastic', 'chaser', 2, 48, 64, 8, 0x65d9ff, '双钳先向外张开', '横向逼近后夹击', '向纵向闪避并蓄力破甲', '组件是否拆分以接收要求为准'),
  enemy('p-foam-puffer', '泡沫膨胀体', 'plastic', 'splitter', 3, 60, 34, 5, 0xd9f7ff, '身体出现四条裂缝', '受普通攻击会产生轻质碎屑', '使用终结技或环境压缩机关', '不要在风口徒手掰碎泡沫'),
  enemy('p-mixed-shell', '混材拟态箱', 'plastic', 'ranged', 4, 70, 38, 8, 0xff9b5e, '表面材质标识快速切换', '按当前外壳发射不同弹道', '扫描后使用对应定向技能', '塑料名称不能替代材质与状态判断'),
  enemy('p-wrap-serpent', '缠绕膜长蛇', 'plastic', 'support', 5, 58, 52, 6, 0x8ef4d0, '尾端连向最近同伴', '缠住敌人使其获得护盾', '从尾端切断连接并保持膜材整洁', '企业膜材应单独清洁分流'),
  enemy('r-wet-page', '潮页游魂', 'paper', 'hazard', 0, 50, 45, 6, 0x7bb5d5, '地面水印逐渐变深', '扩大潮湿区降低角色速度', '先启动雨棚/干燥机关再攻击', '废纸保持平整与干燥'),
  enemy('r-tape-spider', '胶带结网蛛', 'paper', 'support', 1, 44, 55, 5, 0xffd65a, '向两侧射出透明丝线', '给纸材敌人附加复合护层', '斩断连接点并去除明显异物', '胶带与覆膜会增加再生难度'),
  enemy('r-oil-mask', '油渍面具', 'paper', 'ranged', 2, 42, 47, 7, 0xd99148, '面具中心聚成深色圆点', '抛射油滴污染地面与材料点', '阻断投掷线并优先净化', '严重油污纸不应污染干净废纸'),
  enemy('r-box-ram', '立箱冲撞者', 'paper', 'charger', 3, 68, 60, 10, 0xc7a55c, '箱体沿折线压缩', '未拆平箱体沿直线撞击', '侧闪后触发压平机关', '纸箱去杂、拆平可提升收运效率'),
  enemy('r-receipt-ghost', '热敏票幽影', 'paper', 'ranged', 4, 36, 64, 6, 0xe9e4cd, '文字变成闪烁问号', '制造错误分类提示干扰HUD', '查看现场规则后标记未知', '特殊纸张不能只凭外观判断'),
  enemy('r-file-sentinel', '档案守密者', 'paper', 'chaser', 5, 62, 48, 9, 0xaa91ff, '身上序列号由蓝转红', '靠近后锁住行动记录', '完成数据擦除节点再破壳', '纸张也可能承载隐私信息'),
  enemy('t-button-sprite', '失扣布偶', 'textile', 'chaser', 0, 46, 62, 7, 0xff78ad, '胸前线头快速抖动', '贴近后甩出线头牵引玩家', '切断线头并触发修补判定', '小破损可以先修补'),
  enemy('t-blend-chimera', '混纺嵌合体', 'textile', 'splitter', 1, 72, 44, 8, 0xaa91ff, '不同颜色纤维依次发光', '受单一属性攻击会改变抗性', '交替定向技能或保留整件价值', '混纺结构增加材料分离难度'),
  enemy('t-fast-hanger', '快时尚衣架', 'textile', 'charger', 2, 40, 88, 8, 0xff9b5e, '折扣数字开始倒计时', '连续三次高速折返冲锋', '保持节奏闪避，倒计时结束后反击', '促销不应替代真实需求'),
  enemy('t-donation-mold', '受潮捐赠袋', 'textile', 'hazard', 3, 60, 34, 7, 0x75a77f, '周围出现绿色孢点', '污染附近完好织物并降低价值', '先隔离再处理，不能混入捐赠', '捐赠物应清洁干燥并符合需求'),
  enemy('t-zipper-beetle', '卡链甲虫', 'textile', 'support', 4, 54, 52, 6, 0xffd65a, '拉链沿同伴外壳闭合', '给同伴封上高防护外壳', '攻击拉头弱点而非破坏整件', '局部配件维修保留更多价值'),
  enemy('t-costume-mimic', '舞台衣拟态', 'textile', 'ranged', 5, 48, 46, 7, 0xf09cff, '角色标签变成瞄准框', '复制玩家上一次技能形成投影', '改变技能顺序并拆除专属标签', '舞台服可用模块化部件跨项目复用'),
]

const elite = (id: string, name: string, type: WasteType, role: EnemyRole, sprite: number, behavior: string, counter: string, lesson: string): EnemyDefinition => ({ id, name, type, tier: 'elite', role, sprite, hp: 170, speed: 58, contactDamage: 13, color: 0xffd65a, telegraph: '金色警戒框与低频提示音', behavior, counter, lesson })
export const eliteEnemies: EnemyDefinition[] = [
  elite('x-thermal-pack', '热失控巡游者', 'electronic', 'hazard', 6, '周期性扩大禁区并召唤短路电池螨', '在预警期撤离，隔离触点后打断召唤', '异常电池先隔离上报'),
  elite('x-data-warden', '数据锁守卫', 'electronic', 'support', 7, '锁定一个技能直到完成擦除信标', '在场景终端完成短交互解除锁定', '数据安全属于流转前置步骤'),
  elite('x-microplastic-tide', '微塑潮先锋', 'plastic', 'splitter', 6, '血量阶段性分裂并随水流移动', '使用环境拦网聚拢后终结', '先阻止逸散再处理材料'),
  elite('x-package-stack', '复合包装塔', 'plastic', 'ranged', 7, '轮换纸/塑/残液三层攻击', '观察图标拆解外层顺序', '复合包装需要状态与现场规则'),
  elite('x-wet-archive', '潮纸档案官', 'paper', 'support', 6, '吸收潮湿区回复并制造错误记录', '先恢复雨棚和排水设施', '设施条件影响材料价值'),
  elite('x-privacy-shredder', '隐私碎纸刃', 'paper', 'charger', 7, '随机冲锋并散落带个人信息的纸片', '收集证据后启动合规销毁节点', '回收不自动消除信息责任'),
  elite('x-fashion-loop', '折扣循环体', 'textile', 'charger', 6, '以倒计时诱导玩家提前释放技能', '等待真实破绽而非追逐促销提示', '源头减量发生在购买决定'),
  elite('x-blend-loom', '混纺织机兽', 'textile', 'support', 7, '把不同敌人缝合并共享血量', '先断开纤维连接，再分别处理', '混纺提高分离难度，延寿更重要'),
]

const boss = (id: string, name: string, type: WasteType, sprite: number, lesson: string, phases: EnemyDefinition['phases']): EnemyDefinition => ({ id, name, type, tier: 'boss', role: 'support', sprite, hp: 760, speed: 55, contactDamage: 16, color: 0xff6f68, telegraph: 'Boss边框、地面范围和阶段标题三重预警', behavior: phases?.map((phase) => phase.change).join('；') ?? '', counter: '用前置节点获得的证据触发破稳，再使用终结技回收稳定原型', lesson, phases })
export const bosses: EnemyDefinition[] = [
  boss('b-lithium', '失控锂芯兽', 'electronic', 7, '污染外壳来自挤压、短路与错误混投', [{ at: .7, name: '短路环', change: '释放三向追踪电弧' }, { at: .35, name: '热失控预警', change: '扩大危险圈但暴露隔离触点' }]),
  boss('b-tide', '微塑潮汐兽', 'plastic', 7, '源头减量与防逸散优先于末端打捞', [{ at: .7, name: '潮向反转', change: '水流改变所有弹道' }, { at: .35, name: '碎屑化', change: '分裂前必须使用终结技' }]),
  boss('b-paper-fort', '湿纸堡垒', 'paper', 7, '干燥、去杂和正确收运共同保住纸纤维', [{ at: .7, name: '吸水层', change: '从潮湿区持续回复' }, { at: .35, name: '档案坍塌', change: '直线冲撞并散落隐私页' }]),
  boss('b-fashion', '快时尚拼接兽', 'textile', 7, '完整衣物优先修补和继续使用', [{ at: .7, name: '折扣狂潮', change: '假提示诱导提前交技能' }, { at: .35, name: '混纺重组', change: '轮换抗性并召唤支援' }]),
  boss('b-event-screen', '一次性巨幕兽', 'plastic', 7, '展陈应在设计与合同阶段预设拆分和复用', [{ at: .7, name: '日期锁死', change: '场地被不可复用标记覆盖' }, { at: .35, name: '撤展倒计时', change: '需要同步保护可复用框架' }]),
  boss('b-logistics', '混装吞运体', 'plastic', 7, '材料到达正确接收点并有记录才形成闭环', [{ at: .7, name: '错单分叉', change: '生成三个去向标识' }, { at: .35, name: '压缩误区', change: '压缩错误批次并降低价值' }]),
  boss('b-misdiagnosis', '误诊拼装兽', 'electronic', 7, '最小干预维修与停止自行操作同样重要', [{ at: .7, name: '无关换件', change: '随机封锁完好部件' }, { at: .35, name: '带电拆解', change: '危险红区扩大，需断电信标' }]),
  boss('b-public-good', '公益幻象壳', 'textile', 7, '公益活动自身也要按需生产、透明流转', [{ at: .7, name: '曝光数值', change: '用虚假高分遮挡真实指标' }, { at: .35, name: '过量赠品', change: '召唤四类混合物并考验系统平衡' }]),
]

export const enemies = [...baseEnemies, ...eliteEnemies, ...bosses]
export const enemiesFor = (type: WasteType) => baseEnemies.filter((item) => item.type === type)
export const elitesFor = (type: WasteType) => eliteEnemies.filter((item) => item.type === type)
