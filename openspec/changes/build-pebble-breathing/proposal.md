## 为什么

急救呼吸页（`/breathing`）目前仅有无状态骨架，缺少核心功能：4-7-8 呼吸视觉引导、倒计时、沉浸式动画，无法向用户提供情绪急救能力。本变更基于 TB-004 任务书和 `docs/frontend/pebble_breathing.html` 第二版设计稿，完整实现该页面。

第二版设计稿采用纯 CSS 动画驱动方案（非 React 状态机），呼吸圆通过 19s CSS 关键帧动画自动循环 4-7-8 节奏，用户点击可暂停/继续，而非重新设计交互流程。

## 变更内容

- **重建** `apps/web/app/(main)/breathing/page.tsx`：替换现有骨架，改为纯 CSS 动画驱动，页面加载即自动开始呼吸循环
- **新增** `BreathingPage` 组件：完整实现第二版设计稿，包含 Header 导航、标题区、呼吸圆、引导文案、倒计时卡片、Footer
- **实现** 呼吸圆 CSS 动画：`animate-ethereal-breathing` 19s 循环（0-21% 吸气放大、21-58% 屏息保持、58-100% 呼气缩小）
- **实现** 文案 CSS 动画：`status-sync-ethereal` 和 `instruction-sync-ethereal` 同步切换中英文状态文案
- **实现** 背景氛围动画：`ambient-float` 浮动模糊球体、`mist-diffusion` 光晕扩散效果
- **实现** 倒计时联动：1:59 倒计时与呼吸动画同步，暂停时停止，继续时恢复
- **支持** 点击暂停/继续：点击呼吸圆通过 `animation-play-state` 控制所有动画暂停和恢复
- **支持** `prefers-reduced-motion`：通过 `motion-safe` 类名和 CSS 媒体查询禁用动画
- **无后端依赖**：页面完全离线运行，不新增任何 API 路由

## 功能 (Capabilities)

### 新增功能
- `breathing-page`: 急救呼吸页完整实现，涵盖 CSS 驱动呼吸动画、倒计时、沉浸式布局、暂停/继续交互和可访问性适配

### 修改功能
- `pebble-design-system`: 无规范级需求变更（复用现有设计令牌；不新增设计系统需求）

## 影响

- **页面文件**：`apps/web/app/(main)/breathing/page.tsx`（重建）
- **新增组件**：`apps/web/components/breathing/BreathingPage.tsx`
- **新增测试**：`apps/web/tests/frontend/breathing-page.test.tsx`
- **运行时依赖**：无新增（纯 CSS 实现，无需 Framer Motion）
- **无后端依赖**：页面完全离线运行
- **真相源**：`docs/frontend/pebble_breathing.html`（第二版），路由 `/breathing`

### TDD 策略

| 阶段 | 行动 |
|------|------|
| **Red** | 先写页面渲染测试（标题、文案、倒计时初始值、导航链接）；全部 fail |
| **Green** | 按设计稿实现完整页面结构和 CSS 动画，通过所有测试 |
| **Refactor** | 提取可复用样式，优化 CSS 动画性能（使用 transform 和 opacity） |
| **Document** | 补 JSDoc 注释说明动画时序和暂停机制 |

### 测试映射

| 用户场景 | 测试覆盖 |
|---------|---------|
| 页面加载显示标题"急救呼吸" | `breathing-page.test.tsx` - 标题渲染 |
| 倒计时初始显示 01:59 | `breathing-page.test.tsx` - 倒计时渲染 |
| 显示导航链接（首页/读心翻译/模拟陪练/急救呼吸） | `breathing-page.test.tsx` - 导航渲染 |
| 显示引导文案"请放空思绪，跟随律动呼吸" | `breathing-page.test.tsx` - 文案渲染 |
| 呼吸圆可点击暂停/继续 | `breathing-page.test.tsx` - 交互测试 |
