import type { CampaignMission } from '../types'

export const campaignCast = [
  { id: 'lin-xiaoman', name: '林小满', role: '循环行动员', note: '玩家的现场搭档，负责把战斗结果翻译成真实处理步骤。' },
  { id: 'zhou-shifu', name: '周师傅', role: '撤展与维修负责人', note: '相信修理和复用，但会在时限压力下做出妥协。' },
  { id: 'qiao-qiao', name: '乔乔', role: '青年志愿者', note: '从“分类答题者”成长为能追问材料去向的组织者。' },
  { id: 'loop', name: '环环', role: '稳定原型向导', note: '能听见废物的记忆，但不会替玩家直接给答案。' },
]

const dialogue = (place: string, clue: string) => [
  { speaker: '环环', text: `${place}的污染外壳在变厚，但里面的材料并没有失去全部价值。先找到它为什么会被混在一起。` },
  { speaker: '林小满', text: `不要只问“它属于哪个桶”。这次我们要追到${clue}，才算真的完成行动。` },
  { speaker: '乔乔', text: '我会把现场的选择记下来。等到世博公众日，我们必须能向每个参与者说明这些东西最后去了哪里。' },
]

export const shanghaiCampaign: CampaignMission[] = [
  { id: 'sh-01', order: 1, title: '闭馆后的异响', subtitle: '撤展不是故事的结尾', location: '虹桥会展带', routeId: 'hongqiao-event', kind: 'story', summary: '公益展会闭馆后，成堆包装、展架和设备形成第一层污染外壳。', objective: '听取三方证词，找出“来不及”背后的流程缺口。', cast: ['林小满', '周师傅', '乔乔', '环环'], dialogue: dialogue('撤展通道', '合同、仓储和下一场活动的去向'), evidence: ['未登记展架', '下一场排期', '混投电池箱'], requires: [], reward: '开放虹桥撤展房间' },
  { id: 'sh-02', order: 2, title: '撤展通道', subtitle: '在移动房间中保护可复用展具', location: '虹桥会展带', routeId: 'hongqiao-event', kind: 'explore', summary: '在堆叠展架与叉车通道间移动，扫描四类物料并打开安全出口。', objective: '找到3个去向标签，避免把可复用框架当作一次性垃圾。', cast: ['林小满', '周师傅'], dialogue: dialogue('展具仓门', '可复用框架的真实接收人'), evidence: ['框架资产码', '仓库接收单', '可拆喷绘扣'], requires: ['sh-01'], reward: '技能点 +1' },
  { id: 'sh-03', order: 3, title: '高湿电流', subtitle: '风险隔离优先', location: '陆家嘴环线', routeId: 'lujiazui-circuit', kind: 'combat', summary: '错误混投的电子设备在高湿环境中释放游离电弧。', objective: '断电、隔离鼓包电池并净化电子污染体。', cast: ['林小满', '环环'], dialogue: dialogue('地下回收间', '数据清除和正规电子回收渠道'), evidence: ['断电确认灯', '鼓包电池盒', '数据擦除单'], requires: ['sh-02'], reward: '开放电子污染档案' },
  { id: 'sh-04', order: 4, title: '河岸的轻碎片', subtitle: '不是捞起来就结束', location: '苏州河生态段', routeId: 'suzhou-plastic', kind: 'system', summary: '塑料碎片沿水岸聚合，源头却来自几个不同使用场景。', objective: '控制污染率并判断减量、重复使用与分材的优先顺序。', cast: ['乔乔', '环环'], dialogue: dialogue('苏州河岸', '碎片进入水体之前的三个源头'), evidence: ['外卖残液瓶', '逸散薄膜带', '重复用水杯'], requires: ['sh-03'], reward: '技能点 +1' },
  { id: 'sh-05', order: 5, title: '潮纸档案室', subtitle: '保住城市记忆', location: '杨浦滨江', routeId: 'yangpu-paper', kind: 'elite', summary: '雨水侵入旧仓库，油污和胶带让档案纸材迅速失去再生价值。', objective: '移动挡水板，分离隐私页并击破湿纸精英。', cast: ['林小满', '周师傅'], dialogue: dialogue('旧仓库', '干燥批次与涉隐私材料的分别去向'), evidence: ['屋顶渗水点', '隐私档案袋', '干纤维批次'], requires: ['sh-04'], reward: '技能点 +1' },
  { id: 'sh-06', order: 6, title: '衣物不是消耗品', subtitle: '先修补，再谈再生', location: '长宁社区更新带', routeId: 'changning-textile', kind: 'rest', summary: '行动队在社区维修站整备，也要面对捐赠、交换和混纺再生的边界。', objective: '完成一次维修委托并选择下一段构筑。', cast: ['乔乔', '周师傅', '环环'], dialogue: dialogue('衣物流转站', '继续使用、捐赠与材料再生的先后关系'), evidence: ['可补袖口', '捐赠要求牌', '混纺成分标'], requires: ['sh-05'], reward: '永久装备兑换折扣' },
  { id: 'sh-07', order: 7, title: '逆向物流断点', subtitle: '分类以后，还要抵达', location: '临港物流中心', routeId: 'lingang-logistics', kind: 'explore', summary: '看似正确分类的材料因错单和雨水滞留，城市流转网络出现断点。', objective: '在可移动仓间护送两批材料到正确接收口。', cast: ['林小满', '周师傅', '乔乔'], dialogue: dialogue('临港返程线', '接收能力、交接记录和损耗责任'), evidence: ['错误目的单', '防雨覆盖布', '返程容量表'], requires: ['sh-06'], reward: '开放隐藏系统节点' },
  { id: 'sh-08', order: 8, title: '污染源不是怪物', subtitle: '四条线索汇合', location: '城市循环调度室', routeId: 'mall-foodcourt', kind: 'story', summary: '行动队发现污染外壳来自采购、使用、回收和传播目标之间的断裂。', objective: '用四地证据重建污染源链条，并决定公众日方案。', cast: ['林小满', '周师傅', '乔乔', '环环'], dialogue: dialogue('调度室', '每个环节可以被验证的责任人'), evidence: ['采购责任链', '使用减量点', '接收核验图'], requires: ['sh-07'], reward: '技能点 +2' },
  { id: 'sh-09', order: 9, title: '城市闭环演练', subtitle: '让系统在压力下工作', location: '世博园公益现场', routeId: 'public-exhibition', kind: 'elite', summary: '公众日前夜，四类物料、人流和兑换承诺同时进入压力测试。', objective: '完成三套系统玩法并守住污染率与材料价值。', cast: ['林小满', '周师傅', '乔乔'], dialogue: dialogue('世博园后台', '现场指引、志愿者口径和物料台账'), evidence: ['志愿者口径卡', '物料实时台账', '人流压力点'], requires: ['sh-08'], reward: '开放最终行动' },
  { id: 'sh-10', order: 10, title: '世博闭环公众日', subtitle: '击破公益幻象壳', location: '世博园公益现场', routeId: 'public-exhibition', kind: 'boss', summary: '最终Boss以环保口号为外表，却不断制造无计划赠品与虚假高分。', objective: '用前九节点证据击破三层外壳，回收城市闭环稳定原型。', cast: ['林小满', '周师傅', '乔乔', '环环'], dialogue: dialogue('主舞台', '公开、按需、可核验的现实兑换方案'), evidence: ['按需兑换阀', '真实污染仪', '公开去向屏'], requires: ['sh-09'], reward: '城市闭环原型 · 上海篇章完成' },
]

export const isMissionUnlocked = (mission: CampaignMission, completed: string[]) => mission.requires.every((id) => completed.includes(id))
