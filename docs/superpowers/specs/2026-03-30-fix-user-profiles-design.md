# 修复 user_profiles 表不存在问题设计文档

**日期**: 2026-03-30  
**主题**: 修复 `/api/relations` 500 错误 - `relation "user_profiles" does not exist`

## 问题描述

`/api/relations` API 返回 500 错误，错误信息为 `relation "user_profiles" does not exist`。根本原因是数据库迁移状态不一致，导致 `user_profiles` 表未正确创建。

## 目标

1. 修复迁移历史，使新开发者环境能干净运行
2. 确保 `user_profiles` 表正确创建，使用 `auth_user_id` 字段
3. 清理 Clerk 时代的遗留文档和测试
4. 验证完整的认证流程：登录 → 首次访问 → 自动创建 profile → `/api/relations` 正常工作

## 设计决策

### 范围

- **环境**: 仅开发环境（clean/dev DB）
- **策略**: 允许重写旧迁移文件，创建干净的迁移基线
- **清理级别**: 强清理 - 移除所有 Clerk 时代遗留物

### 架构边界

将修复工作分为四个独立单元：

1. **迁移基线修复** - 修复迁移链，确保确定性创建正确 schema
2. **运行时验证** - 确认现有代码与修复后的 schema 兼容
3. **测试更新** - 更新测试以验证修复后的 schema 契约
4. **文档清理** - 移除或更新 Clerk 时代遗留文档

## 具体变更

### 1. 迁移基线修复

**当前问题**:

- `0000_clever_spirit.sql` 创建 `user_profiles` 表，使用 `clerk_id` 字段
- `0001_rename_clerk_id_to_auth_user_id.sql` 重命名字段为 `auth_user_id`
- `0001_wide_darwin.sql` 创建 `relation_nodes` 表
- 迁移元数据可能记录不一致，导致新环境无法正确应用

**修复方案**:

- 合并 `0000` 和重命名迁移，直接创建带 `auth_user_id` 的 `user_profiles` 表
- 保留 `0001_wide_darwin.sql` 创建 `relation_nodes`
- 重置迁移元数据表，确保干净的应用顺序

**变更文件**:

- `apps/web/drizzle/migrations/0000_clever_spirit.sql` - 重写，直接创建正确 schema
- `apps/web/drizzle/migrations/0001_rename_clerk_id_to_auth_user_id.sql` - 删除（已合并）
- `apps/web/drizzle/migrations/meta/_journal.json` - 更新以反映新的迁移链

### 2. 运行时验证

**预期状态**: 现有代码应该与修复后的 schema 兼容，因为 schema 定义已经使用 `authUserId`。

**验证点**:

- `getCurrentRelationUserId()` 使用 `db.query.userProfiles.findFirst({ where: eq(userProfiles.authUserId, authUserId) })`
- 懒加载逻辑在首次访问时自动创建 profile
- 并发创建冲突处理（唯一约束违反代码 23505）

**如需修复**:

- 确保所有查询使用正确的字段名 `authUserId` / `auth_user_id`
- 验证错误处理路径正常工作

### 3. 测试更新

**更新文件**:

- `apps/web/tests/api/current-user-auth.test.ts` - 更新 mock 数据使用 `auth_user_id`
- `apps/web/tests/api/relations-auth.test.ts` - 验证 401/503/500 响应

**测试覆盖**:

- 未认证访问 → 401
- 首次访问 → 自动创建 profile
- 并发创建 → 正确处理唯一约束冲突，重试后成功
- 数据库不可用 → 503

### 4. 文档清理

**清理目标**:

- 删除或更新提及 `clerk_id` 的历史文档
- 确保 `docs/superpowers/specs/2026-03-30-supabase-auth-design.md` 准确反映当前架构
- 移除任何误导性的 Clerk 迁移说明

## 数据流

### 正常流程

1. 用户登录 → Supabase Auth 创建 session
2. 首次访问 `/api/relations` → `getCurrentRelationUserId()` 被调用
3. 查询 `user_profiles` 表，按 `auth_user_id` 查找
4. 记录不存在 → 插入新记录，返回 `user_profiles.id`
5. 后续请求直接使用已存在的 profile

### 错误场景处理

- **数据库连接失败** → `DatabaseUnavailableError` → 503
- **未登录** → `UnauthenticatedError` → 401
- **并发创建冲突**（唯一约束违反）→ 自动重试查询一次
- **其他未知错误** → `ProfileResolutionError` → 500

### 边界情况

- 两个请求同时首次访问：第二个请求触发唯一约束冲突，然后重试查询成功
- 数据库被重置但用户仍有有效 Supabase session：下次访问自动重新创建 profile

## 验证清单

- [ ] 迁移文件能干净应用到新数据库
- [ ] `user_profiles` 表存在，包含 `auth_user_id` 字段
- [ ] `relation_nodes` 表存在，外键引用正确
- [ ] 登录流程正常工作
- [ ] 首次访问 `/api/relations` 自动创建 profile
- [ ] `/api/relations` GET 返回正确数据
- [ ] `/api/relations` POST 能创建新关系
- [ ] 测试全部通过
- [ ] 文档准确反映当前架构

## 风险与缓解

| 风险                     | 缓解措施                                   |
| ------------------------ | ------------------------------------------ |
| 迁移重写导致历史环境损坏 | 仅用于 clean/dev 环境，生产环境需单独处理  |
| 并发创建逻辑失效         | 保留现有重试机制，测试覆盖验证             |
| 遗漏的 Clerk 引用        | 全局搜索 `clerk_id`/`clerkId` 确保全部清理 |

## 后续工作

修复完成后，将调用 `writing-plans` 技能创建详细实施计划。
