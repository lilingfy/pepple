## 上下文

急救呼吸页（`/breathing`）已有路由骨架，但尚无任何交互逻辑。本次变更需在纯前端环境中实现完整的 4-7-8 呼吸引导体验，完全基于第二版设计稿 `docs/frontend/pebble_breathing.html` 的 CSS 动画方案。

设计稿真相源：`docs/frontend/pebble_breathing.html`（第二版）。

## 目标 / 非目标

**目标：**
- 实现 CSS 驱动的呼吸动画（19s 循环：吸气 4s / 屏息 7s / 呼气 8s）
- 实现倒计时与呼吸动画同步暂停/继续
- 完整还原设计稿视觉：正圆呼吸圆、背景浮动球体、光晕扩散效果
- 支持 `prefers-reduced-motion`，降级为静态显示
- 点击呼吸圆可暂停/继续所有动画

**非目标：**
- 不使用 React 状态机管理呼吸阶段（设计稿采用纯 CSS 方案）
- 不引入后端接口或持久化存储
- 不新增设计系统规范（复用现有设计令牌）
- 不实现呼吸历史记录或用户配置

## 决策

### 1. 纯 CSS 动画 vs React 状态机

**决策**：采用设计稿指定的纯 CSS 动画方案（`@keyframes etherealBreathing` 19s 循环），而非 React 状态机 + Framer Motion。

**理由**：
- 忠实还原设计稿第二版，该版本明确使用 CSS 动画
- CSS 动画在 60fps 性能更优，不占用 React 渲染周期
- 暂停/继续可通过 `animation-play-state` 简单实现，无需管理复杂状态
- 减少运行时依赖（无需 Framer Motion）

**替代方案**：React 状态机 + Framer Motion → 已被设计稿否决，过度设计。

### 2. 文案同步机制

**决策**：使用 CSS 自定义属性（`--status-text`、`--instruction-text`）+ `@keyframes` 同步切换文案，而非 React 状态。

**理由**：
- 与呼吸圆缩放动画完全同步（同为 19s 周期）
- 无需 JavaScript 介入，性能最优
- 暂停时 CSS 动画自动暂停，文案同步停止

### 3. 暂停/继续实现

**决策**：点击呼吸圆切换父容器的 `.paused` 类，通过 CSS `.paused * { animation-play-state: paused }` 控制所有动画。

**理由**：
- 一次性控制所有动画（呼吸圆、文案、倒计时）
- 实现简单，无需跟踪多个独立状态
- 倒计时通过 React state 控制，与 CSS 动画状态保持同步

### 4. 倒计时联动

**决策**：倒计时使用 React `useState` + `setInterval`，在暂停时 `clearInterval`，继续时重新启动。

**理由**：
- 倒计时需要精确到秒，CSS 无法提供可靠计时
- 与 CSS 动画状态保持同步（暂停时停止，继续时恢复）

### 5. 组件结构

```
BreathingPage          ← 完整页面组件（包含 Header、Main、Footer）
├── Header             ← 导航栏（Logo、主导航、用户操作）
├── Main
│   ├── TitleSection   ← 标题区（英文副标题、中文标题、装饰星星）
│   ├── BreathingOrb   ← 呼吸圆（CSS 动画，点击暂停/继续）
│   ├── Instruction    ← 引导文案（"请放空思绪，跟随律动呼吸"）
│   └── CountdownCard  ← 倒计时卡片（时间 + AI 引导中标识）
└── Footer             ← 页脚（版权、隐私政策链接）
```

**决策**：所有元素内联于 `BreathingPage.tsx`，不拆分子组件。

**理由**：
- 页面逻辑简单，拆分反而增加文件数量
- 所有动画样式集中管理，便于维护

## 风险 / 权衡

| 风险 | 缓解措施 |
|------|---------|
| CSS 动画在低端设备可能掉帧 | 全部动画只用 `transform`（scale）和 `opacity`，不触发 layout/paint；`prefers-reduced-motion` 下禁用动画 |
| 倒计时与 CSS 动画可能不同步 | 两者同时启动/暂停，误差在 1s 内可接受 |
| 移动端触摸目标尺寸 | 呼吸圆 288×288px，远大于 44×44pt 标准 |
| `prefers-reduced-motion` 支持 | 通过 CSS 媒体查询和 `motion-safe` 类名实现 |
