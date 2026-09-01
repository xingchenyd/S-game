import type { PlayModeDefinition, PlayModeId, WasteType } from '../types'

export interface SimulationRound {
  title: string
  situation: string
  object: string
  options: { label: string; effect: [number, number]; feedback: string; principle: string }[]
  best: number
}

export interface ModeSimulation {
  modeId: PlayModeId
  meters: [string, string]
  initial: [number, number]
  rounds: SimulationRound[]
}

export const playModes: PlayModeDefinition[] = [
  {
    id: 'branch-expedition', name: '分支远征：城市回路', shortName: '分支远征', icon: '◇', available: true,
    fantasy: '你不是沿着固定房间清怪，而是在一张会记住选择的城市地图上安排调查、救援、战斗和补给。',
    playerLoop: ['读取区域情报与污染传播方向', '在两至三个节点中选择路线并承担机会成本', '完成节点玩法，获得材料、证据或居民信任', '用证据改变后续Boss阶段和结局'],
    controls: '点击或触摸节点；长按查看风险预测；已走路线不可回退，但侦察道具可提前揭示一个节点。',
    winCondition: '收集足够的“风险证据”和“价值证据”后抵达核心节点，并选择与证据一致的净化方案。',
    failCondition: '污染达到100%、行动资源耗尽，或连续忽略关键风险导致核心进入失控阶段。',
    education: ['让玩家看到前端投放如何影响收运与处理下游', '用机会成本表达“没有一种处理方式适合所有物品”', '把询问现场规则设计为有效策略'],
    variants: [{ name: '信息迷雾', change: '节点只显示人物或物品轮廓，需要先侦察。' }, { name: '公众日', change: '错误路线不会立即失败，但会降低居民信任与最终兑换等级。' }, { name: '连锁污染', change: '忽略一个风险节点会改变相邻两个节点。' }],
    rewards: ['稳定原型', '区域路线印章', '未走节点情报', '下一局侦察次数'], mastery: '高手追求的不是最短路线，而是在较少行动成本下保住最高材料价值并完成关键教育证据。',
  },
  {
    id: 'pollution-control', name: '污染控制：区域压制', shortName: '污染控制', icon: '≈', available: true,
    fantasy: '污染像一套会扩散的生态而不是普通血条；你需要在源头、传播路径和受影响区域之间分配有限行动力。',
    playerLoop: ['观察四区污染率、风向/水流与人流', '用扫描确认污染类型', '部署隔离、清理或公众引导', '控制反弹并在关键窗口净化源头'],
    controls: '点选区域后选择工具；战斗中区域仍持续变化，暂停菜单会显示变化原因。',
    winCondition: '连续两个结算周期保持总污染低于25%，且至少保住一个高价值材料点。',
    failCondition: '任一区域爆表并持续两个周期，或人员风险指标达到上限。',
    education: ['源头控制通常比末端反复清扫有效', '错误混投可能污染整批可回收物', '环境行动同时考虑人员安全'],
    variants: [{ name: '苏州河潮汐', change: '水流每轮反向，漂浮物会跨区移动。' }, { name: '商场闭店', change: '人流下降但容器快速满载。' }, { name: '大风预警', change: '轻质塑料会穿越普通隔离带。' }],
    rewards: ['低污染结算加成', '区域净化徽章', '源头识别图鉴'], mastery: '同时维持污染、人员风险和材料价值三条曲线，而不是单纯追求击杀速度。',
  },
  {
    id: 'sorting-line', name: '分拣线：材质与状态', shortName: '精细分拣', icon: '▦', available: true,
    fantasy: '传送带送来的不是背口诀的图标，而是带残液、复合材质、破损状态和地区差异的真实物品。',
    playerLoop: ['观察物品外观和状态标签', '必要时扫描材质或查看现场接收规则', '执行清空、包裹、拆分或直接分流', '查看下游批次纯度和错误原因'],
    controls: '拖拽物品到处理工位；键盘可用1–4选择；触屏点击物品后点击工位。',
    winCondition: '完成一批物品且批次纯度不低于85%，危险物零错误。',
    failCondition: '危险物误入普通线，或连续三次污染同批材料。',
    education: ['分类取决于物品、状态、地区和接收能力', '清空与适度清洁能保护同袋材料', '不确定时询问比猜测更好'],
    variants: [{ name: '午餐高峰', change: '餐余和包装成组出现，先拆分再投放。' }, { name: '展会撤场', change: '大体积复合物与可复用展具混合。' }, { name: '盲盒批次', change: '标签不完整，需要消耗扫描次数。' }],
    rewards: ['批次纯度积分', '误区纠正卡', '材料护照碎片'], mastery: '在扫描资源有限时优先识别高风险与高污染物，并保持整批材料质量。',
  },
  {
    id: 'repair-bench', name: '维修台：先诊断再更换', shortName: '维修解谜', icon: '⌁', available: true,
    fantasy: '你通过症状、使用历史和安全边界定位故障，尽量只更换必要部件，让整机或整件继续工作。',
    playerLoop: ['询问症状与故障发生前情境', '断电并执行安全检查', '使用有限诊断工具排除原因', '选择维修、部件替换、降级使用或正规退役'],
    controls: '按顺序把工具卡放入诊断槽；错误顺序消耗耐久，危险动作会立即触发解释。',
    winCondition: '在工具次数内确定根因并选择安全、保值的处理结论。',
    failCondition: '带电拆解、忽略鼓包/进水等红色风险，或更换过多无关部件。',
    education: ['故障不等于报废', '维修也有安全边界', '可维修设计和备件供应决定真实寿命'],
    variants: [{ name: '电动玩具', change: '机械缠绕伪装成电池故障。' }, { name: '拉链外套', change: '比较更换拉头与整条拉链的影响。' }, { name: '共享设备', change: '必须补齐维护记录才能重新投放。' }],
    rewards: ['维修成功率', '节省部件数', '维修日志收藏页'], mastery: '用最少诊断与替换次数恢复功能，同时能识别何时必须停止自行维修。',
  },
  {
    id: 'material-escort', name: '材料护送：价值不能掉队', shortName: '材料护送', icon: '⇢', available: true,
    fantasy: '你护送一批已分拣材料穿过雨水、混装、设备故障与临时改线，价值会因路线条件持续变化。',
    playerLoop: ['检查批次纯度和运输条件', '选择干线或支线并部署防护', '沿途处理突发污染与误装', '在终点核对重量、纯度和交接单'],
    controls: '左右路线选择＋护送技能；战斗技能用于清除污染壳，不能攻击运输设施。',
    winCondition: '至少80%材料价值到达正确接收点，且交接记录完整。',
    failCondition: '批次受潮/混装跌破价值阈值，或送到不接收该材料的终点。',
    education: ['正确投放之后仍需要可靠收运', '清洁、干燥和单一材质影响价值', '记录去向能防止“回收即消失”的错觉'],
    variants: [{ name: '梅雨纸纤维', change: '防潮资源成为核心。' }, { name: '轻塑大风', change: '需要加固而非单纯加速。' }, { name: '冷链逆向', change: '返程车容量决定是否可复用。' }],
    rewards: ['交接完整度', '材料价值倍率', '物流路线章'], mastery: '根据材料特性选择路线和防护，而不是永远选最短路线。',
  },
  {
    id: 'hazard-isolation', name: '风险隔离：红线处置', shortName: '风险隔离', icon: '!', available: true,
    fantasy: '面对发热电池、碎灯管、泄漏容器等异常现场，你通过边界、上报和交接把事故阻断在发生之前。',
    playerLoop: ['识别异常迹象并停止普通操作', '保护人员、划定边界', '选择不扩大风险的临时措施', '通知合适人员并记录交接'],
    controls: '按正确顺序点选行动卡；可撤回尚未执行的卡，已执行的危险动作不可撤回。',
    winCondition: '在风险倒计数结束前完成“停—隔—报—记”链条。',
    failCondition: '穿刺、挤压、带电操作或把未知物混入普通收运。',
    education: ['普通公众不自行处置未知高风险物', '勇敢不等于靠近', '现场隔离与信息交接同样重要'],
    variants: [{ name: '写字楼发热', change: '同时疏散围观人员。' }, { name: '校园碎灯管', change: '必须保护破损区域并等待管理人员。' }, { name: '运输中异味', change: '需要追溯来源批次。' }],
    rewards: ['零暴露评价', '安全流程卡', '专业交接印章'], mastery: '在信息不完整的情况下克制操作冲动，用最短安全序列保护最多人员。',
  },
  {
    id: 'facility-defense', name: '设施防卫：守住回收站', shortName: '设施防卫', icon: '▥', available: true,
    fantasy: '污染壳会攻击容器、传送带、压缩机和记录终端；你要维修、引导和战斗，而非只守一条血条。',
    playerLoop: ['读取来袭物类型与设施弱点', '布置分流器、维修站和隔离栏', '亲自处理突破防线的污染壳', '在波次间升级设施或培训NPC'],
    controls: '拖放设施模块；角色仍可移动与施放技能；长按设施执行现场维修。',
    winCondition: '守住全部波次，核心设施至少两项保持运行，批次纯度达到目标。',
    failCondition: '记录终端与分流线同时失效，或危险物突破进入压缩设施。',
    education: ['设施维护和工作人员培训是分类系统的一部分', '不同物品需要不同拦截方式', '不以人员冒险换取设备血量'],
    variants: [{ name: '商场高峰', change: '数量大但危险物少，强调动线。' }, { name: '电子物突发', change: '数量少但每个错误代价高。' }, { name: '停电演练', change: '自动设施失效，依赖人工流程。' }],
    rewards: ['设施蓝图', '无停机奖励', 'NPC培训等级'], mastery: '让自动化、人员和角色能力互补，避免把所有资源堆在单一火力塔。',
  },
  {
    id: 'eco-mechanism', name: '环境机关：让系统重新流动', shortName: '环境机关', icon: '⌘', available: true,
    fantasy: '你通过阀门、风闸、磁选、传送带和雨棚改变物质流向，正确机关组合能不战而解开污染团。',
    playerLoop: ['观察材质与环境流向', '调整机关连接和启动顺序', '用少量战斗清除卡住的污染壳', '让材料进入正确出口并复盘能耗'],
    controls: '旋转管线、开关阀门、拖动传送带连接；所有机关提供键盘替代操作。',
    winCondition: '在能耗预算内让目标材料纯度达到要求，并阻止危险物进入错误设备。',
    failCondition: '错误机关造成二次污染、设备过载或能耗归零。',
    education: ['不同材质利用不同物理特性分选', '流程顺序会影响安全和纯度', '技术不是无条件解决方案，仍需源头分类'],
    variants: [{ name: '磁选回路', change: '金属与电子部件需要不同出口。' }, { name: '风选轻物', change: '湿度会改变纸塑运动。' }, { name: '雨棚排水', change: '先保护干燥批次再恢复传送。' }],
    rewards: ['低能耗星级', '设施结构图', '无战净化奖励'], mastery: '用更少开关和能耗完成高纯度分流，并解释每个物理机制为何有效。',
  },
  {
    id: 'npc-commission', name: '居民委托：先听完再行动', shortName: '居民委托', icon: '…', available: true,
    fantasy: '居民带来的不仅是物品，还有预算、隐私、情感和使用需求；你需要问对问题，再给出可执行建议。',
    playerLoop: ['倾听委托并识别未说出的限制', '选择追问以补全状态和需求', '提出维修、共享、捐赠或规范流转方案', '在数日后收到结果反馈并更新声誉'],
    controls: '对话选项＋物品检查；每次只能追问两项，需要判断最重要的信息。',
    winCondition: '方案同时满足安全、真实需求和可执行性，居民愿意完成后续行动。',
    failCondition: '给出武断分类口令、忽略隐私/卫生/预算，或承诺不存在的回收渠道。',
    education: ['环保建议需要尊重人的现实处境', '捐赠必须匹配需求', '不确定时承认并查找本地规则'],
    variants: [{ name: '老人旧手机', change: '保留照片和易用性比换新参数更重要。' }, { name: '学生校服', change: '预算与隐私影响交换方式。' }, { name: '商户撤展', change: '合同和时间压力决定可执行方案。' }],
    rewards: ['居民信任', '后续来信', '社区故事解锁'], mastery: '用有限追问发现真正约束，给出不夸大、能落地且尊重当事人的方案。',
  },
  {
    id: 'passport-hunt', name: '隐藏护照：证据式探索', shortName: '护照探索', icon: '⌕', available: true,
    fantasy: '收藏品不是打怪随机掉落，而是藏在使用痕迹、维修记录、物流标签和人物证词组成的证据链里。',
    playerLoop: ['探索场景并发现可疑细节', '比对物品、记录和人物说法', '拼出“使用前—行动—去向”时间线', '完成材料护照并选择仍不确定的信息'],
    controls: '靠近高亮调查；手机端点击热点；证据板支持拖拽与无拖拽排序。',
    winCondition: '找到关键证据并构成不自相矛盾的价值路径，明确标出未知项。',
    failCondition: '不会硬性失败；错误推断会触发新证据或不同结论，避免用探索惩罚学习。',
    education: ['去向证据比“已回收”口号更重要', '允许信息不完整与结论待核实', '收藏记录物品与人的关系'],
    variants: [{ name: '机房退役单', change: '序列号与数据擦除记录是关键。' }, { name: '衣物交换日', change: '修补痕迹与需求卡构成证据。' }, { name: '自然边界', change: '最重要证据可能是没有进入现场。' }],
    rewards: ['完整材料护照', '物品独白', '现实展签二维码内容'], mastery: '以最少无关线索完成可核验时间线，并主动标注哪些结论只是假设。',
  },
  {
    id: 'finale-operation', name: '四类终局：城市闭环行动', shortName: '城市终局', icon: '◆', available: true,
    fantasy: '一场大型活动同时产生电子物、包装、纸材和织物，所有已学玩法被压缩进一条会互相影响的复合任务。',
    playerLoop: ['在剧情简报中分配队伍与设施', '控制污染传播并完成高风险隔离', '护送高价值批次、维修关键设施', '根据证据选择Boss净化与现实兑换方案'],
    controls: '分阶段调用已掌握玩法；失败阶段可单独重试，完整通关记录总路线。',
    winCondition: '四类材料均有明确去向，高风险零误处置，公众信任和材料价值达到结局门槛。',
    failCondition: '可阶段重试；若选择继续，则后续节点会带着前阶段后果，不用整局归零。',
    education: ['分类、减量、复用、维修、收运和公众参与是同一系统', '公益活动本身也要为物料与奖励负责', '现实奖励应按需、可追踪而不过量'],
    variants: [{ name: '展会终局', change: '强调人流、舞台物料和现场引导。' }, { name: '校园终局', change: '强调安全、隐私和共同决策。' }, { name: '滨江终局', change: '强调风雨、水体和逸散控制。' }],
    rewards: ['Boss稳定原型', '城市闭环章', '按需实物兑换资格', '完整行动复盘'], mastery: '以系统平衡而不是战斗分数完成终局，并能在复盘中解释每个关键取舍。',
  },
]

const rounds = (modeId: PlayModeId, meters: [string, string], initial: [number, number], data: SimulationRound[]): ModeSimulation => ({ modeId, meters, initial, rounds: data })

const baseModeSimulations: ModeSimulation[] = [
  rounds('branch-expedition', ['行动力', '证据'], [6, 0], [
    { title: '地图起点', object: '陆家嘴地下回收间', situation: '监测到发热点，另一侧有居民求助和未知材料箱。第一步会决定后续情报。', best: 1, options: [
      { label: '直接冲向发热点', effect: [-2, 0], feedback: '缺少现场信息，后续隔离成本上升。', principle: '高风险不等于盲目靠近' }, { label: '先读物业巡检记录', effect: [-1, 2], feedback: '你确认异常来自混投电池，并获得安全入口。', principle: '证据改变路线' }, { label: '先开未知材料箱', effect: [-1, 1], feedback: '获得少量材料信息，但发热点继续扩散。', principle: '路线选择有机会成本' },
    ] },
    { title: '分岔节点', object: '维修台 / 收运口', situation: '旧设备可能仍可使用，但收运车即将离开。', best: 0, options: [
      { label: '先做快速功能分级', effect: [-2, 3], feedback: '整机与材料批次成功分流。', principle: '再使用优先于材料降级' }, { label: '全部赶上收运车', effect: [-1, -1], feedback: '省下时间，却失去可维修整机。', principle: '最快不等于最保值' }, { label: '全部留下以后再说', effect: [-3, 0], feedback: '暂存空间被占满，路线成本增加。', principle: '暂存也需要边界' },
    ] },
    { title: '核心门前', object: '污染壳弱点', situation: '证据显示Boss由短路、挤压和错误混装共同形成。', best: 2, options: [
      { label: '只攻击最亮的部位', effect: [-2, 0], feedback: '外壳短暂破裂后重新聚合。', principle: '症状不是源头' }, { label: '提高火力强行压制', effect: [-2, 1], feedback: '控制了数量，但材料价值下降。', principle: '战斗服务于净化' }, { label: '隔离触点并切断混装链', effect: [-1, 3], feedback: '证据对应弱点，稳定原型显现。', principle: '用系统证据解Boss' },
    ] },
  ]),
  rounds('pollution-control', ['污染控制', '材料价值'], [45, 70], [
    { title: '风向改变', object: '轻质塑料区', situation: '风把塑料薄片推向河道，纸材区同时开始受潮。', best: 0, options: [
      { label: '先设防风拦截再覆盖纸材', effect: [18, 8], feedback: '源头被拦住，两个区域都获得缓冲。', principle: '先阻传播，再护价值' }, { label: '只在河面打捞', effect: [6, -5], feedback: '末端清理持续消耗，新的薄片仍在进入。', principle: '末端补救成本更高' }, { label: '全部人员去搬纸箱', effect: [-8, 10], feedback: '纸材保住了，但塑料进入水体。', principle: '局部最优会转移问题' },
    ] },
    { title: '容器满载', object: '餐区投放点', situation: '湿垃圾桶满，居民开始把餐余连包装投入可回收物。', best: 1, options: [
      { label: '加快可回收物压缩', effect: [-12, -18], feedback: '污染物被压入整批材料。', principle: '错误设备会放大污染' }, { label: '暂停入口、换桶并现场引导分离', effect: [20, 6], feedback: '短暂排队换来批次纯度恢复。', principle: '人流控制也是净化' }, { label: '关闭所有容器', effect: [4, -8], feedback: '投放转移到周边，问题没有消失。', principle: '不能只把问题移开' },
    ] },
    { title: '稳定窗口', object: '源头混投点', situation: '总污染降到30%，可以追击残余怪物或修复错误标识。', best: 2, options: [
      { label: '继续追击拿更高连击', effect: [5, -4], feedback: '短期数值提升，但居民继续在错误点混投。', principle: '击杀不是唯一目标' }, { label: '提前结算保住成绩', effect: [0, 0], feedback: '区域仍可能在活动结束后反弹。', principle: '稳定需要持续机制' }, { label: '修复标识并培训现场人员', effect: [16, 12], feedback: '污染连续两个周期保持低位。', principle: '让系统能够自行运行' },
    ] },
  ]),
  rounds('sorting-line', ['批次纯度', '扫描次数'], [70, 3], [
    { title: '第一件', object: '半杯饮料的塑料瓶', situation: '瓶身材质清晰，但仍有残液，旁边是一批干纸。', best: 1, options: [
      { label: '直接进入塑料线', effect: [-18, 0], feedback: '残液污染邻近纸材。', principle: '材质正确不等于状态合格' }, { label: '倒空、适度清洁后按标识分流', effect: [15, 0], feedback: '材料状态符合后续要求。', principle: '清空保护整批材料' }, { label: '消耗扫描再看材质', effect: [0, -1], feedback: '扫描确认了已知信息，却没处理残液。', principle: '工具要用在未知处' },
    ] },
    { title: '第二件', object: '鼓包充电宝', situation: '外壳异常，设备温度偏高。', best: 2, options: [
      { label: '拆出塑料壳和电芯', effect: [-30, 0], feedback: '危险动作使本批次停线。', principle: '公众不自行拆异常电池' }, { label: '投入小型电子物普通格', effect: [-20, 0], feedback: '状态异常需要先隔离上报。', principle: '状态改变处理优先级' }, { label: '停止传送、隔离并通知专业人员', effect: [12, 0], feedback: '危险物零误处置。', principle: '停—隔—报—记' },
    ] },
    { title: '第三件', object: '不明复合咖啡杯', situation: '现场设有专项杯具回收，但杯内有奶泡、杯盖和吸管。', best: 0, options: [
      { label: '查看现场规则并拆分、倒空', effect: [18, -1], feedback: '扫描/查询用在真正不确定的信息上。', principle: '地区与现场能力重要' }, { label: '整杯投入废纸', effect: [-15, 0], feedback: '复合结构和残液被忽略。', principle: '外观不能替代判断' }, { label: '全部投入干垃圾避免出错', effect: [-5, 0], feedback: '没有污染批次，但也放弃了明确存在的专项渠道。', principle: '谨慎不等于一律丢弃' },
    ] },
  ]),
  rounds('repair-bench', ['设备耐久', '诊断证据'], [80, 0], [
    { title: '症状询问', object: '不转动的电动玩具', situation: '主人只说“昨天突然坏了”，外壳无明显破损。', best: 1, options: [
      { label: '立刻更换电池', effect: [-10, 0], feedback: '没有先确认症状，替换可能无关。', principle: '先诊断再换件' }, { label: '询问故障前情境并断电观察', effect: [0, 3], feedback: '得知玩具曾卷入地毯线头。', principle: '使用历史是证据' }, { label: '敲击外壳测试', effect: [-20, 0], feedback: '增加隐性损伤，且没有获得可靠信息。', principle: '暴力测试不是诊断' },
    ] },
    { title: '机械检查', object: '车轮与传动轴', situation: '断电后可以看到车轮缝隙，但电池仓仍闭合。', best: 0, options: [
      { label: '用安全工具取出缠绕线头', effect: [5, 3], feedback: '车轮恢复自由转动。', principle: '排除简单机械故障' }, { label: '拆开电机总成', effect: [-25, 1], feedback: '跳过了可见原因，耐久下降。', principle: '从最小干预开始' }, { label: '直接判定整车报废', effect: [0, -1], feedback: '可修物品被过早降级。', principle: '故障不等于寿命终点' },
    ] },
    { title: '复测与记录', object: '维修后的玩具', situation: '车轮恢复，但还未确认电池仓和防护盖。', best: 2, options: [
      { label: '马上交给孩子试玩', effect: [-15, 0], feedback: '缺少复检与使用安全确认。', principle: '维修后需要复测' }, { label: '为了保险把电机也换新', effect: [-8, 0], feedback: '过度维修浪费完好部件。', principle: '只替换必要部分' }, { label: '复位防护、空载测试并记录故障', effect: [10, 4], feedback: '设备安全恢复且留下维护信息。', principle: '维修闭环包含记录' },
    ] },
  ]),
  rounds('material-escort', ['批次价值', '交接完整'], [75, 40], [
    { title: '路线选择', object: '干燥纸纤维批次', situation: '短路线穿过露天装卸区，长路线有雨棚但多一次交接。', best: 1, options: [
      { label: '走最短露天路线', effect: [-20, 5], feedback: '雨水让纸材价值下降。', principle: '材料特性决定路线' }, { label: '走雨棚路线并核对交接', effect: [8, 18], feedback: '多花一步换来干燥和记录。', principle: '最短不一定最优' }, { label: '原地等待天气完全放晴', effect: [-8, -5], feedback: '暂存容量开始不足。', principle: '等待也有成本' },
    ] },
    { title: '中途混装', object: '不明塑料袋', situation: '叉车把一袋含残液包装放到纸材托盘旁。', best: 2, options: [
      { label: '压紧托盘防止移动', effect: [-22, 0], feedback: '残液渗入纸材。', principle: '混装不能靠压缩解决' }, { label: '继续赶路，终点会再分', effect: [-15, -8], feedback: '污染沿路线扩大且记录失真。', principle: '问题不应推给下游' }, { label: '暂停、隔离不明袋并更正清单', effect: [6, 20], feedback: '批次纯度和追踪信息都得到保护。', principle: '现场纠错与记录同步' },
    ] },
    { title: '终点验收', object: '材料交接单', situation: '重量少了2%，但纯度高于预期，接收点询问差异原因。', best: 0, options: [
      { label: '如实记录去杂损耗和处理节点', effect: [10, 20], feedback: '交接数据可以解释且可复盘。', principle: '透明记录比漂亮数字重要' }, { label: '修改起始重量让数字一致', effect: [0, -25], feedback: '账面漂亮却失去追踪价值。', principle: '不能用假数据制造闭环' }, { label: '不签单直接离开', effect: [-8, -20], feedback: '材料到了，责任链却断了。', principle: '回收不应在投放后消失' },
    ] },
  ]),
  rounds('hazard-isolation', ['人员安全', '流程完整'], [60, 0], [
    { title: '异常发现', object: '发热充电宝', situation: '设备在回收袋中冒出异味，围观者开始靠近拍摄。', best: 2, options: [
      { label: '徒手拿出来查看', effect: [-35, 0], feedback: '你把人员暴露在未知风险前。', principle: '先停普通操作' }, { label: '用水直接浇袋子', effect: [-30, 0], feedback: '未判断状态就自行处置可能扩大风险。', principle: '不鲁莽操作' }, { label: '停止搬运并让人员远离', effect: [20, 2], feedback: '风险没有继续接近人员。', principle: '停与隔是第一步' },
    ] },
    { title: '现场隔离', object: '混合回收袋', situation: '物业询问是否可以把整袋搬到室外空地。', best: 1, options: [
      { label: '快速拖行到电梯', effect: [-25, 0], feedback: '拖行、挤压和密闭空间增加风险。', principle: '移动不是默认答案' }, { label: '维持边界并描述现状给专业人员', effect: [15, 3], feedback: '专业接手者获得准确现场信息。', principle: '报出状态而非猜测' }, { label: '扎破袋子散味', effect: [-40, -1], feedback: '危险动作立即中止行动。', principle: '不穿刺未知物' },
    ] },
    { title: '交接记录', object: '处置完成后的现场', situation: '异常物已由合适人员接手，活动即将继续。', best: 0, options: [
      { label: '记录时间、来源、观察和接手方并复盘容器', effect: [10, 4], feedback: '一次异常变成可预防的系统改进。', principle: '记是安全链最后一环' }, { label: '马上恢复活动，不再提这件事', effect: [0, -2], feedback: '相同混投可能再次发生。', principle: '没有记录就难以改进' }, { label: '公布当事人姓名追责', effect: [-10, -1], feedback: '制造羞辱不等于改善系统。', principle: '安全教育不做道德猎巫' },
    ] },
  ]),
]

const extraModeSimulations: ModeSimulation[] = [
  rounds('facility-defense', ['设施完整', '分流纯度'], [70, 65], [
    { title: '第一波：餐区高峰', object: '入口分流器', situation: '大量带剩食包装涌入，压缩机火力很强，但分离台容量不足。', best: 1, options: [
      { label: '升级压缩机速度', effect: [-10, -20], feedback: '错误混合被更快压实，后续无法纠正。', principle: '自动化会放大输入错误' }, { label: '增设倒液分离台并引导人流', effect: [12, 18], feedback: '入口压力下降，设施没有被污染拖垮。', principle: '动线也是防御设施' }, { label: '关闭入口拒绝所有投放', effect: [8, -12], feedback: '核心暂时安全，周边却出现新的混投点。', principle: '不能把问题推出边界' },
    ] },
    { title: '第二波：危险突破', object: '电子物检测门', situation: '一件异常发热设备进入普通传送带，维修站和隔离栏只能升级一个。', best: 2, options: [
      { label: '升级维修站现场拆机', effect: [-25, -8], feedback: '异常设备不应在普通线上拆解。', principle: '危险物先隔离而非维修' }, { label: '加强攻击塔快速击碎', effect: [-30, -15], feedback: '火力破坏外壳并扩大风险。', principle: '战斗不能替代安全流程' }, { label: '升级隔离栏并暂停该线', effect: [18, 10], feedback: '危险物被拦下，其他设施继续工作。', principle: '分区停机避免全站失效' },
    ] },
    { title: '波次间整备', object: '记录终端', situation: '终端出现丢包，NPC仍可手工分拣。你有一次升级机会。', best: 0, options: [
      { label: '修复终端并培训手工备援', effect: [20, 12], feedback: '自动与人工流程形成冗余。', principle: '系统韧性不靠单点' }, { label: '全部资源堆到攻击塔', effect: [2, 0], feedback: '怪物更快消失，但去向记录继续缺失。', principle: '守站不等于只守血量' }, { label: '让NPC加速分拣不做培训', effect: [-12, -10], feedback: '速度上升，错误率也同步增加。', principle: '人员培训是设施能力' },
    ] },
  ]),
  rounds('eco-mechanism', ['剩余能耗', '输出纯度'], [8, 55], [
    { title: '风选前置', object: '混合轻物料', situation: '纸片与塑料薄膜混合，纸片受潮后重量接近塑料。', best: 1, options: [
      { label: '立即把风机开到最大', effect: [-3, -15], feedback: '湿度改变了运动特性，材料仍混在一起。', principle: '机关依赖真实状态' }, { label: '先启用低能耗干燥/检查，再调风速', effect: [-2, 20], feedback: '纸塑差异恢复，分选更稳定。', principle: '顺序影响效果' }, { label: '反复开关风机碰运气', effect: [-4, -5], feedback: '能耗下降却没有形成可靠结果。', principle: '随机尝试不是机制理解' },
    ] },
    { title: '磁选岔路', object: '金属罐与电子板卡', situation: '两者都响应磁选/金属检测，但电子板卡不能进入普通金属压缩口。', best: 2, options: [
      { label: '全部送入金属压缩口', effect: [-1, -25], feedback: '材质相似不代表处理路径相同。', principle: '物品结构与风险同样重要' }, { label: '关闭磁选改成人工全拣', effect: [-2, 2], feedback: '可行但能耗与效率优势被放弃。', principle: '技术需与人工互补' }, { label: '磁选后增加电子识别分流门', effect: [-2, 22], feedback: '先利用共同特性，再按物品类型细分。', principle: '多级分选保纯度' },
    ] },
    { title: '雨棚排水', object: '纸材传送带', situation: '雨棚积水即将溢出，停带会积压，继续会让纸材受潮。', best: 0, options: [
      { label: '短暂停带、先开排水再恢复', effect: [-2, 18], feedback: '保护材料状态后系统恢复。', principle: '短暂停机换长期稳定' }, { label: '加速传送抢在水前', effect: [-2, -12], feedback: '部分纸材滑落并受潮。', principle: '速度不能解决环境风险' }, { label: '用热风直接吹散积水', effect: [-4, -5], feedback: '高能耗且把水带到其他区域。', principle: '不要转移污染' },
    ] },
  ]),
  rounds('npc-commission', ['居民信任', '方案可行'], [45, 40], [
    { title: '委托一：旧手机', object: '老人保存照片的手机', situation: '屏幕碎裂但仍能开机，预算有限，老人只说“帮我扔掉吧”。你只能先追问一个问题。', best: 0, options: [
      { label: '照片是否备份、还希望继续使用吗？', effect: [18, 18], feedback: '你发现核心需求是保留照片和熟悉操作。', principle: '先听需求再谈去向' }, { label: '这手机能卖多少钱？', effect: [-8, 4], feedback: '价格不是当事人最在意的问题。', principle: '价值不只等于残值' }, { label: '您知道该投哪个桶吗？', effect: [-12, -5], feedback: '问题把复杂委托缩成了分类考试。', principle: '不要武断给口令' },
    ] },
    { title: '方案形成', object: '维修与数据选择', situation: '维修点确认可更换屏幕，老人希望操作方式不变。', best: 2, options: [
      { label: '建议直接换最新机型', effect: [-15, -10], feedback: '增加学习负担并忽略可维修性。', principle: '新不一定更合适' }, { label: '替他决定把手机捐掉', effect: [-25, -15], feedback: '未经同意处分物品与数据。', principle: '尊重当事人决定' }, { label: '说明维修成本与风险，由老人选择并协助备份', effect: [20, 20], feedback: '方案透明、可执行且保留自主权。', principle: '建议不代替选择' },
    ] },
    { title: '后续来信', object: '一个月后的反馈', situation: '手机维修后继续使用，但电池续航下降，需要下一步计划。', best: 1, options: [
      { label: '承诺任何街边店都能安全换电池', effect: [-20, -10], feedback: '你承诺了无法核验的渠道。', principle: '不夸大服务能力' }, { label: '建议正规检测并提前了解数据与退役路径', effect: [15, 18], feedback: '委托形成长期而非一次性建议。', principle: '计划允许状态变化' }, { label: '让老人继续用到完全无法开机', effect: [-8, -5], feedback: '忽略了提前备份与风险评估。', principle: '延寿不等于无限拖延' },
    ] },
  ]),
  rounds('passport-hunt', ['关键证据', '推断可靠'], [0, 50], [
    { title: '现场线索', object: '一件修补过的衬衫', situation: '袖口有新线迹，口袋里有交换日号码牌，领口标签被剪掉。哪条最值得先记录？', best: 1, options: [
      { label: '颜色很流行，所以一定很贵', effect: [0, -15], feedback: '审美判断不能证明流转路径。', principle: '区分观察与推断' }, { label: '修补线迹和号码牌', effect: [2, 12], feedback: '两项证据指向维修后参加交换。', principle: '证据可以互相印证' }, { label: '标签被剪，所以一定来自捐赠', effect: [1, -8], feedback: '这是可能性，但不是唯一解释。', principle: '未知项不要写成事实' },
    ] },
    { title: '人物证词', object: '活动志愿者', situation: '志愿者说“所有衣服后来都有人领走”，但登记表显示三件未匹配。', best: 2, options: [
      { label: '相信口述，登记表不重要', effect: [0, -18], feedback: '单一证词覆盖了矛盾证据。', principle: '证词需要交叉核对' }, { label: '认定志愿者撒谎', effect: [0, -15], feedback: '矛盾可能来自记忆或统计口径。', principle: '不急于道德判断' }, { label: '保留矛盾并查找后续交接记录', effect: [2, 15], feedback: '未知被明确标注，调查继续。', principle: '承认不确定是可靠的一部分' },
    ] },
    { title: '完成护照', object: '价值路径时间线', situation: '证据确认：原主人修补→交换活动未匹配→剧场借用。护照结尾怎样写？', best: 0, options: [
      { label: '如实写明三段路径，并标注未来去向未知', effect: [2, 18], feedback: '时间线可核验且没有编造终点。', principle: '回收不是故事必须的结局' }, { label: '写成已被完美再生', effect: [0, -25], feedback: '漂亮结局没有证据支持。', principle: '不制造绿色童话' }, { label: '只写“环保成功”', effect: [0, -15], feedback: '口号抹掉了具体行动与局限。', principle: '证据比标签重要' },
    ] },
  ]),
  rounds('finale-operation', ['系统稳定', '公众信任'], [55, 55], [
    { title: '展会开场', object: '四类物料同时涌入', situation: '餐区、舞台、电子体验台和纪念品区同时报告问题，只能先处理一处并给其他区下达远程指令。', best: 2, options: [
      { label: '先去舞台打怪，画面最吸引观众', effect: [-10, -8], feedback: '高风险电子物继续混入普通收集。', principle: '优先级由风险而非曝光决定' }, { label: '先发放更多纪念品稳定人群', effect: [-12, 2], feedback: '物料增加且没有解决现场风险。', principle: '奖励不能掩盖系统问题' }, { label: '隔离电子异常点，同时指令餐区暂停入口分流', effect: [18, 10], feedback: '一处现场处置与一处远程控流同时生效。', principle: '分工与风险优先' },
    ] },
    { title: '中场反弹', object: '设施与材料冲突', situation: '雨水威胁纸展架，衣物交换区出现受潮捐赠袋，主舞台Boss开始聚合。', best: 1, options: [
      { label: '所有人集中攻击Boss', effect: [-15, -12], feedback: '可见敌人受创，两个真实材料点却损失。', principle: '终局不是纯战斗考试' }, { label: '覆盖纸材、隔离受潮袋，再用机关延缓Boss', effect: [20, 16], feedback: '价值与安全被保住，Boss失去污染来源。', principle: '控制源头削弱Boss' }, { label: '把纸材和衣物都标为不可回收', effect: [-8, -18], feedback: '粗暴判定失去价值且降低公众信任。', principle: '状态需要分别判断' },
    ] },
    { title: '现实奖励结算', object: '稳定原型与三百名玩家', situation: '活动预算只能支持少量实体纪念品，所有人都获得数字原型。', best: 0, options: [
      { label: '提供数字护照，实体按需预约并公开数量与材料', effect: [18, 22], feedback: '纪念价值与物料责任同时被看见。', principle: '按需而非无差别发放' }, { label: '临时加印廉价塑料奖品', effect: [-18, -12], feedback: '公益奖励制造新的过量物料。', principle: '活动本身也要闭环' }, { label: '取消所有奖励且不解释', effect: [2, -20], feedback: '减少了物料，却破坏了承诺和参与信任。', principle: '透明沟通也是责任' },
    ] },
  ]),
]

export const modeSimulations: ModeSimulation[] = [...baseModeSimulations, ...extraModeSimulations]

export const getPlayMode = (id: PlayModeId) => playModes.find((mode) => mode.id === id)
