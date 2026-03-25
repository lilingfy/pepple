## 任务清单: TB-006 后端 BFF 与接口技术预研

---

### 子任务 1: 后端契约和类型基座

**目标**: 建立所有接口共用的 request / response DTO

**文件**
- `packages/types/src/backend.ts`
- `packages/types/src/index.ts`

**验收点**
- [x] 类型能被后续 route 和 service 直接引用
- [x] 不存在重复定义的接口字段

**实现步骤**
1. [x] 创建 `packages/types` 包结构
2. [x] 定义 DecodeRequest / DecodeResponse DTO
3. [x] 定义 SimulatorRequest / SimulatorResponse DTO
4. [x] 定义 PracticeCreateRequest / PracticeListResponse DTO
5. [x] 定义 BackendErrorResponse 统一错误体
6. [x] 定义 ScenarioItem 和 SessionSnapshot 类型

---

### 子任务 2: 通用后端基础设施

**目标**: 把输入校验、错误体、超时、限流、匿名会话、PII 脱敏封装成公共能力

**文件**
- `apps/web/lib/backend/policy/pii.ts`
- `apps/web/lib/backend/policy/rate-limit.ts`
- `apps/web/lib/backend/policy/timeout.ts`
- `apps/web/lib/backend/errors/index.ts`
- `apps/web/lib/backend/sessions/guest.ts`

**验收点**
- [x] 路由里不再直接散写脱敏逻辑
- [x] 任一上游异常都能转换成稳定错误体

**实现步骤**
1. [x] 实现 `redactSensitiveText()` PII脱敏函数
2. [x] 实现 `createBackendError()` 统一错误创建
3. [x] 实现 `withTimeout()` 超时包装器
4. [x] 实现 `validateWithSchema()` Zod校验工具
5. [x] 实现 `ensureGuestSession()` 匿名会话管理
6. [x] 实现 `normalizeApiFailure()` 错误映射

---

### 子任务 3: 测试体系的最小测试骨架

**目标**: 先让测试目录和配置就位，支持TDD开发

**文件**
- `apps/web/vitest.config.ts`
- `apps/web/tests/backend/setup.ts`
- `apps/web/tests/backend/decode.test.ts` (初始失败测试)
- `apps/web/tests/backend/practice.test.ts` (初始失败测试)
- `apps/web/tests/backend/simulator.test.ts` (初始失败测试)

**验收点**
- [x] vitest 配置支持后端测试（数据库、环境变量）
- [x] 运行 `npm run test:backend` 能执行测试
- [x] 各测试文件包含初始失败测试（待实现功能占位）

**实现步骤**
1. [x] 配置 vitest 后端测试环境（数据库连接、环境变量加载）
2. [x] 创建测试工具函数（数据库清理、mock创建）
3. [x] 编写 decode 路由的初始失败测试
4. [x] 编写 practice 路由的初始失败测试
5. [x] 编写 simulator 路由的初始失败测试

---

### 子任务 4: 数据库模型与迁移

**目标**: 建立后端持久化结构

**文件**
- `apps/web/lib/db/schema.ts` (修改)
- `apps/web/lib/db/migrations/`

**验收点**
- [x] 表结构能支持最小必要存储
- [x] JSONB 字段和索引策略清晰

**实现步骤**
1. [x] 添加 `guest_sessions` 表
2. [x] 添加 `practice_entries` 表
3. [x] 添加 `simulation_turns` 表
4. [x] 更新 `analysis_logs` 表（添加 guest_session_id）
5. [x] 生成并执行迁移

**表结构详情**

```sql
-- guest_sessions
- id: uuid PK
- session_token: varchar(255) unique
- user_id: uuid FK (nullable, 绑定后填充)
- expires_at: timestamp
- created_at: timestamp

-- practice_entries
- id: uuid PK
- guest_session_id: uuid FK (nullable)
- user_id: uuid FK (nullable)
- source_type: varchar(20) -- 'decode' | 'simulator'
- primary_reply: text
- content_jsonb: jsonb
- is_favorite: boolean default false
- is_archived: boolean default false
- created_at: timestamp
- updated_at: timestamp

-- simulation_turns
- id: uuid PK
- session_id: uuid FK -> simulation_sessions
- role: varchar(20) -- 'user' | 'assistant'
- content: text
- analysis_jsonb: jsonb (nullable)
- timestamp: timestamp
- created_at: timestamp
```

---

### 子任务 5: 读心翻译器后端增强

**目标**: 完成 `POST /api/decode`，添加持久化和统一错误处理

**文件**
- `apps/web/lib/backend/services/decode-service.ts`
- `apps/web/app/api/decode/route.ts` (重构)
- `apps/web/tests/backend/decode.test.ts` (测试通过)

**验收点**
- [x] 前端不需要改字段名就能显示结果
- [x] LLM 不可用时仍有稳定响应
- [x] 分析日志写入 analysis_logs 表

**实现步骤** (TDD循环)
1. [x] 运行 decode 测试，确认失败
2. [x] 创建 decode-service.ts 服务层
3. [x] 集成 PII 脱敏到 decode 流程
4. [x] 添加分析日志持久化
5. [x] 统一错误响应格式
6. [x] 支持 guest session 识别
7. [x] 运行测试，确认通过

---

### 子任务 6: practice 后端

**目标**: 完成练习条目的保存、查询、更新、删除

**文件**
- `apps/web/lib/backend/repositories/practice-repository.ts`
- `apps/web/lib/backend/services/practice-service.ts`
- `apps/web/app/api/practice/route.ts`
- `apps/web/app/api/practice/[practiceId]/route.ts`
- `apps/web/tests/backend/practice.test.ts` (测试通过)

**验收点**
- [x] 翻译器保存时默认使用第一条回复建议作为 `primaryReply`
- [x] 陪练场保存时 `primaryReply` 由调用方显式指定
- [x] 练习条目支持收藏和归档状态

**实现步骤** (TDD循环)
1. [x] 运行 practice 测试，确认失败
2. [x] 创建 practice-repository.ts
3. [x] 创建 practice-service.ts
4. [x] 实现 POST /api/practice
5. [x] 实现 GET /api/practice
6. [x] 实现 PATCH /api/practice/[practiceId]
7. [x] 实现 DELETE /api/practice/[practiceId]
8. [x] 运行测试，确认通过

---

### 子任务 7: 模拟陪练场后端持久化

**目标**: 完成场景目录、会话流转、结束总结，迁移到 PostgreSQL

**文件**
- `apps/web/lib/backend/repositories/simulator-repository.ts`
- `apps/web/lib/backend/services/simulator-service.ts` (重构)
- `apps/web/app/api/simulator/route.ts` (重构)
- `apps/web/app/api/simulator/[sessionId]/end/route.ts`
- `apps/web/tests/backend/simulator.test.ts` (测试通过)

**验收点**
- [x] 三个固定场景按稳定顺序返回
- [x] 会话开始、续聊、重启、结束的状态一致
- [x] 右侧面板字段和前端可见卡片一一对应

**实现步骤** (TDD循环)
1. [x] 运行 simulator 测试，确认失败
2. [x] 创建 simulator-repository.ts
3. [x] 重构 simulator-service.ts 使用 Repository
4. [x] 实现 PostgreSQL 持久化
5. [x] 添加 guest session 支持
6. [x] 更新路由层
7. [x] 运行测试，确认通过

---

### 子任务 8: OpenAPI 与文档同步

**目标**: 把实现后的接口契约固化为文档

**文件**
- `docs/backend/openapi.yaml`
- `docs/taskbook/03-验收测试方案.md` (更新)

**验收点**
- [x] `redocly lint` 通过
- [x] 文档中的接口字段与实现一致

**实现步骤**
1. [x] 创建 docs/backend/openapi.yaml
2. [x] 定义 /api/decode 端点
3. [x] 定义 /api/practice 端点
4. [x] 定义 /api/simulator 端点
5. [x] 定义 /api/scenarios 端点
6. [x] 运行 redocly lint 验证

---

## 依赖关系

```
子任务 1 (类型基座)
       │
       ▼
子任务 2 (基础设施)
       │
       ├───────────┬───────────┐
       ▼           ▼           ▼
   子任务 3     子任务 4     (并行准备)
   (测试骨架)   (数据库)
       │           │
       └─────┬─────┘
             ▼
    ┌────┬────┬────┐
    ▼    ▼    ▼    ▼
  子任务5 子任务6 子任务7  子任务8
  (decode)(practice)(simulator)(OpenAPI)
```

## 执行顺序建议

遵循任务书"先补测试，再写实现"原则：

1. 子任务 1，先冻结类型
2. 子任务 2，搭通用基础设施
3. 子任务 3，测试骨架就位（vitest配置、初始失败测试）
4. 子任务 4，数据库迁移就位
5. 子任务 5、6、7 可并行（TDD循环：运行失败测试→实现→测试通过）
6. 子任务 8，文档同步

## 快速开始命令

```bash
# 1. 创建 packages/types 包
cd /home/fhl/project/pebble
mkdir -p packages/types/src

# 2. 安装依赖
cd apps/web
npm install zod

# 3. 配置测试环境 (子任务3)
npm run test:backend

# 4. 数据库迁移 (子任务4)
npm run db:generate
npm run db:migrate

# 5. 开发循环 (子任务5/6/7)
# 运行测试 -> 实现功能 -> 测试通过
npm run test:backend -- --watch
```
