## 新增需求

### 需求:PebbleInputShell 在翻译器场景的复用约束
翻译器输入区必须复用 `PebbleInputShell` 作为输入容器，禁止在翻译器场景中自定义与 `PebbleInputShell` 功能重叠的输入壳层样式。

#### 场景:输入区使用 PebbleInputShell
- **当** 翻译器页面渲染输入区
- **那么** 输入容器必须使用 `PebbleInputShell` 组件，不得创建同等功能的平行实现

#### 场景:工具栏插槽使用
- **当** 翻译器需要在输入区底部展示工具栏（语音/附件按钮、字符计数）
- **那么** 工具栏内容必须通过 `PebbleInputShell` 提供的 `toolbar` 插槽或 `children` 组合方式注入，不得破坏 `PebbleInputShell` 的外层容器结构
