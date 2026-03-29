# 关系洞察闭环系统设计文档

> Pebble AI - 智能关系分析与对话适配系统
> 版本: 1.0
> 日期: 2026-03-27

---

## 1. 目标与背景

### 1.1 问题定义

当前关系系统仅支持基础信息存储，缺乏：
- 对话中自动识别人格/行为模式的能力
- 渐进式人物画像构建
- 基于画像的针对性对话策略

### 1.2 解决方案

构建**关系洞察闭环系统**：

```
用户主动创建关系 → 对话互动 → AI自动分析 → 构建行为画像 → 沉淀洞察 → 针对性应对
```

---

## 2. 核心设计原则

| 原则 | 说明 |
|------|------|
| **去标签化** | 不直接诊断"NPD"，而是记录"观察到的行为模式" |
| **渐进累积** | 画像随对话次数逐步完善，非一次性判定 |
| **用户主权** | 用户可随时查看、编辑、删除AI的洞察记录 |
| **隐私优先** | 所有分析本地完成，不上传敏感对话 |

---

## 3. 系统架构

### 3.1 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    用户层                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ 关系图谱页   │  │ 聊天界面     │  │ 人物画像卡片         │ │
│  │ (添加/查看) │  │ (对话互动)   │  │ (行为模式可视化)      │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘ │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    服务层                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Relation    │  │ Chat        │  │ Profile Builder     │ │
│  │ Service     │──│ Service     │──│ Service             │ │
│  │ (CRUD)      │  │ (对话流)     │  │ (行为模式分析)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                  │                          │
│                                  ▼                          │
│                         ┌─────────────────┐                │
│                         │ Insight Engine  │                │
│                         │ (LLM分析管道)    │                │
│                         └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    数据层                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ relation_   │  │ chat_       │  │ behavior_           │ │
│  │ nodes       │  │ messages    │  │ patterns            │ │
│  │ (基础信息)   │  │ (原始对话)   │  │ (提炼的洞察)         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 核心数据流

```
1. 聊天触发分析
   用户发送消息 → Chat Service → Insight Engine(异步)

2. 行为模式提取
   Insight Engine → LLM分析 → 提取特征 → 存入 behavior_patterns

3. 渐进式画像
   累积"观察记录"而非一次性判定
   例: "第3次提到被贬低"、"频繁使用情感操控语言"

4. 策略适配
   下次对话 → Chat Service读取behavior_patterns → 调整系统提示词
```

---

## 4. 数据模型

### 4.1 扩展现有 Schema

```typescript
// behavior_patterns 表 - 行为洞察
interface BehaviorPattern {
  id: string;
  relationId: string;           // 关联的关系节点
  patternType: PatternType;     // 模式类型
  description: string;          // 观察描述(用户可见)
  evidence: string[];           // 证据引用(对话片段ID)
  confidence: number;           // 置信度 0-1
  frequency: number;            // 出现次数
  firstObserved: Date;
  lastObserved: Date;
  isActive: boolean;            // 是否仍在观察
  userAcknowledged: boolean;    // 用户是否确认
  createdAt: Date;
  updatedAt: Date;
}

// PatternType 枚举
enum PatternType {
  COMMUNICATION_STYLE = 'communication_style',  // 沟通风格
  EMOTIONAL_PATTERN = 'emotional_pattern',      // 情绪模式
  CONTROL_TACTICS = 'control_tactics',          // 控制策略
  BOUNDARY_BEHAVIOR = 'boundary_behavior',      // 边界行为
  CONFLICT_STYLE = 'conflict_style',            // 冲突风格
  EMPATHY_INDICATOR = 'empathy_indicator',      // 共情指标
}

// chat_messages 表 - 扩展现有
interface ChatMessage {
  id: string;
  relationId: string;
  role: 'user' | 'assistant';
  content: string;
  analysisMeta?: {
    sentiment?: 'negative' | 'neutral' | 'positive';
    topics?: string[];
    extractedPatterns?: string[];  // 本次提取的模式ID
  };
  timestamp: Date;
}

// relation_nodes 表 - 扩展
interface RelationNode {
  id: string;
  userId: string;
  name: string;
  tags: string[];
  relationshipType: string;
  // ... 现有字段

  // 新增：聚合画像
  profileSummary?: {
    dominantTraits: string[];     // 主导特征标签
    riskIndicators: string[];     // 风险指标(用户可见的描述)
    communicationTips: string[];  // 沟通建议
    lastAnalyzed: Date;
  };
}
```

---

## 5. Insight Engine 详细设计

### 5.1 分析触发策略

```typescript
// 触发条件(满足任一)
interface TriggerConditions {
  // 1. 消息数量阈值
  messageCount: number;        // 每5条消息触发一次

  // 2. 关键词触发
  keywords: string[];          // 负面情绪词、冲突词

  // 3. 时间窗口
  timeWindow: number;          // 对话持续15分钟

  // 4. 用户主动请求
  userRequest: boolean;        // "分析一下这段关系"
}
```

### 5.2 LLM 分析提示词模板

```markdown
## 角色
你是一位关系心理学观察助手。你的任务是从对话中提取行为模式，**不做诊断，只做观察记录**。

## 输入
关系背景: {relationContext}
近期对话: {recentMessages}
已有观察: {existingPatterns}

## 分析维度
1. 沟通风格: 直接/迂回、攻击性/防御性、理性/情绪化
2. 情绪模式: 波动频率、触发点、恢复速度
3. 边界行为: 尊重/侵犯个人边界的表现
4. 控制策略: 如有，具体手段( guilt-tripping, gaslighting等)
5. 共情指标: 理解他人感受的能力表现

## 输出格式 (JSON)
{
  "newPatterns": [
    {
      "type": "control_tactics",
      "description": "对方在沟通中多次使用'如果你爱我，你就会...'这类句式",
      "evidence": ["msg_id_1", "msg_id_2"],
      "confidence": 0.85,
      "userFriendlyDescription": "对方似乎倾向于用情感义务来表达需求"
    }
  ],
  "updatedPatterns": [
    {
      "patternId": "existing_id",
      "newEvidence": ["msg_id_3"],
      "frequencyDelta": 1
    }
  ],
  "summaryUpdate": {
    "dominantTraits": ["情感表达直接", "倾向控制对话节奏"],
    "riskIndicators": ["使用 guilt-tripping 策略"],
    "communicationTips": ["明确表达边界", "不被情感义务绑架"]
  }
}

## 重要约束
- 不要下诊断结论(如"NPD")
- 用描述性语言，不用标签
- 每个观察必须有对话证据
```

### 5.3 增量分析策略

```typescript
// 避免重复分析，采用增量模式
async function analyzeConversation(
  relationId: string,
  newMessages: ChatMessage[]
): Promise<AnalysisResult> {
  // 1. 获取未分析的消息
  const unanalyzed = await getUnanalyzedMessages(relationId);

  // 2. 获取已有模式(作为上下文)
  const existingPatterns = await getExistingPatterns(relationId);

  // 3. 批量分析(减少LLM调用)
  const batchSize = 5;
  const batches = chunk(unanalyzed, batchSize);

  for (const batch of batches) {
    const result = await insightEngine.analyze({
      relationContext: await getRelationContext(relationId),
      recentMessages: batch,
      existingPatterns: existingPatterns,
    });

    // 4. 合并结果
    await mergeAnalysisResults(relationId, result);
  }
}
```

---

## 6. 对话策略适配

### 6.1 策略映射表

```typescript
// 根据行为模式调整对话策略
const StrategyMap: Record<PatternType, StrategyConfig> = {
  [PatternType.CONTROL_TACTICS]: {
    // 检测到控制策略
    emphasis: ['边界设定', '自我确认', '不被情感绑架'],
    socraticFocus: '帮助用户识别操控模式，强化自主决策',
    tone: 'supportive_but_firm',
  },
  [PatternType.EMOTIONAL_PATTERN]: {
    // 情绪模式分析
    emphasis: ['情绪识别', '应对策略', '自我照顾'],
    socraticFocus: '探索情绪背后的需求和触发点',
    tone: 'empathetic',
  },
  [PatternType.EMPATHY_INDICATOR]: {
    // 共情能力指标
    emphasis: ['有效沟通', '相互理解', '关系建设'],
    socraticFocus: '探索双方需求和期望',
    tone: 'collaborative',
  },
};
```

### 6.2 动态系统提示词生成

```typescript
function buildAdaptivePrompt(
  basePrompt: string,
  behaviorPatterns: BehaviorPattern[]
): string {
  const activePatterns = behaviorPatterns.filter(p => p.isActive);

  let adaptiveContext = '\n\n【当前关系洞察】\n';

  for (const pattern of activePatterns) {
    adaptiveContext += `- ${pattern.description}\n`;
  }

  // 添加策略指导
  adaptiveContext += '\n【对话策略】\n';
  adaptiveContext += generateStrategyGuidance(activePatterns);

  return basePrompt + adaptiveContext;
}
```

---

## 7. 用户界面设计

### 7.1 人物画像卡片

```
┌─────────────────────────────────────────┐
│  👤 小王 (同事)                          │
├─────────────────────────────────────────┤
│  📊 观察记录 (基于 12 次对话)             │
│                                         │
│  沟通风格                                │
│  ├─ 倾向用反问表达不满 ████████░░ 8次    │
│  ├─ 回避直接讨论问题  ██████░░░░ 6次     │
│                                         │
│  边界行为                                │
│  ├─ 在非工作时间发工作消息 ████░░░░░░ 4次 │
│                                         │
│  💡 沟通建议                             │
│  • 明确工作时间边界                      │
│  • 直接表达需求，不猜测对方意图          │
│                                         │
│  [查看详细] [编辑] [删除记录]            │
└─────────────────────────────────────────┘
```

### 7.2 聊天界面增强

```
┌─────────────────────────────────────────┐
│  🔍 实时洞察 (仅在用户展开时显示)         │
├─────────────────────────────────────────┤
│  用户: "他又说我不够努力..."              │
│                                         │
│  ┌─ 💡 模式识别 ──────────────────────┐ │
│  │  类似表述之前出现过 3 次              │ │
│  │  可能的模式: 贬低 + 期望控制          │ │
│  └──────────────────────────────────────┘ │
│                                         │
│  AI: "听起来这种评价让你感到..."         │
└─────────────────────────────────────────┘
```

---

## 8. 关键实现细节

### 8.1 性能优化

```typescript
// 1. 分析任务异步化
// 用户发送消息 → 立即返回AI回复 → 后台触发分析

// 2. 批处理减少LLM调用
const AnalysisScheduler = {
  queue: new Map<string, ChatMessage[]>(),

  schedule(relationId: string, message: ChatMessage) {
    if (!this.queue.has(relationId)) {
      this.queue.set(relationId, []);
      // 5分钟后执行批量分析
      setTimeout(() => this.executeBatch(relationId), 5 * 60 * 1000);
    }
    this.queue.get(relationId)!.push(message);
  },

  async executeBatch(relationId: string) {
    const messages = this.queue.get(relationId);
    this.queue.delete(relationId);
    await insightEngine.analyzeBatch(relationId, messages!);
  }
};

// 3. 本地缓存已分析结果
const patternCache = new LRUCache<string, BehaviorPattern[]>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5分钟
});
```

### 8.2 隐私与安全

```typescript
// 1. 敏感词脱敏
function sanitizeForAnalysis(content: string): string {
  return content
    .replace(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, '[姓名]')  // 人名
    .replace(/\b\d{11}\b/g, '[手机号]')                 // 手机号
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[邮箱]');
}

// 2. 用户控制
interface UserPrivacySettings {
  enableAutoAnalysis: boolean;    // 是否开启自动分析
  analysisDepth: 'basic' | 'deep'; // 分析深度
  dataRetention: number;          // 数据保留天数
}
```

---

## 9. 测试策略

### 9.1 单元测试

```typescript
// Insight Engine 测试
describe('InsightEngine', () => {
  it('should extract control tactics pattern', async () => {
    const messages = [
      { role: 'user', content: '他说如果我在乎他，就会 quit 工作' },
    ];

    const result = await engine.analyze({ messages });

    expect(result.newPatterns).toContainEqual(
      expect.objectContaining({
        type: PatternType.CONTROL_TACTICS,
        description: expect.stringContaining('情感义务'),
      })
    );
  });
});
```

### 9.2 集成测试

```typescript
// 完整闭环测试
describe('Relation Insight Loop', () => {
  it('should update chat strategy based on patterns', async () => {
    // 1. 创建关系
    const relation = await createRelation({ name: '测试对象' });

    // 2. 模拟对话
    await simulateChat(relation.id, mockMessages);

    // 3. 触发分析
    await triggerAnalysis(relation.id);

    // 4. 验证画像更新
    const profile = await getProfile(relation.id);
    expect(profile.patterns.length).toBeGreaterThan(0);

    // 5. 验证策略适配
    const prompt = await buildChatPrompt(relation.id);
    expect(prompt).toContain('沟通风格');
  });
});
```

---

## 10. 里程碑与交付物

| 阶段 | 交付物 | 验收标准 |
|------|--------|----------|
| M1 | 数据模型 + API | behavior_patterns表可用，CRUD接口测试通过 |
| M2 | Insight Engine | 能正确提取至少3种行为模式，置信度>0.7 |
| M3 | 画像展示组件 | 人物画像卡片正常渲染，支持展开/收起 |
| M4 | 策略适配 | 对话系统能根据画像动态调整提示词 |
| M5 | 完整闭环 | E2E测试通过，用户完整体验一次闭环 |

---

## 11. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| LLM误判 | 高 | 设置置信度阈值，用户确认机制 |
| 隐私泄露 | 高 | 本地分析，数据脱敏，用户可控 |
| 分析延迟 | 中 | 异步处理，批处理优化 |
| 用户抵触 | 中 | 去标签化，强调观察而非诊断 |

---

## 附录

### A. 参考资源

1. [The Narcissist In Your Life - Julie L. Hall](https://www.bookey.app/book/the-narcissist-in-your-life)
2. [Socratic Questioning in Therapy](https://www.therapistaid.com/therapy-guide/mastering-socratic-questioning)
3. [GraphRAG + 知识图谱实现永久记忆](https://www.cnblogs.com/yangykaifa/p/19171267)

### B. 术语表

| 术语 | 定义 |
|------|------|
| Insight Engine | 行为模式分析引擎 |
| Behavior Pattern | 从对话中提取的观察性模式 |
| Profile Summary | 聚合的人物画像摘要 |
| Strategy Adaptation | 根据画像调整对话策略 |
