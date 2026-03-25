## 上下文

当前 Pebble 前端已完成三大模块界面开发：
- **读心翻译器**: 已有 `/api/decode` 路由，但 PII 脱敏在路由层直接实现，无持久化
- **模拟陪练场**: 已有 DTO 和服务层，但使用内存 `Map` 存储会话，重启即丢失
- **急救呼吸**: 纯前端，无需后端

数据库已使用 Drizzle ORM + PostgreSQL，现有表：`user_profiles`, `analysis_logs`, `simulation_sessions`, `panic_sessions`, `user_activity_stats`。

约束：
- 前端接口契约不能破坏，必须向后兼容
- 需要支持匿名用户（未登录）使用核心功能
- LLM 供应商（智谱 AI）可能不可用，必须有 deterministic fallback

## 目标 / 非目标

**目标：**
- 建立统一的后端类型基座，前后端共享 DTO 定义
- 实现分层架构：Route → Service → Repository → Policy
- 完成 practice 后端完整 CRUD
- 实现 guest session 机制，支持匿名用户
- 所有 LLM 调用都有本地 fallback
- 建立后端测试体系

**非目标：**
- 不替换现有的 Clerk 认证，只是增加 guest 层
- 不实现真正的 LLM 情绪分析（仍用启发式规则）
- 不实现复杂的限流（只按 session 简单限制）
- 不修改前端组件代码

## 决策

### 1. 类型基座放在 `packages/types` 而非 `apps/web/lib/backend`
**选择**: 创建独立的 `packages/types` 包
**理由**:
- 符合任务书 TB-006 要求
- 未来可能共享给小程序或其他客户端
- 使用 pnpm workspace 管理，构建时类型安全

**替代方案**: 放在 `apps/web/types/backend.ts` — 简单但无法跨包共享

### 2. Guest Session 使用 PostgreSQL + Cookie，而非 Redis
**选择**: `guest_sessions` 表 + http-only cookie
**理由**:
- 与现有技术栈一致（已有 PostgreSQL + Drizzle）
- Clerk 绑定后可迁移数据
- 无需引入新的基础设施依赖

**替代方案**: Redis — 需要额外运维，会话数据无需极快过期

### 3. Simulator 使用 Repository 模式 + PostgreSQL，而非内存
**选择**: 新建 `simulation_turns` 表，Service 层通过 Repository 访问
**理由**:
- 会话可持久化，页面刷新不丢失
- 支持后续"继续上回练习"功能
- Repository 层封装数据库细节，便于测试 mock

**替代方案**: 保持内存 + 定期快照 — 简单但功能受限

### 4. PII 脱敏放在 Policy 层，统一实现
**选择**: `lib/backend/policy/pii.ts` 提供 `redactSensitiveText()`
**理由**:
- 所有路由复用同一脱敏逻辑
- 可集中更新规则（如新发现敏感字段）
- 路由层只关心业务，不关心安全细节

**替代方案**: 每个路由自己实现 — 代码重复，容易遗漏

### 5. Practice 表设计：宽表 + JSONB，而非多表关联
**选择**: `practice_entries` 表，翻译器和陪练场内容都用同一表，原始数据放 JSONB
**理由**:
- 查询简单，列表页无需 join
- JSONB 支持 GIN 索引，可按 key 查询
- 两种内容结构差异大，多表继承复杂

**表结构**:
```sql
practice_entries: id, guest_session_id, user_id, source_type,
                  primary_reply, content_jsonb, is_favorite,
                  is_archived, created_at, updated_at
```

## 风险 / 权衡

**[风险] Guest session 数据可能累积** → **缓解**: 定期清理 job，或设置 30 天 TTL

**[风险] JSONB 查询性能** → **缓解**: 对常用字段（source_type, is_favorite）建立 B-tree 索引，content 内数据只在详情页展示

**[风险] 类型定义变更导致前后端不一致** → **缓解**: `packages/types` 变更后必须同时更新前后端，CI 检查类型引用

**[权衡] Guest session 安全性 vs 便利性**
选择简单 cookie 而非 JWT，因为不涉及敏感操作（只是保存练习条目）。如需提升安全，后续可添加签名。

## 迁移计划

1. **Phase 1**: 创建 `packages/types`，迁移现有 DTO
2. **Phase 2**: 数据库迁移（guest_sessions, practice_entries, simulation_turns）
3. **Phase 3**: 实现 Policy 层（PII、错误处理）
4. **Phase 4**: 实现 Repository 层
5. **Phase 5**: 重构 Service 层，添加持久化
6. **Phase 6**: 重构 Route 层，添加 guest session
7. **Phase 7**: 测试和 OpenAPI 文档

**回滚策略**: 每阶段独立可回滚。数据库变更使用迁移文件，可 `db:rollback`。

## 开放问题

1. Guest session 过期时间多长合适？（暂定 30 天）
2. Practice 条目需要支持标签/分类吗？（第一版不需要，后续迭代）
3. 是否需要批量导出 practice 数据？（第一版不需要）
