/**
 * Chinese locale strings for Pebble
 * 鹅卵石 - 温柔而坚定的心理边界守护者
 */

export const ZH_CN = {
  // 通用
  appName: '鹅卵石',
  tagline: '温柔而坚定的心理边界守护者',
  back: '返回',
  start: '开始使用',
  localOnly: '本地存储',
  madeWith: '用 ❤️ 制作',
  privacyNote: '您的对话仅存储在本地设备上',
  safetyDisclaimer: '本工具仅提供沟通建议，不能替代专业心理治疗。如遇紧急情况，请寻求专业帮助。',

  // 首页 / Dashboard
  welcome: '深呼吸，{name}。这里很安全。',
  dashboardSubtitle: '选择一个工具来开始您的旅程',
  boundariesAreHealthy: '设立边界是自我保护，不是自私。',
  youDeserveRespect: '您值得被尊重地对待。',
  localDataOnly: '数据仅保存在本地',

  // 功能卡片
  decoder: '读心翻译器',
  decoderDesc: '看穿操控背后的真相',
  decoderDetail: '输入让您困扰的对话，AI帮您分析潜台词',
  decoderTitle: '读心翻译器',
  decoderSubtitle: '输入一段对话，看穿言语背后的真相',

  simulator: '模拟陪练场',
  simulatorDesc: '练习钝感应对技巧',
  simulatorDetail: '在安全的模拟环境中练习回应操控',
  simulatorTitle: '模拟陪练场',
  simulatorSubtitle: '在安全的环境中练习应对技巧',

  breathing: '急救呼吸',
  breathe: '急救呼吸',
  breathingDesc: '4-7-8 呼吸放松法',
  breatheDesc: '当情绪失控时，帮您快速恢复平静',
  breathingDetail: '当情绪失控时，帮您快速恢复平静',
  breathingTitle: '急救呼吸',
  breathingSubtitle: '4-7-8 呼吸法，快速恢复内心平静',

  // 翻译器 / Decoder
  stormSection: '风雨区',
  shelterSection: '避难所',
  inputPlaceholder: '输入对方的消息...',
  inputPlaceholderExample: '例如："你看别人家的媳妇，又能挣钱又顾家..."',
  decodeBtn: '翻译潜台词',
  analyzing: '分析中...',
  analyze: '开始分析',
  hiddenSubtext: '潜台词解析',
  culturalContext: '文化背景',
  surfaceMeaning: '表面意思',
  trueIntent: '真实意图',
  attackType: '操控类型',
  tacticalTip: '策略建议',
  replies: {
    minimal: '极简',
    gentle: '温和',
    boundary: '坚定'
  },
  copy: '复制',
  copied: '已复制',
  resultPattern: '识别到的模式',
  resultInsight: '深度洞察',
  resultResponse: '建议回应',
  beGentle: '对自己温柔一点，这不是您的错',
  clear: '清空',

  // 陪练场 / Simulator
  selectScenario: '选择场景',
  scenarioCategory: {
    family: '家庭关系',
    partner: '亲密关系',
    workplace: '职场边界',
    relative: '亲戚往来'
  },
  yourReply: '您的回复',
  coachFeedback: '教练反馈',
  neutralityScore: '中立分',
  excellent: '表现优秀！',
  needsImprovement: '还有提升空间',
  proTip: '小贴士',
  inputHint: '输入您的回复...',
  send: '发送',
  nextRound: '下一轮',
  reset: '重新开始',
  scoreAnalysis: '评分分析',
  jadeDetected: '检测到JADE行为',
  emotionDetected: '检测到情绪波动',
  noJade: '没有明显的JADE行为',
  calmResponse: '回应很冷静',
  betterReply: '更好的回复示例',
  opponent: '对方',
  you: '您',
  coach: '教练',

  // 呼吸 / Panic
  inhale: '吸气',
  hold: '屏息',
  exhale: '呼气',
  seconds: '秒',
  startBreathing: '开始呼吸',
  stopBreathing: '停止',
  breathingInstruction: '跟随动画，4秒吸气，7秒屏息，8秒呼气',
  emergencyContact: '如果感到极度不适，请联系：',
  mentalHealthHotline: '心理援助热线：',
  youAreSafe: '您现在很安全',
  breatheWithMe: '跟我一起呼吸',

  // 设置 / Settings
  settings: '设置',
  language: '语言',
  theme: '主题',
  dataManagement: '数据管理',
  exportData: '导出数据',
  clearAllData: '清除所有数据',
  clearDataConfirm: '确定要清除所有本地数据吗？此操作不可恢复。',
  about: '关于',
  version: '版本',

  // 历史 / History
  history: '历史记录',
  noHistory: '暂无历史记录',
  today: '今天',
  yesterday: '昨天',
  delete: '删除',

  // 导航
  dashboard: '首页',
  journal: '记录',

  // 提示信息
  comingSoon: '即将推出',
  offlineReady: '离线模式已就绪',
  networkError: '网络连接失败，请检查网络设置',
  tryAgain: '重试',
} as const;

export type ZH_CN_TYPE = typeof ZH_CN;
