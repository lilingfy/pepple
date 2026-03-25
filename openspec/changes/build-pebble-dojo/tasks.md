# Build Pebble Dojo - 任务清单

## 1. 页面路由与会话状态骨架

- [x] 1.1 创建 Dojo 类型定义 (`apps/web/types/dojo.ts`)
  - 定义 Scenario、Message、ChatState、SessionState 类型
  - 验证命令: `tsc --noEmit`
  - 完成定义: 所有类型无错误，符合 spec 要求

- [x] 1.2 创建 Dojo Store (`apps/web/store/dojo-store.ts`)
  - 使用 Zustand + Immer 实现会话状态管理
  - 实现 selectScenario、sendMessage、restartSession、endSession 动作
  - 验证命令: `tsc --noEmit && npm test dojo-store.test.ts`
  - 完成定义: store 测试通过，状态流转正确

- [x] 1.3 创建 Dojo 页面路由 (`apps/web/app/(main)/dojo/page.tsx`)
  - 搭建三栏布局骨架（ScenarioPanel、ChatArea、CoachingPanel 占位）
  - 验证命令: `npm run dev` 访问 `/dojo` 正常显示
  - 完成定义: 页面可访问，三栏布局可见

- [ ] 1.4 编写 Dojo Store 测试 (`apps/web/tests/frontend/dojo-store.test.ts`)
  - 测试状态初始值、场景选择、消息发送、会话结束
  - 验证命令: `npm test dojo-store.test.ts`
  - 完成定义: 所有测试用例通过

## 2. 左侧场景与技巧面板

- [x] 2.1 创建场景 Client (`apps/web/lib/frontend/scenario-client.ts`)
  - 实现 `getScenarios()` 函数，调用 `GET /api/scenarios`
  - 验证命令: `tsc --noEmit`
  - 完成定义: client 类型正确，错误处理完整

- [x] 2.2 创建场景面板组件 (`apps/web/components/dojo/ScenarioPanel.tsx`)
  - 实现三个场景标签切换，当前场景高亮
  - 验证命令: `npm test scenario-panel.test.tsx`
  - 完成定义: 点击切换场景，UI 同步更新

- [x] 2.3 创建心理语境卡片 (`apps/web/components/dojo/ContextCard.tsx`)
  - 显示情境描述和达成目标
  - 验证命令: `npm test context-card.test.tsx`
  - 完成定义: 场景切换后内容同步更新

- [x] 2.4 创建技巧锦囊卡片 (`apps/web/components/dojo/TipsCard.tsx`)
  - 显示技巧列表（名称 + 说明）
  - 验证命令: `npm test tips-card.test.tsx`
  - 完成定义: 技巧正确渲染，样式符合设计稿

## 3. 中央聊天区和输入区

- [x] 3.1 创建 Simulator Client (`apps/web/lib/frontend/simulator-client.ts`)
  - 实现 `startSession(scenarioId)`、`sendMessage(sessionId, message)`、`restartSession(sessionId)`、`endSession(sessionId)`
  - 验证命令: `tsc --noEmit`
  - 完成定义: 所有方法类型正确，错误处理完整

- [x] 3.2 创建聊天区组件 (`apps/web/components/dojo/ChatArea.tsx`)
  - 整合 MessageList 和 ChatInput
  - 验证命令: `npm run dev` 聊天区正常显示
  - 完成定义: 组件渲染无错误

- [x] 3.3 创建消息列表 (`apps/web/components/dojo/MessageList.tsx`)
  - 支持滚动，自定义滚动条样式
  - 验证命令: `npm test message-list.test.tsx`
  - 完成定义: 长消息可滚动，滚动条样式正确

- [x] 3.4 创建消息气泡 (`apps/web/components/dojo/MessageBubble.tsx`)
  - AI 左侧（slate-200/80，圆角 0.5rem 2rem 2.5rem 2rem）
  - 用户右侧（moss-green/60，圆角 2rem 0.5rem 2rem 2.5rem）
  - 验证命令: `npm test message-bubble.test.tsx`
  - 完成定义: 气泡样式、圆角、头像符合设计稿

- [x] 3.5 创建聊天输入区 (`apps/web/components/dojo/ChatInput.tsx`)
  - 圆角输入框、鹅卵石发送按钮、语音输入和重启入口
  - 验证命令: `npm test chat-input.test.tsx`
  - 完成定义: 输入、发送、重启功能正常

## 4. 右侧实时分析面板

- [x] 4.1 创建陪练面板 (`apps/web/components/dojo/CoachingPanel.tsx`)
  - 整合 EmotionScoreCard、FeedbackCard、EndSessionButton
  - 验证命令: `npm run dev` 面板正常显示
  - 完成定义: 组件渲染无错误

- [x] 4.2 创建情绪得分卡片 (`apps/web/components/dojo/EmotionScoreCard.tsx`)
  - 圆形圆环、0-100 分、四级颜色、动画过渡
  - 验证命令: `npm test emotion-score-card.test.tsx`
  - 完成定义: 分数变化时圆环动画，颜色正确

- [x] 4.3 创建反馈卡片 (`apps/web/components/dojo/FeedbackCard.tsx`)
  - 显示即时反馈和注意点
  - 验证命令: `npm test feedback-card.test.tsx`
  - 完成定义: rightPanel 五个字段正确显示

- [x] 4.4 创建结束演练按钮 (`apps/web/components/dojo/EndSessionButton.tsx`)
  - 鹅卵石圆角，点击调用 endSession
  - 验证命令: `npm test end-session-button.test.tsx`
  - 完成定义: 点击触发结束流程

## 5. 后端 API 实现

- [x] 5.1 创建 Simulator DTO (`apps/web/lib/backend/dto/simulator.ts`)
  - 定义 SimulatorRequestDTO、SimulatorResponseDTO、EndSessionResponseDTO
  - 验证命令: `tsc --noEmit`
  - 完成定义: DTO 类型完整，符合契约

- [x] 5.2 创建 Simulator Service (`apps/web/lib/backend/services/simulator-service.ts`)
  - 实现 startSession、processTurn、restartSession、endSession
  - 验证命令: `npm test simulator-service.test.ts`
  - 完成定义: 所有方法测试通过

- [x] 5.3 实现 Scenarios API (`apps/web/app/api/scenarios/route.ts`)
  - GET 返回三个预设场景
  - 验证命令: `curl /api/scenarios` 返回正确数据
  - 完成定义: API 返回符合契约

- [x] 5.4 实现 Simulator API (`apps/web/app/api/simulator/route.ts`)
  - POST 支持 start/turn/restart 语义
  - 验证命令: `npm test api-simulator.test.ts`
  - 完成定义: 三种操作均正常工作

- [x] 5.5 实现 End Session API (`apps/web/app/api/simulator/[sessionId]/end/route.ts`)
  - POST 返回会话总结
  - 验证命令: `npm test api-end-session.test.ts`
  - 完成定义: 结束接口返回正确数据

## 6. 响应式与交互稳定性

- [ ] 6.1 实现移动端侧边栏折叠
  - 桌面三栏，移动端抽屉式折叠
  - 验证命令: Chrome DevTools 切换设备尺寸测试
  - 完成定义: 移动端可完成完整会话

- [ ] 6.2 处理长消息和键盘遮挡
  - 消息自动滚动、输入聚焦处理
  - 验证命令: 手动测试长消息和移动端键盘
  - 完成定义: 长消息不破坏布局，键盘不遮挡输入

- [ ] 6.3 实现 AI fallback 机制
  - 超时/异常时返回预设回复
  - 验证命令: `npm test simulator-fallback.test.ts`
  - 完成定义: 服务异常时 UI 正常降级

## 7. 集成测试与回归

- [ ] 7.1 编写 Dojo 页面集成测试 (`apps/web/tests/frontend/dojo-page.test.tsx`)
  - 场景切换、消息发送、情绪分析更新、结束演练全流程
  - 验证命令: `npm test dojo-page.test.tsx`
  - 完成定义: 主流程测试通过

- [ ] 7.2 编写 E2E 测试 (`apps/web/tests/e2e/dojo.spec.ts`)
  - Playwright 完整用户流程测试
  - 验证命令: `npm run test:e2e dojo`
  - 完成定义: E2E 测试通过

- [ ] 7.3 更新执行清单和文档
  - 标记 TB-003-执行清单.md 完成项
  - 验证命令: 清单所有项已勾选
  - 完成定义: 文档同步完成
