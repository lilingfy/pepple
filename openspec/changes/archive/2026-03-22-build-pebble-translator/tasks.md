## 1. 环境准备

- [x] 1.1 安装 Zustand 和 Immer：`npm install zustand immer`，确认 `package.json` 版本写入
- [x] 1.2 确认 `tsconfig.json` 和 `tailwind.config` 中 `pebble` borderRadius 已定义，缺失则补全

## 2. 类型定义与 DTO

- [x] 2.1 新增 `apps/web/types/translator.ts`，定义 `DecodeRequest`、`DecodeResponse`（含 `surfaceMeaning`、`subtext`、`emotionStatus`、`emotionScore`、`replySuggestions: { A: string; B: string; C: string; strategy: { A: string; B: string; C: string } }`）、`PracticeRequest`（含 `primaryReply: string`、`originalText: string`）、`TranslatorState`（四态枚举）、`DecodeError`
- [x] 2.2 确认旧类型 `AnalysisResult`（含 `trueIntent`、`attackType`）从 `components/translator/index.ts` 移除，旧类型文件不得被引用

## 3. 后端接口字段对齐

- [x] 3.1 为 `apps/web/app/api/decode/route.ts` 编写测试：验证响应包含标准字段、不含旧字段
- [x] 3.2 修改 `route.ts`：将 AI 输出映射为标准响应字段（`surfaceMeaning`、`subtext`、`emotionStatus`、`emotionScore`、`replySuggestions.A/B/C` 及对应 `strategy.A/B/C`），移除旧字段透传
- [x] 3.3 运行 `route.ts` 测试，确认全部通过

## 4. 前端 API 客户端

- [x] 4.1 编写 `decode-client.ts` 测试：覆盖正常响应、超时（15s）、4xx/5xx 错误映射
- [x] 4.2 新增 `apps/web/lib/frontend/decode-client.ts`：封装 `POST /api/decode`，超时 15s，错误映射为 `DecodeError`
- [x] 4.3 编写 `practice-client.ts` 测试：覆盖正常保存、网络失败返回可识别错误类型
- [x] 4.4 新增 `apps/web/lib/frontend/practice-client.ts`：封装 `POST /api/practice`

## 5. Zustand Store

- [x] 5.1 编写 `translator-store.ts` 测试：覆盖四态转换、`setInput`、`decode`、`clearResult`、错误写入
- [x] 5.2 新增 `apps/web/store/translator-store.ts`：用 Zustand + Immer 实现四态状态机，`decode` action 调用 `decode-client`，写入结果或错误
- [x] 5.3 运行 store 测试，确认全部通过

## 6. 输入区组件

- [x] 6.1 编写 `InputArea.tsx` 测试：字符计数更新、500 字符上限拦截、空输入提交拦截、`analyzing` 态禁用输入
- [x] 6.2 新增 `apps/web/components/translator/InputArea.tsx`：多行输入、字符计数、复用 `PebbleInputShell` 作为容器，在 `analyzing` 态禁用
- [x] 6.3 编写 `EmotionStatusBar.tsx` 测试：`idle` 态隐藏、结果态展示 `emotionStatus` 文本和进度条、三档阈值样式映射
- [x] 6.4 新增 `apps/web/components/translator/EmotionStatusBar.tsx`：展示情绪标签和分数进度条，三档（calm / anxious / stressed）
- [x] 6.5 工具栏渲染语音和附件按钮（`disabled` 状态），通过 `InputArea` 测试验证按钮存在且不可点击

## 7. 解码按钮组件

- [x] 7.1 编写 `DecodeButton.tsx` 测试：`analyzing` 态 disabled 且展示 loading、`idle` / `result` / `error` 态可点击
- [x] 7.2 新增 `apps/web/components/translator/DecodeButton.tsx`：鹅卵石形状（`rounded-pebble`），CSS loading 动效，通过 store action 触发解码

## 8. 分析结果区组件

- [x] 8.1 编写 `AnalysisCard.tsx` 测试：渲染传入的 `label` 和 `content` 字段
- [x] 8.2 新增 `apps/web/components/translator/AnalysisCard.tsx`：复用 `GlassCard`，展示单张分析卡片
- [x] 8.3 编写 `AnalysisResult.tsx` 测试：结果态渲染 `surfaceMeaning` 和 `subtext` 两张卡片，不引用旧字段
- [x] 8.4 新增 `apps/web/components/translator/AnalysisResult.tsx`：组合两张 `AnalysisCard`，消费 `surfaceMeaning` 和 `subtext`

## 9. 回复建议区组件

- [x] 9.1 编写 `ReplySuggestionCard.tsx` 测试：渲染建议文本和 `strategy` 标签、复制按钮点击写入剪贴板并给出视觉反馈、保存按钮触发乐观写入且 `primaryReply` 为当前卡片文本
- [x] 9.2 新增 `apps/web/components/translator/ReplySuggestionCard.tsx`：单张建议卡片，展示建议文本和 `strategy` 策略标签，含复制和保存操作
- [x] 9.3 编写 `ReplySuggestions.tsx` 测试：A→B→C 顺序渲染、每张卡片的 `strategy` 标签正确对应、保存时 `primaryReply` 为被点击卡片文本（不固定为 A）、API 失败时展示 toast 不阻断主流程
- [x] 9.4 新增 `apps/web/components/translator/ReplySuggestions.tsx`：组合三张卡片，调用 `practice-client`，乐观写入 + 失败 toast

## 10. 页面重建

- [x] 10.1 编写 `translator-page.test.tsx`：覆盖四态渲染、三栏桌面布局、移动端堆叠、完整解码链路、建议保存链路
- [x] 10.2 重建 `apps/web/app/(main)/translator/page.tsx`：CSS Grid 三栏布局（`lg:grid-cols-12`，5-2-5 列比），接入 store，组合所有子组件
- [x] 10.3 移除旧 `components/translator/` 三个骨架文件（`DecoderInput.tsx`、`SubtextCard.tsx`、`ReplyOptions.tsx`），更新 `index.ts` 导出新组件
- [x] 10.4 运行全部 translator 测试，确认无旧字段引用残留（`trueIntent`、`attackType`、`replies.minimal` 等）

## 11. 响应式与视觉还原

- [x] 11.1 验证桌面端（≥ 768px）三栏并排，移动端垂直堆叠，无内容裁剪或布局错位
- [x] 11.2 补全解码按钮 CSS `@keyframes` loading 动效，与第二版 HTML 设计稿视觉对齐
- [x] 11.3 补全结果区和建议区的 reveal 过渡动效（`transition` + `opacity/transform`）

## 12. 回归验证

- [x] 12.1 运行全量测试 `npm test`，确认无新增失败
- [x] 12.2 手动验证：进入 `/translator`，完成一次完整解码链路（输入 → 解码 → 结果 → 复制建议）
- [x] 12.3 手动验证：移动端视口下核心操作可单手完成
- [x] 12.4 确认 `POST /api/decode` 响应不含旧字段，用 DevTools Network 面板验证
