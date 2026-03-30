# 人际关系图谱系统测试计划

## 测试范围

- 关系节点 CRUD 操作
- 关系图谱页面渲染
- 模板填充表单
- 苏格拉底式对话功能

---

## 一、数据库验证

### 1.1 Schema 生成

```bash
pnpm --filter @pebble/web db:generate
```

**预期**：`drizzle.config.ts` 同级生成 migration 文件

### 1.2 Schema 推送（需本地 Postgres 或 Neon DB）

```bash
# 方式一：本地 .env.local 设置 DATABASE_URL
DATABASE_URL=postgresql://user:pass@localhost:5432/pebble pnpm --filter @pebble/web db:push

# 方式二：使用 Neon
DATABASE_URL=postgresql://user:pass@neon.tech/pebble?sslmode=require pnpm --filter @pebble/web db:push
```

**预期**：`relation_nodes` 表成功创建，包含字段：

- `id` (uuid, primary key)
- `user_id` (uuid, FK → user_profiles.id)
- `name` (varchar 100)
- `tags` (text array)
- `relationship_type` (varchar 50)
- `对方特点` (text)
- `期望结果` (text)
- `情境补充` (text)
- `generated_context` (text)
- `position` (integer)
- `created_at` / `updated_at` (timestamp)

### 1.3 验证 user_profiles 扩展

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN ('user_traits', 'user_goals');
```

**预期**：两列存在，类型为 text array

---

## 二、API 单元测试

### 2.1 依赖服务启动

```bash
# 启动开发服务器（API 路由需要）
pnpm --filter @pebble/web dev
```

### 2.2 关系节点 CRUD 测试

#### 创建关系

```bash
curl -X POST http://localhost:3000/api/relations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <CLERK_SESSION_TOKEN>" \
  -d '{
    "name": "我的老板",
    "tags": ["职场", "NPD"],
    "relationshipType": "老板",
    "对方特点": "经常在公开场合否定我的工作成果",
    "期望结果": "减少冲突，建立平等对话"
  }'
```

**预期响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "<uuid>",
    "name": "我的老板",
    "tags": ["职场", "NPD"],
    "generatedContext": "【角色】你现在是我的老板，**经常在公开场合否定我的工作成果**。\n【目标】我希望减少冲突，建立平等对话。..."
  }
}
```

#### 列出关系

```bash
curl http://localhost:3000/api/relations \
  -H "Authorization: Bearer <CLERK_SESSION_TOKEN>"
```

**预期**：返回用户所有关系节点，按 position 排序

#### 获取单个关系

```bash
curl http://localhost:3000/api/relations/<id> \
  -H "Authorization: Bearer <CLERK_SESSION_TOKEN>"
```

#### 更新关系

```bash
curl -X PATCH http://localhost:3000/api/relations/<id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <CLERK_SESSION_TOKEN>" \
  -d '{"name": "我的前老板"}'
```

#### 删除关系

```bash
curl -X DELETE http://localhost:3000/api/relations/<id> \
  -H "Authorization: Bearer <CLERK_SESSION_TOKEN>"
```

**预期**：204 No Content

#### 重新生成上下文

```bash
curl -X POST http://localhost:3000/api/relations/<id>/regenerate \
  -H "Authorization: Bearer <CLERK_SESSION_TOKEN>"
```

### 2.3 错误场景测试

| 场景         | 请求                         | 预期状态码 | 预期错误码   |
| ------------ | ---------------------------- | ---------- | ------------ |
| 未登录创建   | POST /api/relations 无 token | 401        | UNAUTHORIZED |
| 关系不存在   | GET /api/relations/<fake-id> | 404        | NOT_FOUND    |
| 超过10个节点 | 第11次 POST                  | 400        | BAD_REQUEST  |
| 跨用户访问   | DELETE 他人的 relation       | 403        | FORBIDDEN    |
| 名称为空     | POST name=""                 | 400        | BAD_REQUEST  |

### 2.4 对话 API 测试

#### 发送消息

```bash
curl -X POST http://localhost:3000/api/relations/<id>/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <CLERK_SESSION_TOKEN>" \
  -d '{
    "messages": [
      {"role": "user", "content": "我和老板吵架了，很难过"}
    ]
  }'
```

**预期响应** (200):

```json
{
  "success": true,
  "data": {
    "response": "听到你感到难过...",
    "systemPrompt": "你是一位苏格拉底式的人生教练..."
  }
}
```

---

## 三、前端功能测试

### 3.1 关系图谱页面 (`/relations`)

#### 初始状态（无数据）

1. 访问 `/relations`
2. **预期**：显示中心节点"我"，无周围节点
3. **预期**：右下角显示"+"添加按钮
4. **预期**：光晕背景动画正常

#### 添加节点后

1. 点击"+"按钮 → 跳转 `/relations/new`
2. 填写表单并提交
3. 返回 `/relations`
4. **预期**：新节点出现在圆形轨道上
5. **预期**：中心到节点的连接线动画
6. **预期**：节点文字显示关系名称（截断6字）

#### 节点交互

1. Hover 节点 → **预期**：节点放大（scale 1.1）
2. 点击节点 → **预期**：底部弹出详情卡片
3. 点击"开始对话" → **预期**：跳转 `/relations/<id>/chat`

#### 满10节点

1. 添加第10个节点
2. **预期**：不再显示"+"按钮

### 3.2 新增关系表单 (`/relations/new`)

#### 表单字段测试

| 字段       | 操作               | 预期               |
| ---------- | ------------------ | ------------------ |
| 关系名称   | 留空提交           | 按钮禁用           |
| 关系名称   | 输入"我的老板张总" | 正常显示           |
| 关系名称   | 超过100字          | 输入被截断         |
| 关系类型   | 点击"老板"         | 按钮高亮为 primary |
| 标签       | 点击"职场"、"NPD"  | 标签变为选中态     |
| 自定义标签 | 输入"测试"点击添加 | 标签出现在列表     |
| 自定义标签 | 点击已有标签的 ×   | 标签被移除         |
| 对方特点   | 输入多行文本       | textarea 正常换行  |
| 期望结果   | 输入文本           | 正常保存           |
| 情境补充   | 可选字段           | 留空不影响提交     |

#### 提交流程

1. 填写必填字段（名称）
2. 点击"创建关系"
3. **预期**：显示 loading 状态
4. **预期**：成功后跳转 `/relations`
5. **预期**：图谱显示新节点

### 3.3 关系对话页面 (`/relations/<id>/chat`)

#### 初始加载

1. 访问 `/relations/<id>/chat`
2. **预期**：显示头部（关系名称、类型、标签）
3. **预期**：显示欢迎消息卡片
4. **预期**：底部输入框可用

#### 欢迎消息内容

```
欢迎来到 [关系名] 的对话空间

我会通过提问帮助你探索这段关系中的感受和想法...
你可以自由地分享任何想法。也许我们可以从最近发生的一件事开始？
```

#### 发送消息

1. 输入"我和老板吵架了，很难过"
2. 按 Enter 或点击"发送"
3. **预期**：用户消息出现在右侧（蓝色）
4. **预期**：显示 loading 动画（三个点跳动）
5. **预期**：AI 回复出现在左侧（半透明背景）
6. **预期**：回复内容为苏格拉底式提问

#### 苏格拉底式回复验证

| 用户输入       | AI 应包含关键词      |
| -------------- | -------------------- |
| 难过/伤心/痛苦 | 感受、身体描述、探索 |
| 生气/愤怒      | 保护性情绪、触发点   |
| 不知道/迷茫    | 困惑的画面、探索内心 |
| 老板/职场      | 职场关系、模式探索   |
| 父母/家庭      | 家庭、关系模式       |

#### 多轮对话

1. 继续输入多个消息
2. **预期**：消息列表正常滚动
3. **预期**：历史消息保持可见

#### 输入框

1. 输入框为空 → **预期**：发送按钮禁用
2. 输入文本 → **预期**：按钮启用
3. Shift+Enter → **预期**：换行
4. Enter → **预期**：发送消息

#### 返回导航

1. 点击"返回图谱"
2. **预期**：跳转 `/relations`

---

## 四、集成测试

### 4.1 完整用户流程

```
1. 访问 /relations
   → 初始空状态 ✓

2. 点击 "+"
   → 跳转 /relations/new ✓

3. 填写表单:
   - 名称: "我的 NPD 老板"
   - 类型: 老板
   - 标签: 职场, NPD
   - 对方特点: "经常否定我的工作，喜欢在公开场合批评我"
   - 期望结果: "减少冲突，建立平等对话"
   → 提交 ✓

4. 返回 /relations
   → 节点出现在图谱 ✓

5. 点击节点
   → 底部弹出详情卡片 ✓

6. 点击"开始对话"
   → 跳转 /relations/<id>/chat ✓

7. AI 欢迎消息显示
   → "欢迎来到我的 NPD 老板的对话空间" ✓

8. 发送: "他今天又批评我了"
   → 用户消息显示 ✓
   → AI 回复（苏格拉底式提问）✓

9. 点击"返回图谱"
   → 返回 /relations ✓

10. 长按/右键节点 → 编辑/删除选项
    → 可以修改关系 ✓
    → 可以删除关系 ✓
```

### 4.2 边界条件

| 场景         | 操作                              | 预期                           |
| ------------ | --------------------------------- | ------------------------------ |
| 10个节点上限 | 添加第11个关系                    | 提示"最多只能添加10个关系节点" |
| 位置重算     | 删除中间节点                      | 剩余节点 position 自动重排     |
| 空名称       | 提交 name=""                      | 表单验证失败                   |
| 超长名称     | 提交超过100字                     | 输入被阻止                     |
| 无效关系ID   | 访问 /relations/invalid-uuid/chat | 404 页面或错误提示             |

---

## 五、性能测试

### 5.1 图谱渲染性能

```javascript
// 在浏览器控制台执行
performance.mark("render-start");
// 触发页面渲染
performance.mark("render-end");
performance.measure("图谱渲染", "render-start", "render-end");
```

**预期**：10节点渲染 < 100ms

### 5.2 API 响应时间

```bash
time curl -s -o /dev/null -w "%{http_code} %{time_total}s" \
  http://localhost:3000/api/relations
```

**预期**：GET < 200ms, POST < 500ms

---

## 六、视觉检查清单

### 6.1 图谱页面

- [ ] 背景光晕动画正常
- [ ] 中心节点渐变紫色
- [ ] 轨道圆环虚线显示
- [ ] 节点颜色根据标签变化
- [ ] 连接线动画流畅
- [ ] 响应式布局（不同屏幕宽度）

### 6.2 表单页面

- [ ] 输入框样式一致
- [ ] 标签选择器选中态明显
- [ ] 自定义标签添加/删除正常
- [ ] Loading 状态显示正确
- [ ] 错误提示样式清晰

### 6.3 对话页面

- [ ] 消息气泡左右对齐正确
- [ ] AI 消息左侧（半透明）
- [ ] 用户消息右侧（primary 色）
- [ ] 时间戳显示正确
- [ ] 输入框 placeholder 显示
- [ ] 发送按钮状态正确

---

## 七、测试环境准备

### 7.1 环境变量

```bash
# apps/web/.env.local
DATABASE_URL=postgresql://user:pass@localhost:5432/pebble
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 7.2 测试用户

1. 在 Supabase Dashboard 创建测试用户
2. 登录测试账号
3. 获取 session token 用于 API 测试

### 7.3 测试数据清理

```bash
# 测试后清理
curl -X DELETE http://localhost:3000/api/relations/<test-id> \
  -H "Authorization: Bearer <TOKEN>"
```
