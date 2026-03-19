# TB-006: 后端 BFF 与接口技术预研任务书

## 1. 任务书基本信息

| 项目 | 内容 |
|------|------|
| **任务书编号** | TB-006 |
| **任务书名称** | 后端 BFF 与接口技术预研 |
| **所属项目** | Pebble AI 情绪防御助手 |
| **预研分类** | 核心功能预研 |
| **预研深度** | 开发一代（版本预研） |
| **优先级** | P0（最高） |
| **预计工期** | 5-7 天 |
| **依赖任务** | TB-005（设计系统）、TB-002（读心翻译器）、TB-003（模拟陪练场）、TB-004（急救呼吸） |
| **状态** | 待启动 |

## 2. 需求背景

### 2.1 产品定位

后端 BFF 是 Pebble AI 的统一数据和接口层，负责：
- 为第二版前端 HTML 提供稳定、可验证的 API
- 将读心翻译器、模拟陪练场、练习本等能力统一到同一套后端契约
- 将服务器作为主数据源，前端仅保留缓存和展示状态
- 在供应商不可用时提供确定性的本地 fallback

### 2.2 设计原则

1. 前端不改，后端必须对齐现有第二版 HTML 的交互。
2. 接口优先，所有公开请求和响应先定义 DTO 再实现。
3. 服务器是 source of truth，敏感内容按最小必要原则持久化。
4. `practice` 是唯一的后端命名，不使用 `practice-book`。
5. 所有 LLM 调用都必须有本地 deterministic fallback。
6. 脱敏、超时、限流、错误映射属于后端基础能力，不能散落在路由里。

### 2.3 用户场景

1. 用户在读心翻译器页面粘贴一段压力文本，获得表面语义、潜台词和三条回复建议。
2. 用户点击“存入练习本”，将当前分析结果保存到后端。
3. 用户进入模拟陪练场，选择场景后开始对话，看到实时情绪分析和陪练建议。
4. 用户点击“重启本局”或“结束演练”，后端要返回明确的会话状态和总结。
5. 用户在急救呼吸页进行 4-7-8 呼吸训练，该页面不依赖后端。

## 3. 功能需求

### 3.1 通用后端能力

后端必须提供以下通用能力：
- 统一 DTO 定义，放在 `packages/types/src/backend.ts`
- 运行时校验，使用 Zod 或等价的 schema
- 统一错误体，输出稳定的 `code`、`message` 和 `details`
- 匿名会话，使用 `guest_session_id` cookie
- 可选 Clerk 绑定，后续支持登录后合并数据
- 限流和超时保护，避免 LLM 和接口抖动影响前端
- OpenAPI 文档，保持接口契约可审计

### 3.2 读心翻译器后端

读心翻译器的后端接口以第二版 HTML 为准，必须输出以下可见字段：

| 字段 | 说明 |
|------|------|
| `surfaceMeaning` | 表面语义 |
| `subtext` | 潜台词 |
| `emotionStatus` | 情绪检测状态 |
| `emotionScore` | 情绪检测分数 |
| `replySuggestions` | 三条回复建议，按 A / B / C 顺序返回 |

接口要求：
- `POST /api/decode` 接收文本输入
- 进入 LLM 前必须做 PII 脱敏
- 解析失败时返回本地 deterministic 结果
- 内部安全信息只进入审计或服务层，不暴露给前端

### 3.3 模拟陪练场后端

模拟陪练场的后端必须对齐第二版 HTML 的三栏结构：
- 左侧为场景选择、心理语境和技巧锦囊
- 中间为聊天历史、输入框和重启按钮
- 右侧为实时情绪分析、陪练建议和结束演练按钮

场景固定为三类：
- `职场越界`
- `亲密关系`
- `社交应对`

接口要求：

| 接口 | 责任 |
|------|------|
| `GET /api/scenarios` | 返回稳定、排序固定的场景目录 |
| `POST /api/simulator` | 支持 `start / turn / restart` 三种动作 |
| `POST /api/simulator/[sessionId]/end` | 返回会话总结 |

`rightPanel` 必须包含以下字段：
- `analysisScore`
- `analysisLabel`
- `analysisSummary`
- `instantFeedback`
- `attentionPoint`

### 3.4 `practice` 后端

`practice` 用于保存用户从读心翻译器或模拟陪练场中得到的有价值内容。

接口要求：

| 接口 | 责任 |
|------|------|
| `POST /api/practice` | 保存练习条目 |
| `GET /api/practice` | 获取练习条目列表 |
| `PATCH /api/practice/[practiceId]` | 更新收藏、归档等状态 |
| `DELETE /api/practice/[practiceId]` | 硬删除条目 |

保存规则：
- 读心翻译器保存时，默认 `primaryReply` 取第一条回复建议
- 模拟陪练场保存时，`primaryReply` 由调用方选定
- `replySuggestions` 必须保留渲染顺序
- 读心翻译器保存时，必须保留三条回复建议和可见分析字段

### 3.5 急救呼吸

急救呼吸页为纯前端沉浸式体验：
- 4-7-8 呼吸周期由前端完成
- 倒计时、波纹和呼吸动画不依赖后端
- 后端只在未来明确需要埋点或统计时再补接口

## 4. 技术实现

### 4.1 服务分层

后端实现应按以下层次拆分：

| 层级 | 职责 |
|------|------|
| Route Adapter | 处理请求、校验输入、返回响应 |
| Service Layer | 编排业务流程，控制 start / turn / restart / end |
| Repository Layer | 封装数据库访问 |
| Policy Layer | PII 脱敏、限流、超时、错误映射 |
| DTO Layer | 统一请求和响应类型 |

推荐文件边界：
- `apps/web/lib/backend/decode/*`
- `apps/web/lib/backend/simulator/*`
- `apps/web/lib/backend/practice/*`
- `apps/web/lib/backend/repositories/*`
- `packages/types/src/backend.ts`

### 4.2 数据模型

后端至少需要以下持久化对象：

| 表 / 对象 | 作用 |
|-----------|------|
| `guest_sessions` | 匿名会话绑定 |
| `analysis_logs` | 读心翻译器分析记录和摘要 |
| `practice_entries` | `practice` 保存条目 |
| `simulation_sessions` | 模拟陪练会话摘要 |
| `simulation_turns` | 模拟陪练轮次快照，可选但推荐 |

持久化原则：
- 只存最小必要数据
- 原始文本要么脱敏，要么加密
- 结构化快照优先使用 JSONB
- 不把大段对话无限制写入数据库

### 4.3 接口规范

接口层必须遵循以下约束：
- 所有请求都要有明确的输入 schema
- 所有响应都要有稳定的输出 schema
- 错误响应必须可机器识别
- `start / turn / restart` 使用同一套会话快照语义
- `rightPanel` 必须和前端可见卡片一一对应

### 4.4 安全与容错

后端必须实现：
- PII 脱敏，覆盖电话、邮箱、姓名等高风险信息
- 请求超时，避免供应商卡死影响页面
- 限流，优先按 session 和 IP 双重约束
- crisis-like 文本的安全降级响应
- 供应商失败时的本地 fallback
- 公开错误不泄露堆栈和内部路径

### 4.5 测试与文档

验收前必须具备：
- `apps/web/vitest.config.ts`
- `apps/web/tests/backend/**/*.test.ts`
- `pnpm --filter @pebble/web type-check`
- `pnpm --filter @pebble/web db:generate`
- `pnpm --filter @pebble/web db:migrate`
- `pnpm exec redocly lint docs/backtend/openapi.yaml`

## 5. 验收标准

### 5.1 功能验收

| 编号 | 验收项 | 标准 | 优先级 |
|------|--------|------|-------|
| AC-006-01 | 读心翻译器契约 | `POST /api/decode` 返回 `surfaceMeaning`、`subtext`、`emotionStatus`、`emotionScore`、三条回复建议 | P0 |
| AC-006-02 | 模拟陪练场契约 | `start / turn / restart / end` 语义完整，`rightPanel` 字段与 HTML 一致 | P0 |
| AC-006-03 | `practice` 契约 | 保存、列表、更新、删除均可用，且命名统一为 `practice` | P0 |
| AC-006-04 | 安全和稳定性 | PII 脱敏、限流、超时、fallback 生效 | P0 |
| AC-006-05 | 公开文档 | OpenAPI、类型和迁移保持一致 | P0 |
| AC-006-06 | 急救呼吸 | 不依赖后端，页面保持纯前端运行 | P1 |

### 5.2 交付物

任务完成后，必须交付以下成果：
- 后端 DTO 与校验层
- 读心翻译器后端
- 模拟陪练场后端
- `practice` 后端
- 数据库迁移
- Vitest 测试用例
- OpenAPI 文档

### 5.3 验收方式

验收时应同时通过：
- 单元测试
- 路由测试
- 数据层测试
- 类型检查
- 数据库迁移检查
- OpenAPI lint 检查

## 6. 子任务与执行清单

为了方便落地，`TB-006` 进一步拆分为独立执行清单：

- [TB-006 后端 BFF 与接口技术预研执行清单](./TB-006-执行清单.md)

执行顺序建议以执行清单为准，主任务书只冻结目标、边界和验收标准。
