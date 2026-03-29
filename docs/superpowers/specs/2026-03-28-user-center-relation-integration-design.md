# 用户中心与 Relation 集成设计

## 设计日期
2026-03-28

## 背景与目标

当前系统存在以下问题：
1. 点击右上角头像无响应
2. Relation 系统与核心功能（读心翻译）未打通
3. 缺乏统一的用户管理中心

**目标**：建立以用户为中心的信息架构，让用户先建立关系档案，再在使用读心翻译等功能时获得上下文增强的分析结果。

## 用户故事

- 作为用户，我希望点击头像能进入个人中心，管理我的关系档案
- 作为用户，我希望在读心翻译时，系统能结合特定关系对象的背景给出更精准的建议
- 作为用户，我希望在不同页面间保持对当前选中关系的感知

## 架构设计

### 路由结构

```
/me                    → 用户中心首页（仪表盘）
/me/relations          → 关系图谱管理（原 /relations 迁移）
/me/relations/new      → 创建新关系（原 /relations/new 迁移）
/me/relations/[id]     → 关系详情与聊天历史
/me/profile            → 个人资料设置
/translator            → 读心翻译器（增强版）
```

### 状态管理

扩展 Zustand store，添加全局当前关系状态：

```typescript
// store/user-center-store.ts
interface UserCenterState {
  // 当前选中的关系（全局有效）
  selectedRelationId: string | null;
  selectedRelation: RelationNode | null;

  // 操作
  selectRelation: (id: string | null) => void;
  clearSelectedRelation: () => void;
}
```

### 组件层级

```
Header（全局）
├── Navigation Links
├── RelationSelector（新增）
│   ├── 显示：当前选中关系名称
│   └── 点击：跳转 /me/relations
├── NotificationButton
└── UserAvatar
    └── 点击：跳转 /me

/me 页面
├── ProfileSection（用户信息概览）
├── QuickStats（使用统计）
├── CurrentRelationCard（当前关系快捷入口）
└── FeatureShortcuts（功能快捷入口）

/me/relations 页面
├── RelationGraph（关系图谱，原逻辑迁移）
├── RelationDetail（关系详情侧边栏）
└── CreateRelationButton

/translator 页面（增强）
├── Header（含 RelationSelector）
├── InputArea
├── AnalysisResult
└── ReplySuggestions（已注入关系上下文）
```

## 详细设计

### 1. 全局 Header 改造

**位置**：`components/layout/AppHeader.tsx`（新建，替换各页面独立 header）

**功能**：
- 统一导航栏（首页、读心翻译、模拟陪练、急救呼吸）
- **RelationSelector**（新增）：
  - 未选择：显示 "选择关系对象 →"
  - 已选择：显示 "当前：母亲 ▼"
  - 点击跳转 `/me/relations`
- 通知按钮
- 用户头像（点击跳转 `/me`）

### 2. 用户中心首页（/me）

**布局**：
```
┌─────────────────────────────────────┐
│  欢迎回来，{用户名}                    │
├──────────────┬──────────────────────┤
│  当前关系     │  快捷入口             │
│  ┌────────┐  │  ┌────┐ ┌────┐ ┌────┐│
│  │ 头像    │  │  │读心│ │陪练│ │呼吸││
│  │ 母亲    │  │  └────┘ └────┘ └────┘│
│  │ 查看 →  │  │                      │
│  └────────┘  │                      │
├──────────────┴──────────────────────┤
│  关系统计                           │
│  共 5 个关系 | 本月分析 12 次        │
└─────────────────────────────────────┘
```

### 3. 关系管理页（/me/relations）

从原 `/relations` 迁移，保留：
- 圆形图谱布局
- 节点点击选中
- 详情侧边栏
- 新建关系按钮

**新增**：
- "设为当前关系"按钮（选中后全局生效）
- 返回上一页按钮（带 `back` 参数支持）

### 4. 读心翻译器增强

**前端**：复用全局 Header，显示 RelationSelector

**后端**：修改 `analyzeText` 服务，支持可选的 `relationId` 参数：

```typescript
interface AnalyzeOptions {
  text: string;
  context?: string;
  relationId?: string;  // 新增
  skipPII?: boolean;
}

// 如果提供了 relationId，查询关系数据并拼接到 prompt
async function buildContextPrompt(relationId: string): Promise<string> {
  const relation = await getRelationById(relationId);
  if (!relation) return '';

  return `
【对话对象背景信息】
- 姓名：${relation.name}
- 关系类型：${relation.relationshipType || '未指定'}
- 对方特点：${relation.对方特点 || '未记录'}
- 期望结果：${relation.期望结果 || '未记录'}
- 情境补充：${relation.情境补充 || '无'}

请结合以上背景，分析对方话语的潜在意图，并给出针对性的回复建议。
`;
}
```

### 5. Prompt 注入格式

```
System: {原 DECODER_SYSTEM}

User: 请分析以下对话：
"{用户输入}"

{拼接的关系上下文（如有）}
```

## 数据流

```
1. 用户进入 /me/relations
2. 选择关系 "母亲"，点击"设为当前"
3. 全局状态更新：selectedRelationId = "xxx"
4. 用户进入 /translator
5. Header 显示：当前：母亲
6. 用户输入对话，点击解码
7. 请求携带 relationId: "xxx"
8. 后端查询关系数据，拼接 prompt
9. LLM 返回结合上下文的分析结果
```

## 错误处理

| 场景 | 处理策略 |
|------|----------|
| relationId 不存在 | 忽略，使用默认分析 |
| 关系数据不完整 | 仅使用存在的字段拼接 |
| 用户未登录 | 允许使用，但不保存历史 |
| 切换页面后返回 | 保持 selectedRelation 状态 |

## 迁移计划

### 需要迁移的文件

| 原路径 | 新路径 | 操作 |
|--------|--------|------|
| `/app/(main)/relations/page.tsx` | `/app/(main)/me/relations/page.tsx` | 迁移 + 增强 |
| `/app/(main)/relations/new/page.tsx` | `/app/(main)/me/relations/new/page.tsx` | 迁移 |
| `/app/(main)/relations/[id]/chat/page.tsx` | `/app/(main)/me/relations/[id]/page.tsx` | 迁移 + 简化 |
| 各页面独立 Header | `components/layout/AppHeader.tsx` | 新建 |

### 需要新建的文件

- `app/(main)/me/page.tsx` - 用户中心首页
- `app/(main)/me/layout.tsx` - 用户中心布局
- `components/layout/AppHeader.tsx` - 统一头部导航
- `store/user-center-store.ts` - 用户中心状态
- `app/api/relations/[id]/set-current/route.ts` - 设置当前关系 API

## API 变更

### POST /api/decode

**请求体扩展**：
```typescript
interface DecodeRequest {
  text: string;
  context?: string;
  relationId?: string;  // 新增可选字段
}
```

### 新增：POST /api/relations/[id]/set-current

设置当前选中的关系（存储在 session 或 localStorage）。

## 验收标准

**Given** 用户已登录且有多个关系
**When** 用户在 /me/relations 选择一个关系并设为当前
**Then** 进入 /translator 后 Header 显示该关系名称

**Given** 用户在读心翻译器输入对话并选择了一个关系
**When** 点击解码
**Then** API 请求携带 relationId，返回的分析结果包含关系上下文

**Given** 用户点击右上角头像
**When** 头像被点击
**Then** 跳转到 /me 用户中心页面

**Given** 用户未选择任何关系
**When** 进入读心翻译器
**Then** Header 显示 "选择关系对象"，分析使用默认 prompt

## 风险与注意事项

1. **URL 变更**：原 `/relations` 需要 301 重定向到 `/me/relations`
2. **状态持久化**：selectedRelation 需要持久化（localStorage），刷新不丢失
3. **向后兼容**：API 的 relationId 是可选的，不影响旧客户端
4. **权限控制**：用户只能使用自己的关系数据
