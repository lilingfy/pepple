## 为什么

模拟陪练场是 Pebble AI 的核心练习功能，让用户在真实冲突发生前进行安全模拟。目前项目已有首页、翻译器、呼吸页的实现，但缺少关键的对话练习模块。按照 TB-003 任务书规划，该模块依赖 TB-005 设计系统和 TB-002 翻译器的基础能力，现条件已成熟，需完成此核心功能闭环。

## 变更内容

1. **新增模拟陪练场页面** (`/dojo`): 三栏固定布局（左侧场景选择、中央聊天区、右侧实时分析）
2. **新增场景选择功能**: 支持职场越界、亲密关系、社交应对三种预设场景切换
3. **新增聊天对话系统**: AI 扮演压力源角色，用户输入回复，完整的消息收发、气泡样式、鹅卵石头像
4. **新增实时情绪分析面板**: 圆形得分圆环（0-100分）、等级标签、即时反馈与注意点提示
5. **新增会话管理**: 开始/继续/重启/结束演练的完整状态流转，明确 `start`（首次创建会话）、`turn`（继续对话）、`restart`（重置当前场景）、`end`（结束并获取总结）四种语义
6. **新增后端 API 接口**:
   - `GET /api/scenarios` - 获取场景列表
   - `POST /api/simulator` - 开始新会话（无 sessionId）或继续会话（携带 sessionId）
   - `POST /api/simulator/[sessionId]/end` - 结束会话获取总结
7. **响应式适配**: 桌面三栏布局与移动端折叠侧边栏

## 功能 (Capabilities)

### 新增功能
- `dojo-page`: 模拟陪练场页面整体结构与路由
- `dojo-scenarios`: 场景选择与心理语境展示
- `dojo-chat`: 聊天对话系统（消息列表、输入区、消息气泡）
- `dojo-coaching`: 实时情绪分析与陪练建议面板
- `dojo-session`: 会话状态管理与生命周期控制
- `api-simulator`: 模拟陪练后端 API（场景、会话、结束总结）

### 修改功能
- 无（本变更仅新增功能，不修改现有规范）

## 影响

### 前端代码
- **新增文件**:
  - `apps/web/app/(main)/dojo/page.tsx`
  - `apps/web/components/dojo/DojoPage.tsx`
  - `apps/web/components/dojo/ScenarioPanel.tsx`
  - `apps/web/components/dojo/ContextCard.tsx`
  - `apps/web/components/dojo/TipsCard.tsx`
  - `apps/web/components/dojo/ChatArea.tsx`
  - `apps/web/components/dojo/MessageList.tsx`
  - `apps/web/components/dojo/MessageBubble.tsx`
  - `apps/web/components/dojo/ChatInput.tsx`
  - `apps/web/components/dojo/CoachingPanel.tsx`
  - `apps/web/components/dojo/EmotionScoreCard.tsx`
  - `apps/web/components/dojo/FeedbackCard.tsx`
  - `apps/web/components/dojo/EndSessionButton.tsx`
  - `apps/web/components/dojo/SessionSummaryDialog.tsx`
  - `apps/web/store/dojo-store.ts`
  - `apps/web/lib/frontend/scenario-client.ts`
  - `apps/web/lib/frontend/simulator-client.ts`
  - `apps/web/types/dojo.ts`

- **修改文件**:
  - `apps/web/app/globals.css` - 新增 dojo 专用样式（消息气泡圆角：`AI 左侧 0.5rem 2rem 2.5rem 2rem`，`用户右侧 2rem 0.5rem 2rem 2.5rem`）

### 后端代码
- **新增文件**:
  - `apps/web/app/api/scenarios/route.ts`
  - `apps/web/app/api/simulator/route.ts`
  - `apps/web/app/api/simulator/[sessionId]/end/route.ts`
  - `apps/web/lib/backend/services/simulator-service.ts`
  - `apps/web/lib/backend/dto/simulator.ts`
  - `apps/web/lib/backend/types/simulator.ts`

### API 契约

**语义说明**:
- `start`: 首次进入场景，创建新会话（不携带 sessionId）
- `turn`: 继续当前会话对话（携带 sessionId + message）
- `restart`: 重置当前场景，清空消息历史（携带原 sessionId，后端返回新 sessionId）
- `end`: 结束会话，获取完整总结（携带 sessionId）

**GET /api/scenarios**
```typescript
interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  context: string;
  goal: string;
  tips: Array<{ name: string; description: string }>;
}
// Response: { scenarios: Scenario[] }
```

**POST /api/simulator**
```typescript
interface SimulatorRequest {
  scenarioId: string;
  sessionId?: string;  // 首次为空，后续携带
  message?: string;    // 用户回复内容
}

interface SimulatorResponse {
  sessionId: string;
  aiResponse: string;
  rightPanel: {
    analysisScore: number;      // 0-100
    analysisLabel: string;      // 优秀/良好/一般/需改进
    analysisSummary: string;    // 评语
    instantFeedback: string;    // 即时反馈
    attentionPoint: string;     // 注意点
  };
}
```

**POST /api/simulator/[sessionId]/end**
```typescript
interface EndSessionResponse {
  finalScore: number;
  overallFeedback: string;
  improvements: string[];
  sessionDuration: number;
}
```

### 依赖
- **设计系统**: TB-005 设计系统（GlassCard、StatusPill、鹅卵石圆角等）
- **前端基础**: 已完成的翻译器页面实现（复用部分组件模式）
- **后端基础**: TB-006 后端 BFF 架构
- **AI 服务**: 情绪分析与角色扮演能力（外部 LLM 调用）

### 非目标
- 本变更不包含语音输入功能的完整后端实现（仅 UI 占位）
- 不包含用户历史会话持久化存储（仅当前会话状态）
- 不包含多语言支持

### 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| AI 响应延迟 | 用户体验差 | 添加打字指示器、超时处理、降级到预设回复 |
| 情绪评分不准确 | 用户信任度下降 | 提供人工反馈入口、持续优化提示词 |
| 移动端三栏布局拥挤 | 可用性降低 | 侧边栏折叠/抽屉式设计 |
| 会话状态丢失 | 用户数据丢失 | 定期本地缓存、恢复提示 |

### TDD 策略

**Red - 编写失败的测试**
- 单元测试：场景选择、消息气泡、得分圆环等组件渲染
- 集成测试：会话状态流转（start → turn → restart → end）
- API 测试：scenarios、simulator、end 接口契约验证

**Green - 实现使测试通过**
- 按执行清单子任务 1→7 顺序实现
- 先冻结状态模型，再写界面
- 先 mock 后端，再实现真实 API

**Refactor - 重构优化**
- 提取通用 hooks（useSession、useChat）
- 复用 TB-005 设计系统组件
- 优化长消息滚动和输入聚焦

**Document - 文档补充**
- 更新执行清单完成状态
- 补充组件 Storybook（如启用）
- 更新 API 文档

### 测试映射

| 用户场景 | 测试覆盖 |
|---------|---------|
| 用户进入陪练场页面 | `dojo-page.test.tsx` - 渲染检查 |
| 用户切换场景 | `dojo-page.test.tsx` - 场景切换交互 |
| 用户开始新会话 | `dojo-session.test.ts` - 会话初始化 |
| 用户发送消息 | `chat-area.test.tsx` - 消息发送、simulator-client.test.ts |
| AI 回复显示 | `message-bubble.test.tsx` - 气泡渲染、消息列表更新 |
| 实时情绪分析更新 | `emotion-score-card.test.tsx` - 圆环动画、得分变化 |
| 用户结束演练 | `end-session-button.test.tsx` - 结束流程、总结展示 |
| 移动端完整会话 | e2e 测试 - 折叠侧边栏、完整流程 |

### 验收标准

- [ ] 三栏布局稳定，桌面与移动端都能完成完整会话
- [ ] 三个场景（职场越界、亲密关系、社交应对）可正常切换
- [ ] 消息收发链路完整，AI 回复符合场景角色设定
- [ ] 消息气泡圆角符合设计规范（AI 左侧 `0.5rem 2rem 2.5rem 2rem`，用户右侧 `2rem 0.5rem 2rem 2.5rem`）
- [ ] 情绪得分圆环随用户回复实时更新（0-100分，四级颜色）
- [ ] 右侧分析面板显示 `analysisScore`、`analysisLabel`、`analysisSummary`、`instantFeedback`、`attentionPoint`
- [ ] 会话开始/继续/重启/结束状态流转正确
- [ ] 重启功能可清空消息历史并重新开始当前场景
- [ ] 所有测试通过，代码符合 TypeScript 严格模式

---

**参考文件**:
- 设计稿（唯一真相源）: `/docs/frontend/pebble_dojo.html`
- 任务书: `/docs/taskbook/TB-003-模拟陪练场技术预研.md`
- 执行清单: `/docs/taskbook/TB-003-执行清单.md`
- 项目索引: `/docs/taskbook/01-项目概述与索引.md`
