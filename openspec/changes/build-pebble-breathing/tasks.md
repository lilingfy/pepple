## 1. Red：写失败测试

- [x] 1.1 新增 `apps/web/tests/frontend/breathing-page.test.tsx`：覆盖标题渲染、倒计时初始值 01:59、导航链接、引导文案、呼吸圆点击交互；全部 fail

## 2. Green：实现完整页面

- [x] 2.1 重建 `apps/web/app/(main)/breathing/page.tsx`：改为 Server Component，导入 BreathingPage
- [x] 2.2 新增 `apps/web/components/breathing/BreathingPage.tsx`：
  - 实现 Header 导航（Logo、首页/读心翻译/模拟陪练/急救呼吸、用户图标）
  - 实现标题区（英文 EMERGENCY BREATHING、中文"· 急救呼吸 ·"、装饰星星）
  - 实现呼吸圆 CSS 动画（`animate-ethereal-breathing` 19s 循环）
  - 实现文案 CSS 动画（`status-sync-ethereal`、`instruction-sync-ethereal` 同步切换）
  - 实现背景氛围动画（`ambient-float` 浮动球体、`mist-diffusion` 光晕）
  - 实现倒计时（useState + setInterval，1:59 递减）
  - 实现倒计时卡片（带分隔线和"AI 引导中"标识）
  - 实现 Footer（版权、隐私政策、使用条款）
  - 实现点击暂停/继续（通过 `.paused` 类控制 `animation-play-state`）

## 3. Refactor

- [x] 3.1 确认所有动画使用 `transform` 和 `opacity`，不触发 layout/paint
- [x] 3.2 确认 CSS 自定义属性命名一致（`--status-text`、`--instruction-text`）
- [x] 3.3 添加 `prefers-reduced-motion` 支持（通过 CSS 媒体查询）

## 4. 响应式与可访问性验收（人工）

- [ ] 4.1 在移动端尺寸（375px / 390px）验证呼吸圆、倒计时不遮挡、不裁剪
- [ ] 4.2 验证 `prefers-reduced-motion` 下：动画禁用，文案和倒计时仍可见
- [ ] 4.3 验证呼吸圆点击区域在移动端满足最小触摸目标（44×44pt）

## 5. 回归测试与文档

- [x] 5.1 运行 `npm test` 确认 `breathing-page.test.tsx` 全部通过
- [x] 5.2 在本地启动 dev server，人工走查：点击呼吸圆暂停/继续，倒计时同步停止/恢复
- [x] 5.3 同步 `docs/taskbook/TB-004-执行清单.md`：标记已完成子任务
