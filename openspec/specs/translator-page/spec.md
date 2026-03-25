# Capability: translator-page

## Purpose

定义 Pebble AI 读心翻译器页面的完整规范，覆盖状态机管理、输入区行为、解码按钮、情绪状态条、分析结果展示、回复建议、响应式布局及前后端 API 对齐约束。

## Requirements

### 需求: 翻译器页面四态状态机
页面必须管理四种互斥状态：`idle`（初始）、`analyzing`（请求中）、`result`（结果可用）、`error`（请求失败）。状态必须通过 Zustand store 集中管理，禁止在组件本地分散维护。

#### 场景: 初始态渲染
- **当** 用户首次进入 `/translator`
- **那么** 页面处于 `idle` 态，显示输入区，结果区不可见

#### 场景: 发起解码进入加载态
- **当** 用户点击解码按钮且输入不为空
- **那么** 状态切换为 `analyzing`，解码按钮禁用并展示 loading 动效，不得发起并发重复请求

#### 场景: 解码成功进入结果态
- **当** `POST /api/decode` 返回 200
- **那么** 状态切换为 `result`，结果区展示 `surfaceMeaning`、`subtext`、`emotionStatus`、`emotionScore`、`replySuggestions`

#### 场景: 解码失败进入错误态
- **当** `POST /api/decode` 返回非 200 或网络超时
- **那么** 状态切换为 `error`，展示错误提示，输入区保留已有内容，用户可重新触发解码

### 需求: 输入区行为
输入区必须支持多行文本输入，实时显示字符计数，禁止在 `analyzing` 态接受新输入或提交。

#### 场景: 字符计数实时更新
- **当** 用户在输入框输入或删除文字
- **那么** 字符计数同步更新，超出上限（500字符）时禁止继续输入并给出视觉提示

#### 场景: 空输入提交拦截
- **当** 用户点击解码按钮且输入为空或仅含空白字符
- **那么** 禁止发起请求，给出输入不能为空的提示

#### 场景: 分析中禁用输入
- **当** 页面处于 `analyzing` 态
- **那么** 输入框禁用，不接受键盘输入

### 需求: 工具栏语音和附件入口
输入区工具栏必须渲染语音输入按钮和附件按钮，按钮在当前版本以 `disabled` 状态展示，点击事件不触发任何实际逻辑。

#### 场景: 语音按钮可见
- **当** 页面渲染输入区
- **那么** 工具栏包含语音输入图标按钮，按钮处于 disabled 状态

#### 场景: 附件按钮可见
- **当** 页面渲染输入区
- **那么** 工具栏包含附件上传图标按钮，按钮处于 disabled 状态

### 需求: 情绪状态条
输入区必须包含 `EmotionStatusBar` 组件，在结果态展示 AI 返回的 `emotionStatus`（文本标签）和 `emotionScore`（0-100 数值），在 `idle` 态隐藏或以默认空态占位。

#### 场景: 结果态展示情绪状态
- **当** 页面进入 `result` 态
- **那么** `EmotionStatusBar` 显示 `emotionStatus` 文本标签和对应的进度条宽度（由 `emotionScore` 计算）

#### 场景: 分数阈值映射
- **当** `emotionScore < 40`
- **那么** 标签样式对应 `calm` 档位；`40 ≤ score ≤ 70` 对应 `anxious`；`score > 70` 对应 `stressed`

### 需求: 解码按钮样式与行为
解码按钮必须使用鹅卵石形状（`border-radius: pebble`），在 `analyzing` 态展示 CSS loading 动效，在 `idle` / `result` / `error` 态可点击。

#### 场景: loading 动效
- **当** 状态为 `analyzing`
- **那么** 按钮展示旋转或脉冲动效，文字切换为加载中文案，按钮 `disabled`

### 需求: 分析结果区字段对齐
结果区必须消费标准字段，禁止引用旧字段名（`trueIntent`、`attackType`、`replies.minimal/gentle/boundary`）。

#### 场景: 表面语义卡片渲染
- **当** 结果态包含 `surfaceMeaning`
- **那么** 表面语义卡片展示该字段内容

#### 场景: 潜台词卡片渲染
- **当** 结果态包含 `subtext`
- **那么** 潜台词卡片展示该字段内容

#### 场景: 旧字段引用拦截
- **当** 编译时检测到对 `trueIntent`、`attackType`、`replies.minimal` 等旧字段的引用
- **那么** TypeScript 类型检查必须报错，不得通过编译

### 需求: 回复建议区
回复建议区必须展示 `replySuggestions` 中的 A、B、C 三张卡片，顺序严格保持 A / B / C，每张卡片展示建议文本和策略标签（`strategy`），支持复制文本和保存到 `practice`。

#### 场景: 三张卡片按序渲染
- **当** 结果态 `replySuggestions` 包含 A、B、C 三条建议
- **那么** 页面按 A→B→C 顺序展示三张卡片，顺序不可变

#### 场景: 策略标签展示
- **当** 卡片渲染
- **那么** 每张卡片必须展示对应的 `strategy` 文本（A=提供确定感 / B=温和但坚定 / C=极简终结），策略文本由后端返回，不由前端硬编码

#### 场景: 复制建议文本
- **当** 用户点击某张卡片的复制按钮
- **那么** 该卡片的建议文本写入剪贴板，按钮给出复制成功视觉反馈

#### 场景: 保存到 practice
- **当** 用户点击某张卡片的保存按钮
- **那么** 立即显示"已保存"反馈（乐观写入），后台发起 `POST /api/practice`；请求失败时展示 toast 提示，不阻断主流程

#### 场景: 保存请求字段
- **当** 调用 `POST /api/practice`
- **那么** 请求体必须包含 `primaryReply`（被点击保存的那张卡片的建议文本）和 `originalText`（用户原始输入）

### 需求: 三栏响应式布局
桌面端（≥ md 断点）必须使用 CSS Grid 三栏布局（5-2-5 列比），移动端切换为单列垂直堆叠。

#### 场景: 桌面三栏
- **当** 视口宽度 ≥ `md` 断点（768px）
- **那么** 输入区、解码按钮、结果区分三列并排展示

#### 场景: 移动端堆叠
- **当** 视口宽度 < `md` 断点
- **那么** 三区垂直堆叠，输入区在上，解码按钮居中，结果区在下

### 需求: decode-client 封装
`POST /api/decode` 请求必须封装在 `lib/frontend/decode-client.ts`，禁止在组件内直接调用 `fetch`。客户端必须处理超时（默认 15s）和非 200 错误映射。

#### 场景: 超时处理
- **当** 请求超过 15 秒未响应
- **那么** `decode-client` 抛出超时错误，store 进入 `error` 态

#### 场景: 错误映射
- **当** 服务端返回 4xx 或 5xx
- **那么** `decode-client` 将错误映射为统一的 `DecodeError` 类型，包含 `code` 和 `message`

### 需求: practice-client 封装
`POST /api/practice` 请求必须封装在 `lib/frontend/practice-client.ts`，组件不得直接调用 `fetch`。

#### 场景: 保存请求封装
- **当** 调用 `practice-client.save()`
- **那么** 发起 `POST /api/practice`，返回 Promise，失败时抛出可识别的错误类型

### 需求: api/decode 响应字段对齐
`/api/decode` 路由响应必须包含标准字段：`surfaceMeaning`、`subtext`、`emotionStatus`、`emotionScore`、`replySuggestions`（含 A、B、C 三条），禁止返回旧字段。

#### 场景: 标准响应结构
- **当** `POST /api/decode` 请求成功
- **那么** 响应体包含 `surfaceMeaning: string`、`subtext: string`、`emotionStatus: string`、`emotionScore: number`、`replySuggestions: { A: string; B: string; C: string; strategy: { A: string; B: string; C: string } }`

#### 场景: 旧字段移除
- **当** AI 输出包含旧字段（`trueIntent`、`attackType` 等）
- **那么** route.ts 不得将旧字段透传至响应，仅映射为标准字段
