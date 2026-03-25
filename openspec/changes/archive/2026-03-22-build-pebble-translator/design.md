## 上下文

读心翻译器页面（`/translator`）目前仅有组件骨架，使用旧字段名（`trueIntent`、`attackType`、`replies.minimal`）且无状态管理。本次变更需要：
1. 重建页面状态机（四态：idle / analyzing / result / error）
2. 对齐后端契约字段（`surfaceMeaning`、`subtext`、`emotionStatus`、`emotionScore`、`replySuggestions`）
3. 还原第二版设计稿的三栏响应式布局
4. 接入 `POST /api/decode` 和 `POST /api/practice`

当前约束：Zustand / Immer 尚未安装，`/api/decode` 返回旧字段，`components/translator/` 目录下三个组件均需替换。

## 目标 / 非目标

**目标：**
- 用 Zustand 管理翻译器的四种页面状态
- 按第二版 HTML 实现三栏桌面布局 + 移动端垂直堆叠
- 输入区、解码按钮、结果区、建议区全链路可用
- `POST /api/decode` 响应字段与任务书契约对齐
- 支持复制建议和 `POST /api/practice` 保存入口
- 工具栏渲染语音输入按钮和附件按钮 UI 入口（按钮可见可点击，点击事件暂不接真实逻辑，使用 disabled 或空函数占位）

**非目标：**
- 不实现语音输入功能（Web Speech API 有浏览器兼容性问题，待单独调研）
- 不实现附件上传功能（需要后端存储支持，TB-006 待启动）
- 不实现历史记录持久化（IndexedDB）
- 不修改 `/api/decode` 的 AI 模型或 prompt 策略，仅对齐响应字段

## 决策

### 1. 状态管理：Zustand + Immer，不用 Context

翻译器存在跨组件共享的加载状态、结果数据和错误信息，用 prop drilling 会造成组件耦合。选择 Zustand（轻量、无 Provider 样板），配合 Immer 做嵌套状态更新。

备选方案：
- React Context + useReducer：样板代码多，无 devtools 支持。
- 纯组件本地 useState：结果数据无法在 DecodeButton 和 ResultSection 之间共享，需要状态提升到 page 级，可维护性差。

### 2. 布局：CSS Grid 三栏，不用 Flexbox

桌面端三栏（5-2-5 列比）用 `grid-cols-12` 精确控制列宽，移动端通过 `md:grid-cols-12` 切换为单列堆叠。Flexbox 在三列等比布局上需要额外 `flex-basis` 控制，Grid 更直观。

### 3. API 响应字段迁移：后端适配前端契约，不反向修改前端

第二版 HTML 是唯一真相源。旧的 `trueIntent` / `attackType` / `replies.minimal` 是早期实现偏差，本次在 `route.ts` 中将 AI 输出映射为标准字段（`subtext`、`emotionStatus`、`emotionScore`、`replySuggestions[A/B/C]`），前端只消费标准字段。

备选方案：
- 保留旧字段，前端做兼容适配层：增加维护成本，掩盖设计问题，不选。

### 4. 解码客户端：封装为独立 `decode-client.ts`，不在组件内直接 fetch

将 `POST /api/decode` 的请求封装、超时、错误映射统一放在 `lib/frontend/decode-client.ts`，组件只调用函数、处理返回值。好处：便于 mock、便于替换接口、便于单元测试。

### 5. `practice` 保存：乐观写入，失败静默提示

用户点击"存入练习本"后立即显示"已保存"反馈，后台发起 `POST /api/practice`。失败时降级为 toast 提示，不阻断主流程（翻译器的核心价值是解码，保存是辅助功能）。

## 风险 / 权衡

- [Zustand / Immer 未安装] → 实现前先 `npm install zustand immer`，安装不引入破坏性变更。
- [API 字段迁移破坏现有功能] → 旧 `translator/page.tsx` 使用旧字段，重建后旧代码会被完全替换，不存在兼容性问题。
- [第二版设计稿与任务书字段定义局部不一致] → 以任务书执行清单为准，设计稿仅作视觉参考。
- [Framer Motion 未安装，解码按钮需要动效] → 用 CSS `transition` + `@keyframes` 替代 Framer Motion 动效，视觉效果等价，无运行时依赖增加。
- [practice API 尚未完整实现（TB-006 待启动）] → 前端只实现请求封装和 UI 入口，后端 404 时降级处理，不阻断翻译器主流程。

## 迁移计划

1. 安装 Zustand + Immer。
2. 新建 `translator-store.ts`，定义四态状态机。
3. 重建 `components/translator/` 下所有组件（替换旧骨架）。
4. 修改 `api/decode/route.ts` 对齐标准响应字段。
5. 新增 `lib/frontend/decode-client.ts` 和 `practice-client.ts`。
6. 重建 `translator/page.tsx`，接入 store 和新组件。
7. 运行测试回归，确认无旧字段引用残留。

## 开放问题

- `emotionStatus` 和 `emotionScore` 由 AI 直接输出还是前端根据关键词推算？当前方案：交由 AI prompt 决定，route.ts 透传。
- 情绪状态条的三档阈值（calm / anxious / stressed）是否需要产品确认？当前方案：score < 40 为 calm，40-70 为 anxious，> 70 为 stressed。
