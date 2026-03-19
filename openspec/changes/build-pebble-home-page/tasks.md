## 1. 首页路由与骨架

- [ ] 1.1 编写首页路由渲染测试，验证 `/` 能输出首页主结构、标题语义和基础导航入口
- [ ] 1.2 实现 `apps/web/app/page.tsx` 与 `apps/web/components/home/HomePage.tsx` 的页面骨架，接入 `PageShell`
- [ ] 1.3 补充首页基础元信息与首屏可访问性检查，确保页面在无 JS 条件下仍可读

## 2. 顶部导航与页脚

- [ ] 2.1 编写导航与页脚测试，验证品牌名、跳转链接和当前页状态
- [ ] 2.2 实现 `apps/web/components/home/Navigation.tsx` 与 `apps/web/components/home/Footer.tsx`
- [ ] 2.3 将首页顶部导航接入 `MainHeader` 与共享壳层，确认移动端和桌面端都可用

## 3. Hero 主视觉区

- [ ] 3.1 编写 Hero 区测试，验证主标题、副标题、CTA 按钮和核心文案存在
- [ ] 3.2 实现 `apps/web/components/home/HeroSection.tsx`、`CoreArmorText.tsx` 和 `AmbientBackground.tsx`
- [ ] 3.3 将主 CTA 与次 CTA 复用 `PebbleButton`，并验证跳转目标正确

## 4. 统计区

- [ ] 4.1 编写统计区测试，验证四项统计信息、描述文本和结构层次
- [ ] 4.2 实现 `apps/web/components/home/StatsSection.tsx` 与 `StatItem.tsx`
- [ ] 4.3 让统计区复用 `GlassCard`，并补齐数字展示与无障碍文本

## 5. 功能预览区

- [ ] 5.1 编写功能预览区测试，验证三张卡片的标题、描述和路由跳转
- [ ] 5.2 实现 `apps/web/components/home/FeatureSection.tsx` 与 `FeatureCard.tsx`
- [ ] 5.3 将功能入口指向 `/translator`、`/dojo`、`/breathing`，并复用设计系统按钮与卡片样式

## 6. 响应式与可访问性

- [ ] 6.1 编写响应式与可访问性测试，覆盖移动端堆叠、键盘导航和焦点状态
- [ ] 6.2 调整首页布局以支持桌面端、平板端和移动端的稳定退化
- [ ] 6.3 按 `prefers-reduced-motion` 约束收敛动效，避免影响首屏可读性

## 7. 集成验证与文档同步

- [ ] 7.1 运行首页相关测试并修复回归，确保页面渲染、跳转和可访问性都通过
- [ ] 7.2 同步更新 `TB-001` 任务书与执行清单中的完成状态或备注，保持文档一致
- [ ] 7.3 复查首页实现是否继续遵循第二版 HTML 真相源和 `TB-005` 设计系统约束
