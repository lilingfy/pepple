## 为什么

当前翻译界面实现与第二版设计稿（`pebble_translator.html`）存在多处视觉和交互差异，影响品牌一致性和用户体验。需要基于设计稿进行 UI 精细化调整，确保鹅卵石设计语言、玻璃拟态效果和情绪安全感色彩得到准确落地。

## 变更内容

### 视觉层调整

1. **页面标题区重构**：按设计稿实现 AI 大字 + 竖线分隔 + "读心翻译器" 标题组合，副标题添加呼吸灯动画指示器
2. **情绪状态条位置迁移**：从 result 态条件渲染改为常驻于输入区下方，显示 "情绪检测：平稳观察中" + 心率百分比（85%）
3. **解码按钮精修**：修正为异形鹅卵石形状 `rounded-[45%_55%_70%_30%/30%_40%_60%_70%]`，图标添加黄色光晕阴影效果，hover 旋转动画
4. **输入区域样式对齐**：textarea 改为 `rounded-pebble` 异形圆角，调整内阴影（pebble-inset）和玻璃拟态背景
5. **分析结果卡片样式**：表面语义卡片使用 `rounded-pebble`，潜台词卡片使用 `rounded-pebble-alt` 异形圆角
6. **回复建议卡片动效**：添加横向位移效果（方案 A translate-x-2、方案 B translate-x-1），悬停时复位，边框颜色按优先级区分（绿/黄/灰）
7. **背景装饰元素**：添加左下角和右上角的固定鹅卵石形状装饰图案

### 结构层调整

8. **Header 导航补全**：添加通知图标（带红点）、用户头像下拉区域
9. **底部操作按钮**：添加"复制建议"和"存入练习本"按钮组，带图标和填充状态动画

### 响应式与细节

10. **间距微调**：左栏顶部增加 `mt-28` 留白，三栏垂直居中对齐调整
11. **字体层级优化**：标题使用中英文混排质感，标签使用小字 + 图标组合

## 功能 (Capabilities)

### 新增功能
- `translator-ui-refine`: 翻译界面 UI 精修，对齐设计稿视觉规范

### 修改功能
- `translator-page`: 页面布局和组件样式调整（仅视觉层，功能行为不变）

## 影响

| 范围 | 影响内容 |
|------|----------|
| 前端组件 | `apps/web/app/(main)/translator/page.tsx`<br>`apps/web/components/translator/InputArea.tsx`<br>`apps/web/components/translator/DecodeButton.tsx`<br>`apps/web/components/translator/EmotionStatusBar.tsx`<br>`apps/web/components/translator/AnalysisCard.tsx`<br>`apps/web/components/translator/ReplySuggestionCard.tsx`<br>`apps/web/components/translator/ReplySuggestions.tsx` |
| 样式系统 | `apps/web/app/globals.css` - 可能需要补充异形圆角工具类 |
| 类型定义 | 无变化 |
| 后端接口 | 无变化 |
| 路由结构 | 无变化，保持 `/translator` |

### TDD 策略

**Red**：编写测试用例验证设计稿对齐
- 组件渲染测试：验证标题结构、按钮形状、状态条位置
- 样式类测试：验证异形圆角类名应用
- 交互测试：验证 hover 动画、按钮点击

**Green**：实现最小代码通过测试
- 调整组件 props 和 className
- 添加缺失的 CSS 工具类

**Refactor**：优化代码结构
- 提取可复用的装饰元素组件
- 统一动效时间函数

**Document**：更新组件文档
- 记录设计决策和视觉规范引用

### 测试映射

| 用户场景 | 测试覆盖 |
|----------|----------|
| 用户进入翻译页面看到正确标题样式 | `translator-page-title.test.tsx` |
| 情绪状态条常驻显示 | `emotion-status-bar-persistent.test.tsx` |
| 解码按钮异形形状和动效 | `decode-button-shape.test.tsx` |
| 回复建议卡片悬停位移 | `reply-suggestion-hover.test.tsx` |
| 底部操作按钮渲染 | `translator-actions.test.tsx` |
