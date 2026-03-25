## 为什么

Pebble AI 前端三模块（读心翻译器、模拟陪练场、急救呼吸）的界面已初步完成，但后端能力缺失：
- 无统一接口契约，前端类型定义散落在各组件中
- 无持久化层，模拟陪练场使用内存存储，重启即丢失
- 无练习本（practice）后端，用户无法保存有价值的分析结果
- 无匿名会话支持，所有功能强制要求登录
- 无统一错误处理和 PII 脱敏策略

现在需要构建后端 BFF（Backend for Frontend）层，为第二版设计稿提供稳定、可验证的 API，同时满足安全、容错、可审计的要求。

## 变更内容

1. **创建类型基座** - 新增 `packages/types/src/backend.ts`，集中定义所有后端 DTO
2. **基础设施层** - 创建 `lib/backend/policy/*`（PII 脱敏、限流、超时）、`lib/backend/errors/*`（统一错误体）
3. **读心翻译器增强** - 完善 `analysis_logs` 持久化，添加 LLM fallback
4. **练习本后端** - 新建 `practice_entries` 表，`/api/practice` 完整 CRUD
5. **陪练场持久化** - 迁移内存存储到 PostgreSQL，`simulation_sessions` + `simulation_turns`
6. **匿名会话** - 新建 `guest_sessions` 表，cookie 机制，Clerk 绑定支持
7. **测试体系** - `tests/backend/*.test.ts`，覆盖 decode、practice、simulator
8. **OpenAPI 文档** - `docs/backend/openapi.yaml`，接口契约可审计

## 功能 (Capabilities)

### 新增功能
- `backend-types`: 后端 DTO 类型基座（DecodeRequest/Response, Practice DTOs, Simulator DTOs）
- `backend-policy`: 通用策略层（PII 脱敏、超时、限流、错误映射）
- `guest-session`: 匿名会话管理（guest_sessions 表、cookie、Clerk 合并）
- `practice-backend`: 练习本后端（practice_entries 表、CRUD API）
- `simulator-persistence`: 陪练场持久化（simulation_turns 表、repository 模式）

### 修改功能
- `decode-api`: 增加 analysis_logs 写入、统一错误响应格式
- `simulator-api`: 内存存储改为 PostgreSQL 持久化、添加 session 过期机制

## 影响

- **apps/web/lib/backend/** - 新增 services、repositories、policy、errors 目录
- **packages/types/** - 新增 backend.ts 导出所有 DTO
- **apps/web/app/api/** - decode、simulator、practice 路由重构
- **数据库** - 新增 guest_sessions、practice_entries、simulation_turns 表
- **测试** - 新增 vitest backend 测试配置和用例
- **文档** - 新增 docs/backend/openapi.yaml

**BREAKING**: 无破坏性变更，前端接口契约保持不变。
