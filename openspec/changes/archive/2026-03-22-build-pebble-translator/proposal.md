## 为什么

读心翻译器是 Pebble AI 的核心功能，现有 `/translator` 路由仅有组件骨架，缺少完整的状态管理、与后端的对接以及符合第二版设计稿的视觉还原。TB-001 首页已完成，具备跳转入口，现在需要把翻译器落地为可用的生产级页面。

## 变更内容

- 新增 `translator-store.ts`，管理输入态、加载态、结果态、错误态四种状态
- 重建 `/translator` 页面的三栏响应式布局（输入区 / 解码按钮 / 结果区）
- 实现输入区：多行文本、字符计数、情绪状态条（`EmotionStatusBar`）
- 实现解码按钮：鹅卵石形状、loading 动效，对接 `POST /api/decode`
- 实现结果区：表面语义卡片、潜台词卡片，字段对齐后端契约（`surfaceMeaning`、`subtext`、`emotionStatus`、`emotionScore`）
- 实现回复建议区：A/B/C 三张灰岩回复卡片，支持复制和保存到 `POST /api/practice`
- **BREAKING**：旧 `translator/page.tsx` 使用 `trueIntent`、`attackType`、`replies.minimal/gentle/boundary` 等旧字段，本次全部迁移为任务书定义的标准字段

## 功能 (Capabilities)

### 新增功能

- `translator-page`：读心翻译器完整页面，三栏布局、四态状态机、输入/解码/结果/建议完整链路

### 修改功能

- `pebble-design-system`：补充 `PebbleInputShell` 在翻译器场景的使用约束，无规范级行为变更，仅确认复用边界

## 影响

- `apps/web/app/(main)/translator/page.tsx`：重建
- `apps/web/components/translator/`：全部重建（InputArea、EmotionStatusBar、DecodeButton、AnalysisResult、AnalysisCard、ReplySuggestions、ReplySuggestionCard）
- `apps/web/store/translator-store.ts`：新增
- `apps/web/lib/frontend/decode-client.ts`：新增，封装 `POST /api/decode`
- `apps/web/lib/frontend/practice-client.ts`：新增，封装 `POST /api/practice`
- `apps/web/app/api/decode/route.ts`：响应字段对齐标准契约（`subtext`、`emotionStatus`、`emotionScore`、`replySuggestions`）
- 依赖：TB-005 设计系统已完成，TB-001 首页已完成，Zustand / Immer 待安装
