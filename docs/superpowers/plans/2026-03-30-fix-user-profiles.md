# 修复 user_profiles 表不存在问题实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 `/api/relations` 500 错误，通过清理迁移历史、重置数据库、验证完整认证流程，确保 `user_profiles` 表正确创建且认证流程正常工作。

**Architecture:** 重写迁移基线，将 `clerk_id` 创建和重命名为 `auth_user_id` 合并为单一步骤；重置开发数据库；验证运行时代码与修复后的 schema 兼容；更新测试和文档。

**Tech Stack:** Next.js, Drizzle ORM, PostgreSQL, Supabase Auth, Vitest

---

## 文件结构

| 文件                                                                   | 职责                               | 操作                                 |
| ---------------------------------------------------------------------- | ---------------------------------- | ------------------------------------ |
| `apps/web/drizzle/migrations/0000_clever_spirit.sql`                   | 创建所有表，包括 `user_profiles`   | 重写：直接创建带 `auth_user_id` 的表 |
| `apps/web/drizzle/migrations/0001_rename_clerk_id_to_auth_user_id.sql` | 重命名 `clerk_id` → `auth_user_id` | 删除（已合并到 0000）                |
| `apps/web/drizzle/migrations/meta/_journal.json`                       | 迁移历史记录                       | 更新：移除已删除迁移的引用           |
| `apps/web/tests/api/current-user-auth.test.ts`                         | 认证流程单元测试                   | 验证：确保测试使用正确字段名         |
| `apps/web/tests/api/relations-auth.test.ts`                            | 关系 API 认证测试                  | 验证：确保测试通过                   |
| `apps/web/app/api/relations/_lib/current-user.ts`                      | 核心认证解析逻辑                   | 验证：无需修改，确认兼容             |
| `docs/superpowers/specs/2026-03-30-supabase-auth-design.md`            | 认证架构文档                       | 清理：移除 Clerk 引用                |

---

## Task 1: 重写迁移基线

**Files:**

- Modify: `apps/web/drizzle/migrations/0000_clever_spirit.sql:77-85`
- Delete: `apps/web/drizzle/migrations/0001_rename_clerk_id_to_auth_user_id.sql`
- Modify: `apps/web/drizzle/migrations/meta/_journal.json`

- [ ] **Step 1: 备份当前迁移文件**

```bash
cd /Users/xyh/Code/pebble/apps/web
cp drizzle/migrations/0000_clever_spirit.sql /tmp/0000_clever_spirit.sql.backup
cp drizzle/migrations/0001_rename_clerk_id_to_auth_user_id.sql /tmp/0001_rename_clerk_id_to_auth_user_id.sql.backup
```

- [ ] **Step 2: 修改 0000_clever_spirit.sql 中的 user_profiles 表定义**

将第 77-85 行从：

```sql
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"llm_preference" varchar(50) DEFAULT 'zhipu',
	"api_key_encrypted" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_clerk_id_unique" UNIQUE("clerk_id")
);
```

改为：

```sql
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" varchar(255) NOT NULL,
	"llm_preference" varchar(50) DEFAULT 'zhipu',
	"api_key_encrypted" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_auth_user_id_unique" UNIQUE("auth_user_id")
);
```

- [ ] **Step 3: 删除重命名迁移文件**

```bash
rm apps/web/drizzle/migrations/0001_rename_clerk_id_to_auth_user_id.sql
```

- [ ] **Step 4: 更新迁移日志**

修改 `apps/web/drizzle/migrations/meta/_journal.json`，从：

```json
{
  "version": "7",
  "dialect": "postgresql",
  "entries": [
    {
      "idx": 0,
      "version": "7",
      "when": 1774361462571,
      "tag": "0000_clever_spirit",
      "breakpoints": true
    },
    {
      "idx": 1,
      "version": "7",
      "when": 1774766066053,
      "tag": "0001_wide_darwin",
      "breakpoints": true
    }
  ]
}
```

改为（移除对重命名迁移的引用，保持只有 0000 和 0001_wide_darwin）：

```json
{
  "version": "7",
  "dialect": "postgresql",
  "entries": [
    {
      "idx": 0,
      "version": "7",
      "when": 1774361462571,
      "tag": "0000_clever_spirit",
      "breakpoints": true
    },
    {
      "idx": 1,
      "version": "7",
      "when": 1774766066053,
      "tag": "0001_wide_darwin",
      "breakpoints": true
    }
  ]
}
```

- [ ] **Step 5: 提交迁移修复**

```bash
git add apps/web/drizzle/migrations/
git commit -m "fix: 重写迁移基线，直接创建带 auth_user_id 的 user_profiles 表

- 修改 0000_clever_spirit.sql，直接创建 auth_user_id 字段
- 删除 0001_rename_clerk_id_to_auth_user_id.sql（已合并）
- 更新迁移日志"
```

---

## Task 2: 重置开发数据库

**Files:**

- 操作数据库（通过 psql 或 drizzle-kit）

- [ ] **Step 1: 确认数据库连接信息**

检查 `.env.local` 或 `.env` 文件中的 `DATABASE_URL`：

```bash
cat /Users/xyh/Code/pebble/apps/web/.env.local | grep DATABASE_URL
```

- [ ] **Step 2: 使用 drizzle-kit 重置并应用迁移**

```bash
cd /Users/xyh/Code/pebble/apps/web
npx drizzle-kit push --force
```

预期输出：

```
[✓] 数据库连接成功
[✓] 应用迁移 0000_clever_spirit
[✓] 应用迁移 0001_wide_darwin
[✓] 所有迁移已应用
```

- [ ] **Step 3: 验证表结构**

```bash
psql $DATABASE_URL -c "\d user_profiles"
```

预期输出应包含：

```
Column        | Type        | Collation | Nullable | Default
--------------+-------------+-----------+----------+----------------------
id            | uuid        |           | not null | gen_random_uuid()
auth_user_id  | varchar(255)|           | not null |
...
```

- [ ] **Step 4: 提交（如有配置变更）**

如果 `.env.local` 有变更：

```bash
git add apps/web/.env.local
git commit -m "chore: 更新数据库配置"
```

---

## Task 3: 验证运行时代码兼容性

**Files:**

- Verify: `apps/web/app/api/relations/_lib/current-user.ts`
- Verify: `apps/web/lib/db/schema.ts`

- [ ] **Step 1: 确认 schema.ts 使用正确字段名**

检查 `apps/web/lib/db/schema.ts` 第 23 行：

```typescript
authUserId: varchar('auth_user_id', { length: 255 }).unique().notNull(),
```

如果字段名不匹配，修改为上述内容。

- [ ] **Step 2: 确认 current-user.ts 查询使用正确字段**

检查 `apps/web/app/api/relations/_lib/current-user.ts` 第 44-45 行：

```typescript
const existingProfile = await db.query.userProfiles.findFirst({
  where: eq(userProfiles.authUserId, authUserId),
});
```

确认使用的是 `userProfiles.authUserId` 而非 `userProfiles.clerkId`。

- [ ] **Step 3: 确认插入操作使用正确字段**

检查第 56-59 行：

```typescript
const [newProfile] = await db
  .insert(userProfiles)
  .values({ authUserId }) // 使用 authUserId 而非 clerkId
  .returning();
```

- [ ] **Step 4: 如有修改则提交**

```bash
git add apps/web/
git commit -m "fix: 确保运行时代码使用正确的 auth_user_id 字段名"
```

---

## Task 4: 运行并验证测试

**Files:**

- Test: `apps/web/tests/api/current-user-auth.test.ts`
- Test: `apps/web/tests/api/relations-auth.test.ts`

- [ ] **Step 1: 运行认证测试**

```bash
cd /Users/xyh/Code/pebble/apps/web
npm test -- tests/api/current-user-auth.test.ts
```

预期输出：

```
✓ getCurrentRelationUserId > happy paths > throws UnauthenticatedError when no Supabase user is authenticated
✓ getCurrentRelationUserId > happy paths > returns existing local profile id when profile exists
✓ getCurrentRelationUserId > happy paths > creates new profile and returns id when profile does not exist
✓ getCurrentRelationUserId > happy paths > handles concurrent creation by retrying lookup on unique constraint violation (code 23505)
✓ getCurrentRelationUserId > failure paths > throws DatabaseUnavailableError when database is unavailable (db is null)
✓ getCurrentRelationUserId > failure paths > throws UnauthenticatedError when Supabase getUser returns an error
✓ getCurrentRelationUserId > failure paths > throws ProfileResolutionError when insert fails with non-unique error
✓ getCurrentRelationUserId > failure paths > throws ProfileResolutionError when both insert and retry lookup fail
```

- [ ] **Step 2: 运行关系 API 认证测试**

```bash
npm test -- tests/api/relations-auth.test.ts
```

预期输出：

```
✓ Relations API Auth > GET /api/relations > returns 401 when unauthenticated
✓ Relations API Auth > POST /api/relations > returns 401 when unauthenticated
✓ Relations API Auth > returns 503 when database unavailable
✓ Relations API Auth > returns 500 when profile resolution fails
```

- [ ] **Step 3: 如有测试失败，修复后重新运行**

如果测试失败，检查：

1. mock 数据是否使用 `auth_user_id` 而非 `clerk_id`
2. 数据库连接是否正确配置
3. 测试环境变量是否正确设置

- [ ] **Step 4: 提交测试修复（如有）**

```bash
git add apps/web/tests/
git commit -m "test: 更新测试以使用正确的 auth_user_id 字段名"
```

---

## Task 5: 端到端验证

**Files:**

- 操作：完整认证流程验证

- [ ] **Step 1: 启动开发服务器**

```bash
cd /Users/xyh/Code/pebble/apps/web
npm run dev
```

- [ ] **Step 2: 访问登录页面**

打开浏览器访问 `http://localhost:3020/login`

预期：登录页面正常显示，无 500 错误

- [ ] **Step 3: 注册新用户**

使用测试邮箱和密码注册新用户。

预期：注册成功，重定向到 `/me`

- [ ] **Step 4: 首次访问关系 API**

访问 `http://localhost:3020/me/relations` 或调用 `/api/relations`。

预期：

- 返回 200，数据为空数组 `[]`
- 数据库中自动创建了对应的 `user_profiles` 记录

验证数据库：

```bash
psql $DATABASE_URL -c "SELECT * FROM user_profiles WHERE auth_user_id = '<supabase-user-id>';"
```

- [ ] **Step 5: 创建关系**

在 UI 中创建一个新关系，或发送 POST 请求：

```bash
curl -X POST http://localhost:3020/api/relations \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  -d '{"name": "测试关系"}'
```

预期：返回 201，创建成功

- [ ] **Step 6: 验证关系列表**

访问 `/api/relations` 或刷新关系页面。

预期：返回 200，包含刚创建的关系

---

## Task 6: 文档清理

**Files:**

- Modify: `docs/superpowers/specs/2026-03-30-supabase-auth-design.md`

- [ ] **Step 1: 检查并更新认证设计文档**

检查 `docs/superpowers/specs/2026-03-30-supabase-auth-design.md` 第 14 行：

```markdown
- The `user_profiles.clerk_id` column has been renamed to `auth_user_id` for the new Supabase-based identities only
```

改为：

```markdown
- The `user_profiles` table uses `auth_user_id` column to map Supabase Auth users to local profiles
```

- [ ] **Step 2: 全局搜索 Clerk 引用**

```bash
cd /Users/xyh/Code/pebble
grep -r "clerk_id\|clerkId\|Clerk" docs/ --include="*.md" --include="*.mdx"
```

如有发现，更新或删除相关引用。

- [ ] **Step 3: 提交文档更新**

```bash
git add docs/
git commit -m "docs: 清理 Clerk 时代遗留引用，更新认证架构说明"
```

---

## Task 7: 最终验证与总结

- [ ] **Step 1: 运行完整测试套件**

```bash
cd /Users/xyh/Code/pebble/apps/web
npm test
```

预期：所有测试通过

- [ ] **Step 2: 验证迁移可重复应用**

```bash
# 重置数据库并重新应用迁移
npx drizzle-kit push --force
```

预期：迁移干净应用，无错误

- [ ] **Step 3: 创建总结提交**

```bash
git log --oneline -5
```

确认提交历史清晰：

```
abc1234 docs: 清理 Clerk 时代遗留引用
abc1233 test: 更新测试以使用正确的 auth_user_id
abc1232 fix: 确保运行时代码使用正确的 auth_user_id 字段名
abc1231 chore: 重置开发数据库
abc1230 fix: 重写迁移基线，直接创建带 auth_user_id 的 user_profiles 表
```

---

## 自检清单

- [ ] 迁移文件 `0000_clever_spirit.sql` 直接创建带 `auth_user_id` 的表
- [ ] 重命名迁移文件已删除
- [ ] 迁移日志 `_journal.json` 正确反映迁移链
- [ ] 数据库重置后 `user_profiles` 表存在且字段正确
- [ ] `current-user.ts` 使用 `authUserId` 字段名
- [ ] `schema.ts` 定义使用 `authUserId` 字段名
- [ ] 所有测试通过
- [ ] 端到端认证流程正常工作
- [ ] 文档已清理 Clerk 引用

---

## 执行选项

**Plan complete and saved to `docs/superpowers/plans/2026-03-30-fix-user-profiles.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
