## 上下文

本次变更是对 Pebble AI 读心翻译器页面的 UI 精修，基于第二版设计稿（`pebble_translator.html`）对齐视觉规范。当前实现已具备完整功能（状态机、API 对接、响应式布局），但视觉层存在以下差距：

1. **标题区结构**：当前为简单标题，设计稿要求 AI 大字 + 竖线分隔的组合布局
2. **情绪状态条位置**：当前仅在 result 态显示，设计稿要求常驻
3. **组件异形圆角**：当前使用标准圆角，设计稿要求鹅卵石异形圆角
4. **动效系统**：当前缺少悬停位移、光晕、呼吸灯等微交互
5. **Header 图标区**：当前缺少通知和用户头像入口
6. **底部操作**：当前缺少复制和保存按钮组

### 当前状态

- 功能实现：Zustand 状态管理、decode-client 封装、API 对接已完成
- 组件拆分：InputArea、DecodeButton、EmotionStatusBar、AnalysisResult、ReplySuggestions 已模块化
- 响应式：三栏 Grid 布局（5-2-5）已实现

### 约束

- 不涉及后端 API 变更
- 不修改状态机逻辑
- 保持现有组件接口（props）向后兼容
- 新增样式仅通过 Tailwind className 注入

## 目标 / 非目标

**目标：**
- 精确还原设计稿视觉元素（异形圆角、光晕、装饰点、背景图案）
- 实现所有微交互动效（悬停旋转、位移复位、呼吸灯）
- 情绪状态条改为常驻显示，默认展示模拟数据
- Header 添加通知和用户头像占位
- 底部添加复制建议和存入练习本按钮

**非目标：**
- 不新增后端接口
- 不修改状态机（idle/analyzing/result/error）行为
- 不实现语音输入和附件上传功能（保持 disabled 占位）
- 不修改响应式断点策略

## 决策

### 决策 1: 异形圆角实现方式

**选择**：使用 Tailwind 任意值语法 `rounded-[...]` 直接内联

**理由**：
- 异形圆角（`45% 55% 70% 30% / 30% 40% 60% 70%`）无法通过设计系统预设变量精确表达
- 直接内联保持代码可读性，无需扩展 Tailwind 配置

**替代方案**：扩展 `tailwind.config.js` 添加自定义 borderRadius
- 否决原因：仅用于单个组件，配置扩展增加维护成本

### 决策 2: 情绪状态条常驻实现

**选择**：修改 `page.tsx`，将 EmotionStatusBar 从条件渲染改为常驻，通过 props 传入默认/真实数据

**理由**：
- 最小侵入：仅调整组件位置和 props 传递
- 状态兼容：保持 Zustand store 结构不变，默认值由页面层注入

**代码位置**：`apps/web/app/(main)/translator/page.tsx`

### 决策 3: 动效实现库

**选择**：纯 CSS Tailwind 动画（`animate-pulse`、`transition-transform`、`group-hover`）

**理由**：
- 无需引入 Framer Motion，减少运行时开销
- 简单动效（旋转、位移、透明度过渡）CSS 足够表达

**例外**：如需复杂编排动效（如解码按钮点击后的粒子效果），后续可局部引入 Framer Motion

### 决策 4: 背景装饰元素实现

**选择**：内联 SVG 组件，固定定位

**理由**：
- 设计稿中的鹅卵石形状是品牌识别元素，需精确还原路径
- 无需复用，内联在 page.tsx 即可

### 决策 5: 底部按钮组交互

**选择**：
- 复制建议：使用 Clipboard API，配合 Toast 反馈
- 存入练习本：复用现有 `practice-client.ts`，调用 `POST /api/practice`

**理由**：
- 复制功能无需后端，纯前端实现
- 保存功能已有封装，直接复用

## 风险 / 权衡

| 风险 | 缓解措施 |
|------|----------|
| 异形圆角在不同浏览器渲染差异 | 使用标准 CSS border-radius 语法，测试 Chrome/Safari/Firefox |
| 常驻情绪状态条与 result 态数据切换闪烁 | 添加过渡动画（opacity/width），默认数据与真实数据格式保持一致 |
| Header 图标区增加页面高度 | 使用 `fixed` 定位，不影响主内容区滚动 |
| Tailwind 类名过长影响可读性 | 使用 `cn()` 工具函数合并，复杂样式抽离为局部变量 |

## 组件修改清单

| 组件 | 修改内容 |
|------|----------|
| `page.tsx` | 标题区结构重构、情绪状态条位置迁移、背景装饰添加、底部按钮组添加 |
| `InputArea.tsx` | 容器异形圆角、内阴影样式 |
| `DecodeButton.tsx` | 异形圆角、光晕阴影、装饰点、悬停旋转动效 |
| `EmotionStatusBar.tsx` | 支持默认数据显示模式（心率 85%） |
| `AnalysisCard.tsx` | 区分 surface/subtext 异形圆角 |
| `ReplySuggestionCard.tsx` | 悬停位移、边框颜色、标签样式 |
| `ReplySuggestions.tsx` | 移除标题英文副标题（设计稿无此元素） |

## CSS 变量补充

需在 `globals.css` 或 Tailwind 配置中添加：

```css
--radius-pebble: 2rem 3rem 2.5rem 4rem;
--radius-pebble-alt: 4rem 2rem 3.5rem 2.5rem;
```

## 测试策略

1. **视觉回归测试**：对比设计稿和实现截图（Header、标题区、解码按钮、卡片）
2. **交互测试**：悬停动效、点击反馈、复制功能
3. **响应式测试**：移动端单列布局、桌面端三栏对齐
4. **功能回归**：状态流转、API 调用、保存到 practice
