---

## 13. 第三轮设计稿对比修复（2026-03-24）

基于用户反馈的额外 UI 问题进行修复：

### 13.1 修复导航"首页"加粗问题

**问题：**
- "首页"两个字未加粗显示

**修复：**
- `Navigation.tsx`: 重构类名逻辑，确保 `font-bold` 正确应用在当前页（首页）
- 非当前页使用 `font-light`，当前页使用 `font-bold`

### 13.2 修复"开启防御"按钮缺少 hover 效果

**问题：**
- "开启防御"按钮缺少鼠标悬停效果

**修复：**
- `Navigation.tsx`: 改为使用原生 `<button>` 元素
- 添加 `hover:bg-[#A8D8B9] hover:text-white hover:shadow-lg hover:shadow-[#A8D8B9]/30`
- 过渡动画 `transition-all duration-500`

### 13.3 修复滚动动画不明显问题

**问题：**
- 急救呼吸与模拟训练场的滑动特效不明显
- 模块初始时完全不显示（scale-85 无效）

**修复：**
- `ScrollReveal.tsx`: 修复 `scale-85` → `scale-[0.70]`（使用有效的 Tailwind 任意值）
- 增强 pop-out 动画差异：从 `scale-[0.85]` 改为 `scale-[0.70]`，让效果更明显
- `HomePage.tsx`: 为 PracticeSection 和 BreathingSection 添加 `threshold={0.2}` 参数
- `scroll-reveal.test.tsx`: 更新测试期望值为 `scale-[0.70]`

### 验证结果
- [x] 13.4 运行测试：126 个测试全部通过
- [x] 13.5 运行构建：生产构建成功
