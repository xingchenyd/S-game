import type { PlayModeId, WasteType } from '../types'

export type TrainingMechanic = 'scan' | 'sort' | 'sequence' | 'escort' | 'terminal'

export interface TrainingRoomPlan {
  mechanic: TrainingMechanic
  name: string
  briefing: string
  principle: string
  steps?: [string, string, string]
}

const plans = (...rooms: TrainingRoomPlan[]) => rooms

export const trainingRoomPlans: Record<PlayModeId, TrainingRoomPlan[]> = {
  'branch-expedition': plans(
    { mechanic: 'scan', name: '路线勘察室', briefing: '在城市节点中找到三条可核验证据，再决定前进路线。', principle: '先调查，再选择路线' },
    { mechanic: 'sequence', name: '回路调度室', briefing: '根据现场记录依次启动侦察、隔离与通行机关。', principle: '路线选择要承担系统后果', steps: ['侦察节点', '隔离风险', '开放通路'] },
    { mechanic: 'terminal', name: '行动决策舱', briefing: '走到现场终端，用刚才获得的信息完成一次路线判断。', principle: '证据应当改变行动选择' },
  ),
  'pollution-control': plans(
    { mechanic: 'scan', name: '污染溯源区', briefing: '沿水岸寻找源头、传播路径和受影响点。', principle: '污染控制从识别源头开始' },
    { mechanic: 'sequence', name: '阻断控制室', briefing: '按源头控制、路径阻断、末端清理的顺序启动装置。', principle: '源头控制优先于反复清扫', steps: ['控制源头', '阻断路径', '清理末端'] },
    { mechanic: 'escort', name: '安全转运廊', briefing: '把污染样本送入隔离舱，避开会造成二次扩散的区域。', principle: '转运不能制造二次污染' },
  ),
  'sorting-line': plans(
    { mechanic: 'sort', name: '基础分流仓', briefing: '拾取散落材料，送到与材质匹配的上海分类工位。', principle: '分类取决于材质与物品状态' },
    { mechanic: 'sort', name: '复杂状态仓', briefing: '继续完成混合批次分流，错误投放会降低批次纯度。', principle: '不确定时先观察再投放' },
    { mechanic: 'terminal', name: '批次复核台', briefing: '走到复核终端，对现场最容易混淆的物品作最终判断。', principle: '保住整批材料价值' },
  ),
  'repair-bench': plans(
    { mechanic: 'scan', name: '故障观察间', briefing: '靠近设备，记录症状、使用痕迹和安全风险。', principle: '故障不等于报废' },
    { mechanic: 'sequence', name: '维修工序间', briefing: '按断电、诊断、处理的安全顺序操作维修台。', principle: '先确保安全，再定位根因', steps: ['断开电源', '诊断根因', '执行处理'] },
    { mechanic: 'terminal', name: '寿命评估台', briefing: '结合现场证据决定维修、降级使用或正规退役。', principle: '延寿也有安全边界' },
  ),
  'material-escort': plans(
    { mechanic: 'escort', name: '干线装载区', briefing: '接取已分拣材料，避开积水与混装带送到交接门。', principle: '运输条件决定材料价值' },
    { mechanic: 'sort', name: '中转复核区', briefing: '把转运中发现的混入物重新归入正确工位。', principle: '交接前复核批次纯度' },
    { mechanic: 'terminal', name: '交接签收台', briefing: '核对重量、纯度与去向，完成一次运输判断。', principle: '完整记录让去向可追溯' },
  ),
  'hazard-isolation': plans(
    { mechanic: 'scan', name: '异常观察区', briefing: '保持距离，找出发热、破损与泄漏三类风险迹象。', principle: '未知风险先观察' },
    { mechanic: 'sequence', name: '隔离响应区', briefing: '按停止、隔离、上报的顺序启动安全机关。', principle: '停、隔、报是第一响应', steps: ['停止作业', '建立隔离', '报告状态'] },
    { mechanic: 'escort', name: '专业交接区', briefing: '在安全边界外护送封装箱到专业接收点。', principle: '危险物必须进入合适渠道' },
  ),
  'facility-defense': plans(
    { mechanic: 'sort', name: '入口分流区', briefing: '用正确分流保护后方设施，避免错误输入被自动化放大。', principle: '动线也是防御设施' },
    { mechanic: 'sequence', name: '设施联控区', briefing: '依次启动检测、分流与备援，恢复系统韧性。', principle: '系统韧性不依赖单点', steps: ['异常检测', '材料分流', '人工备援'] },
    { mechanic: 'escort', name: '维护通道', briefing: '将替换模块送到故障设施，避开仍在运转的危险区域。', principle: '维护优先保护人员与材料' },
  ),
  'eco-mechanism': plans(
    { mechanic: 'sequence', name: '风选实验室', briefing: '观察物料状态，按预处理、分选、复核启动机关。', principle: '顺序决定机关效果', steps: ['状态预处理', '启动分选', '纯度复核'] },
    { mechanic: 'escort', name: '低耗转运廊', briefing: '把分选样本送到出口，同时避开高能耗干预区。', principle: '节能不能以失去材料为代价' },
    { mechanic: 'terminal', name: '机制推演台', briefing: '在终端中选择兼顾能耗和输出纯度的方案。', principle: '技术应与人工判断互补' },
  ),
  'npc-commission': plans(
    { mechanic: 'scan', name: '需求访问室', briefing: '寻找物品痕迹、使用需求和当事人顾虑，不急着给答案。', principle: '先倾听，再提出方案' },
    { mechanic: 'escort', name: '社区服务廊', briefing: '把委托物送往合适服务点，避开不可靠渠道。', principle: '方案必须真实可执行' },
    { mechanic: 'terminal', name: '共同决策台', briefing: '向居民说明选择与代价，由当事人作最终决定。', principle: '建议不代替当事人选择' },
  ),
  'passport-hunt': plans(
    { mechanic: 'scan', name: '物证档案室', briefing: '寻找标签、修补痕迹和流转编号，区分观察与猜测。', principle: '证据可以互相印证' },
    { mechanic: 'scan', name: '去向追踪室', briefing: '补齐交接记录、人物证词和时间节点。', principle: '矛盾证据应被保留' },
    { mechanic: 'terminal', name: '材料护照台', briefing: '根据证据写下可核验的材料路径，不虚构完美结局。', principle: '未知项不要写成事实' },
  ),
  'finale-operation': plans(
    { mechanic: 'scan', name: '全域研判室', briefing: '在多处同时报警时找出风险最高的三个关键节点。', principle: '优先级由风险而非曝光决定' },
    { mechanic: 'sort', name: '闭环调度室', briefing: '在设施压力下完成材料分流，保住关键批次。', principle: '终局不是纯战斗考试' },
    { mechanic: 'sequence', name: '稳定原型室', briefing: '按风险控制、价值保全、公开交接完成最终闭环。', principle: '公益行动本身也要闭环', steps: ['控制风险', '保全价值', '透明交接'] },
  ),
}

export const trainingMaterials: { id: string; name: string; type: WasteType; art: string }[] = [
  { id: 'battery', name: '废旧电池', type: 'electronic', art: 'char_battery.png' },
  { id: 'bottle', name: '空塑料瓶', type: 'plastic', art: 'char_bottle.png' },
  { id: 'box', name: '干净纸盒', type: 'paper', art: 'char_box.png' },
  { id: 'shirt', name: '旧棉衬衫', type: 'textile', art: 'char_shirt.png' },
]

export const trainingTypeLabels: Record<WasteType, string> = {
  electronic: '有害 / 电子', plastic: '可回收塑料', paper: '可回收纸类', textile: '纺织物回收',
}

export function scoreTrainingRoom(mistakes: number, terminalCorrect = true) {
  return Math.max(55, 100 - mistakes * 10 - (terminalCorrect ? 0 : 20))
}
