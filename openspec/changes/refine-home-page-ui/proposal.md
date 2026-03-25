## 为什么

首页已实现基础布局，但与设计稿（`pebble_home.html`）相比存在视觉细节缺失：Logo 非鹅卵石异形、无滚动指示器、统计区缺少脉冲绿点、功能预览区缺少 Demo UI 和场景卡片、页脚版权信息不完整。这些细节影响品牌一致性和产品展示力度，需要在归档前补齐。

## 变更内容

1. **Navigation 组件**：Logo 改为异形鹅卵石形状（`rounded-[60%_40%_70%_30%/_40%_50%_60%_40%]`），当前页导航项添加脉冲点指示器
2. **HeroSection 组件**：底部添加滚动指示动画线条，CTA 按钮组改为"立即体验"+"演示视频"（带播放图标）
3. **StatsSection 组件**：每个统计数字前添加脉冲绿点 + 发光阴影效果
4. **DecoderSection 组件**：新增读心翻译器独立展示区块，包含左侧功能介绍和右侧 `DecoderDemo` 交互式演示
5. **PracticeSection 组件**：新增模拟陪练场独立展示区块，包含标题区和三张 `ScenarioCard` 场景卡片
6. **BreathingSection 组件**：新增急救呼吸独立展示区块，包含标题区和 `BreathingOrb` 交互式鹅卵石动画
7. **Footer 组件**：更新为设计稿风格——鹅卵石 Logo、© 2026 版权文案、隐私政策/使用条款链接
8. **全局滚动动画**：使用 IntersectionObserver 实现区块渐显动画（slide-up 和 pop-out 两种效果）

## 功能 (Capabilities)

### 新增功能
- `home-scroll-animations`: 首页区块滚动渐显动画系统
- `home-decoder-demo`: 读心翻译器 DecoderDemo 演示组件
- `home-scenario-cards`: 模拟陪练场 ScenarioCard 场景卡片组件
- `home-breathing-orb`: 急救呼吸 BreathingOrb 交互鹅卵石动画组件

### 修改功能
- `home-page`: 更新首页区块组件视觉细节（Navigation、Hero、Stats、Features、Footer）

## 影响

**受影响代码**：
- `apps/web/components/home/Navigation.tsx`
- `apps/web/components/home/HeroSection.tsx`
- `apps/web/components/home/StatsSection.tsx`
- `apps/web/components/home/FeatureSection.tsx`（可选保留或移除）
- `apps/web/components/home/Footer.tsx`
- `apps/web/components/home/HomePage.tsx`（添加滚动动画逻辑和新区块）

**新增组件**：
- `apps/web/components/home/ScrollIndicator.tsx`
- `apps/web/components/home/DecoderSection.tsx`
- `apps/web/components/home/DecoderDemo.tsx`
- `apps/web/components/home/PracticeSection.tsx`
- `apps/web/components/home/ScenarioCard.tsx`
- `apps/web/components/home/BreathingSection.tsx`
- `apps/web/components/home/BreathingOrb.tsx`
- `apps/web/components/home/ScrollReveal.tsx`（滚动动画容器）

**依赖**：
- 依赖 `TB-005` 设计系统组件（`GlassCard`、`PebbleButton`）
- 依赖 `build-pebble-home-page` 已归档提案的基础布局

**验收方式**：
- 视觉回归测试：与设计稿逐像素对比关键元素
- 交互测试：滚动动画、hover 效果、呼吸动画交互
- 可访问性测试：键盘导航、焦点状态、减少动画偏好支持
