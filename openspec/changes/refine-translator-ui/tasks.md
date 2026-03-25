## 1. CSS 变量与设计系统补充

- [x] 1.1 在 `globals.css` 添加异形圆角 CSS 变量：`--radius-pebble` 和 `--radius-pebble-alt`
- [x] 1.2 验证 Tailwind 能正确解析 `rounded-pebble` 和 `rounded-pebble-alt` 类名

## 2. 页面标题区重构（TDD）

- [x] 2.1 编写测试：`translator-page-title.test.tsx` 验证 AI 大字 + 竖线 + 标题结构
- [x] 2.2 实现 `page.tsx` 标题区新结构，包含金色 AI 文字、横线装饰、竖线分隔、呼吸灯绿点
- [x] 2.3 重构：标题区保持 inline 实现（组件简单，无需额外提取）
- [x] 2.4 运行测试确保通过，验证视觉与设计稿对齐

## 3. Header 导航图标区扩展

- [x] 3.1 编写测试：验证通知图标（带红点）和用户头像占位渲染
- [x] 3.2 在 `page.tsx` Header 右侧添加通知按钮和用户头像区域
- [x] 3.3 验证响应式：移动端图标区域自适应

## 4. 情绪状态条常驻显示

- [x] 4.1 编写测试：`emotion-status-bar-persistent.test.tsx` 验证任意状态下状态条可见
- [x] 4.2 修改 `page.tsx` 将 `EmotionStatusBar` 从条件渲染改为常驻
- [x] 4.3 更新 `EmotionStatusBar` 组件支持默认数据展示模式（心率 85%）
- [x] 4.4 验证 result 态时数据正确切换，添加过渡动画避免闪烁

## 5. 输入区异形圆角与样式

- [x] 5.1 编写测试：验证输入区容器应用 `rounded-pebble` 和内阴影
- [x] 5.2 更新 `InputArea.tsx` 容器样式：异形圆角、玻璃拟态背景、pebble-inset 阴影
- [x] 5.3 验证 textarea 聚焦状态环样式正确

## 6. 解码按钮精修

- [x] 6.1 编写测试：`decode-button-shape.test.tsx` 验证异形圆角、光晕、装饰点、悬停旋转
- [x] 6.2 更新 `DecodeButton.tsx`：
  - 异形圆角 `rounded-[45%_55%_70%_30%/30%_40%_60%_70%]`
  - 图标黄色光晕 `drop-shadow-[0_0_8px_rgba(255,237,148,0.6)]`
  - 顶部黄色 pulse 装饰点
  - 底部绿色装饰点
  - hover 图标旋转 180 度
- [x] 6.3 验证动画性能，避免布局抖动

## 7. 分析结果卡片异形圆角

- [x] 7.1 编写测试：验证 surface 卡片用 `rounded-pebble`，subtext 卡片用 `rounded-pebble-alt`
- [x] 7.2 更新 `AnalysisCard.tsx` 支持 `variant`  prop 控制圆角类型
- [x] 7.3 更新 `AnalysisResult.tsx` 传递正确的 variant 值

## 8. 回复建议卡片悬停动效

- [x] 8.1 编写测试：`reply-suggestion-hover.test.tsx` 验证位移层级和悬停复位
- [x] 8.2 更新 `ReplySuggestionCard.tsx`：
  - 按方案 A/B/C 应用不同 `translate-x` 值
  - hover 时 `translate-x-0`
  - 左侧边框颜色区分（A=绿、B=黄、C=灰）
- [x] 8.3 验证标签样式：A=绿色背景、B=黄色背景带边框、C=灰色背景

## 9. 背景装饰元素

- [x] 9.1 在 `page.tsx` 添加固定定位的鹅卵石 SVG 装饰：
  - 左下角：绿色 `#A8D8B9`，`opacity-20`
  - 右上角：灰色 `#7D8C9F`，`opacity-10`，旋转 45 度
- [x] 9.2 验证装饰元素不影响页面交互（`pointer-events-none`）

## 10. 底部操作按钮组

- [x] 10.1 编写测试：验证"复制建议"和"存入练习本"按钮渲染
- [x] 10.2 在 `page.tsx` 结果区底部添加按钮组：
  - 复制建议：边框样式，圆角全满，复制图标 hover 变填充
  - 存入练习本：主色背景，白色文字，收藏图标 hover 变红填充
- [x] 10.3 实现复制功能：使用 Clipboard API，配合 Toast 反馈
- [x] 10.4 实现保存功能：复用 `practice-client.save()`，乐观更新 + 错误处理

## 11. 响应式与可访问性检查

- [x] 11.1 验证桌面端三栏布局（5-2-5）视觉对齐
- [x] 11.2 验证移动端单列堆叠布局
- [x] 11.3 验证键盘导航：Tab 顺序、按钮焦点状态
- [x] 11.4 验证颜色对比度符合 WCAG AA 标准

## 12. 回归测试与文档

- [x] 12.1 运行全量测试套件：`npm run test`
- [x] 12.2 验证状态机流转：idle → analyzing → result → idle
- [x] 12.3 验证 API 调用：decode、practice 保存正常
- [ ] 12.4 更新任务书执行清单 TB-002，标记已完成项
- [ ] 12.5 浏览器截图对比设计稿，记录差异项
