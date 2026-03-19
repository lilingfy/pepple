## Why

首页是 Pebble AI 的入口页，也是第一批验证 `TB-005` 设计系统和页面壳是否可复用的页面。当前项目已经有第二版首页设计稿，但还没有把它稳定落成生产级 Next.js 页面，因此需要先把首页作为独立变更推进，避免后续功能页在基础结构和视觉语言上反复返工。

## What Changes

- 建立 `/` 首页的生产级实现，包含导航栏、Hero 区、统计区、功能预览区和页脚。
- 首页必须复用 `TB-005` 已完成的设计系统与页面壳能力，统一使用 `MainHeader`、`PageShell`、`PebbleButton`、`GlassCard`、`StatusPill` 等共享组件。
- 首页必须以第二版首页设计稿为前端真相源，保持文案、区块顺序、交互层次和响应式退化行为一致。
- 首页需要补齐可访问性、响应式和回归测试，确保桌面端与移动端都能稳定渲染。
- 首页只处理页面级展示和导航，不引入翻译器、陪练场或后端业务实现。

## Capabilities

### New Capabilities
- `home-page`: 首页页面能力，覆盖导航、Hero、统计区、功能预览区、页脚、响应式和可访问性约束。

### 修改功能

- 无

## Impact

- 受影响页面：`/`
- 受影响代码：`apps/web/app/page.tsx`、`apps/web/components/home/*`、`apps/web/tests/frontend/*`
- 受影响依赖：`TB-005` 设计系统、`TB-001` 执行清单、`MainHeader`、`PageShell`、`PebbleButton`、`GlassCard`
- 受影响文档：`docs/taskbook/TB-001-首页模块技术预研.md`、`docs/taskbook/TB-001-执行清单.md`
- 风险：如果首页继续自定义布局而不复用共享壳层，会破坏后续页面的一致性；如果动效过强，会影响首屏可读性和性能。
