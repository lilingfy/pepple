# 用户中心与 Relation 集成实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立以用户为中心的信息架构，让读心翻译器能结合 Relation 上下文提供精准分析

**架构:** 创建统一的用户中心页面 (`/me`) 作为关系管理入口，通过全局状态管理当前选中关系，在译器页面 Header 显示并可跳转切换。后端 API 支持可选的 relationId 参数，将关系信息拼接到 LLM prompt。

**Tech Stack:** Next.js 15, React, TypeScript, Zustand, Tailwind CSS, OpenRouter API

---

## 文件结构

### 新建文件
- `app/(main)/me/page.tsx` - 用户中心首页
- `app/(main)/me/layout.tsx` - 用户中心布局
- `app/(main)/me/relations/page.tsx` - 关系图谱（从原页面迁移）
- `app/(main)/me/relations/new/page.tsx` - 创建关系（从原页面迁移）
- `components/layout/AppHeader.tsx` - 统一头部导航（含 RelationSelector）
- `store/user-center-store.ts` - 用户中心全局状态
- `app/api/relations/[id]/set-current/route.ts` - 设置当前关系 API

### 修改文件
- `app/(main)/translator/page.tsx` - 替换独立 Header 为 AppHeader
- `app/(main)/relations/page.tsx` - 添加迁移提示或重定向
- `app/api/decode/route.ts` - 支持 relationId 参数
- `lib/backend/services/decode-service.ts` - 注入关系上下文到 prompt
- `lib/llm/prompts.ts` - 支持动态上下文拼接

---

## Task 1: 创建用户中心全局状态

**Files:**
- Create: `store/user-center-store.ts`

**背景:** 需要全局管理当前选中的关系，在译器、用户中心等页面间共享状态。

- [ ] **Step 1: 创建 store 文件**

```typescript
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RelationNode } from '@pebble/types';

interface UserCenterState {
  // 当前选中的关系
  selectedRelationId: string | null;
  selectedRelation: RelationNode | null;

  // 操作
  selectRelation: (relation: RelationNode | null) => void;
  clearSelectedRelation: () => void;
  loadSelectedRelation: () => Promise<void>;
}

export const useUserCenterStore = create<UserCenterState>()(
  persist(
    (set, get) => ({
      selectedRelationId: null,
      selectedRelation: null,

      selectRelation: (relation) => {
        set({
          selectedRelationId: relation?.id ?? null,
          selectedRelation: relation,
        });
      },

      clearSelectedRelation: () => {
        set({ selectedRelationId: null, selectedRelation: null });
      },

      loadSelectedRelation: async () => {
        const { selectedRelationId } = get();
        if (!selectedRelationId) return;

        try {
          const response = await fetch(`/api/relations/${selectedRelationId}`);
          if (response.ok) {
            const relation = await response.json();
            set({ selectedRelation: relation });
          }
        } catch (error) {
          console.error('Failed to load selected relation:', error);
        }
      },
    }),
    {
      name: 'pebble-user-center',
      partialize: (state) => ({ selectedRelationId: state.selectedRelationId }),
    }
  )
);
```

- [ ] **Step 2: 导出类型**

确保文件导出类型供其他模块使用：

```typescript
export type { UserCenterState };
```

- [ ] **Step 3: Commit**

```bash
git add store/user-center-store.ts
git commit -m "feat: 用户中心全局状态管理 store

- 支持选中关系的持久化
- 提供 selectRelation/clear/load 方法
- 使用 zustand persist 中间件"
```

---

## Task 2: 创建统一 Header 组件

**Files:**
- Create: `components/layout/AppHeader.tsx`

**背景:** 各页面有独立的 Header，需要统一组件显示 RelationSelector 和导航。

- [ ] **Step 1: 创建 AppHeader 组件**

```typescript
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUserCenterStore } from '@/store/user-center-store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: '首页', href: '/' },
  { label: '读心翻译', href: '/translator' },
  { label: '模拟陪练', href: '/dojo' },
  { label: '急救呼吸', href: '/breathing' },
];

interface AppHeaderProps {
  /** 当前页面路径，用于高亮导航 */
  activeHref?: string;
}

export function AppHeader({ activeHref }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedRelation } = useUserCenterStore();

  const currentPath = activeHref ?? pathname;

  const handleRelationClick = () => {
    // 保存当前路径，以便返回
    const returnUrl = encodeURIComponent(currentPath);
    router.push(`/me/relations?back=${returnUrl}`);
  };

  return (
    <header className="fixed w-full z-50 px-8 py-6 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-white/40">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 group"
        aria-label="Pebble AI 首页"
      >
        <div
          className="w-10 h-10 rounded-[60%_40%_70%_30%/_40%_50%_60%_40%] bg-[#7D8C9F] group-hover:bg-[#A8D8B9] group-hover:rotate-12 group-hover:scale-110 transition-all duration-500"
          aria-hidden="true"
        />
        <span className="text-2xl font-medium tracking-[0.2em] text-[#7D8C9F] group-hover:text-[#A8D8B9] transition-colors duration-500">
          Pebble AI
        </span>
      </Link>

      {/* 主导航 */}
      <nav aria-label="主导航" className="hidden md:flex items-center gap-1 bg-white/40 px-3 py-1.5 rounded-full border border-white/60 shadow-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-7 py-3 rounded-full text-base tracking-widest transition-all duration-300 relative',
                isActive
                  ? 'font-bold text-[#2C3E50] bg-[#A8D8B9]/20'
                  : 'font-light text-[#7D8C9F] hover:bg-[#A8D8B9]/20 hover:text-[#2C3E50] hover:font-medium'
              )}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#A8D8B9] rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 右侧功能区 */}
      <div className="flex items-center gap-4">
        {/* RelationSelector */}
        <button
          type="button"
          onClick={handleRelationClick}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200',
            selectedRelation
              ? 'bg-[#A8D8B9]/20 text-[#2C3E50] hover:bg-[#A8D8B9]/30'
              : 'bg-white/40 text-[#7D8C9F] hover:bg-white/60 border border-dashed border-[#7D8C9F]/30'
          )}
        >
          <span className="material-symbols-outlined text-sm">
            {selectedRelation ? 'person' : 'person_add'}
          </span>
          <span className="text-sm font-medium">
            {selectedRelation ? `当前：${selectedRelation.name}` : '选择关系对象'}
          </span>
          {selectedRelation && <span className="text-xs opacity-60">▼</span>}
        </button>

        {/* 通知按钮 */}
        <button
          type="button"
          aria-label="通知"
          className="relative p-2 rounded-full text-[#7D8C9F] hover:bg-white/50 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-400 rounded-full border border-white" />
        </button>

        {/* 用户头像 */}
        <Link
          href="/me"
          className="w-10 h-10 rounded-full bg-[#7D8C9F]/20 flex items-center justify-center text-[#7D8C9F] hover:ring-2 hover:ring-[#A8D8B9] transition-all overflow-hidden"
          aria-label="用户中心"
        >
          <span className="material-symbols-outlined">person</span>
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: 验证类型**

确保没有 TypeScript 错误：

```bash
cd apps/web && npx tsc --noEmit components/layout/AppHeader.tsx
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add components/layout/AppHeader.tsx
git commit -m "feat: 统一 Header 组件 AppHeader

- 集成 RelationSelector，显示当前选中关系
- 主导航高亮当前页面
- 用户头像点击进入 /me
- 使用全局状态管理选中关系"
```

---

## Task 3: 创建用户中心首页

**Files:**
- Create: `app/(main)/me/page.tsx`
- Create: `app/(main)/me/layout.tsx`

**背景:** 用户点击头像后进入的中心页面，展示个人信息、当前关系、快捷入口。

- [ ] **Step 1: 创建用户中心布局**

```typescript
// app/(main)/me/layout.tsx
import { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';

export default function MeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F6F2] to-[#E8F0EA]">
      <AppHeader activeHref="/me" />
      <div className="pt-24">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: 创建用户中心首页**

```typescript
// app/(main)/me/page.tsx
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useUserCenterStore } from '@/store/user-center-store';
import { useRelationStore } from '@/store/relation-store';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';

const FEATURES = [
  {
    key: 'decoder',
    label: '读心翻译',
    description: '分析对话潜台词，生成回复建议',
    href: '/translator',
    icon: 'psychology',
    color: 'from-[#A8D8B9] to-[#7D8C9F]',
  },
  {
    key: 'simulator',
    label: '模拟陪练',
    description: '与 AI 模拟对话，练习边界设定',
    href: '/dojo',
    icon: 'sports_martial_arts',
    color: 'from-[#BCA564] to-[#9A8544]',
  },
  {
    key: 'breathing',
    label: '急救呼吸',
    description: '情绪急救，快速恢复平静',
    href: '/breathing',
    icon: 'air',
    color: 'from-[#7D8C9F] to-[#5A6A7A]',
  },
];

export default function MePage() {
  const { selectedRelation, loadSelectedRelation } = useUserCenterStore();
  const { nodes, loadNodes } = useRelationStore();

  useEffect(() => {
    loadSelectedRelation();
    loadNodes();
  }, [loadSelectedRelation, loadNodes]);

  const relationCount = nodes.length;
  const totalAnalyses = 12; // TODO: 从实际数据获取

  return (
    <main className="container mx-auto px-6 py-8 max-w-5xl">
      {/* 欢迎区 */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
          欢迎回来
        </h1>
        <p className="text-[#7D8C9F]">
          管理你的关系档案，让 AI 更懂你
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* 当前关系卡片 */}
        <section className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/60">
          <div className="flex items-center gap-2 mb-4">
            <MaterialSymbol icon="hub" className="text-[#A8D8B9]" />
            <h2 className="text-lg font-semibold text-[#2C3E50]">当前关系</h2>
          </div>

          {selectedRelation ? (
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8D8B9] to-[#7D8C9F] flex items-center justify-center text-white text-2xl font-bold">
                {selectedRelation.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#2C3E50]">
                  {selectedRelation.name}
                </h3>
                <p className="text-sm text-[#7D8C9F] mt-1">
                  {selectedRelation.relationshipType || '未指定关系类型'}
                </p>
                {selectedRelation.对方特点 && (
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    特点：{selectedRelation.对方特点}
                  </p>
                )}
                <Link
                  href="/me/relations"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-[#A8D8B9] hover:text-[#8BC4A0] transition-colors"
                >
                  管理关系
                  <MaterialSymbol icon="arrow_forward" className="text-sm" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <MaterialSymbol icon="person_add" className="text-2xl text-slate-400" />
              </div>
              <p className="text-slate-500 mb-3">还没有选择关系对象</p>
              <Link
                href="/me/relations"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#A8D8B9] text-white rounded-full text-sm hover:bg-[#8BC4A0] transition-colors"
              >
                <MaterialSymbol icon="add" className="text-sm" />
                选择或创建关系
              </Link>
            </div>
          )}
        </section>

        {/* 统计卡片 */}
        <section className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/60">
          <div className="flex items-center gap-2 mb-4">
            <MaterialSymbol icon="insights" className="text-[#BCA564]" />
            <h2 className="text-lg font-semibold text-[#2C3E50]">使用统计</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-[#A8D8B9]/10 rounded-2xl">
              <div className="text-3xl font-bold text-[#A8D8B9]">{relationCount}</div>
              <div className="text-sm text-[#7D8C9F]">关系档案</div>
            </div>
            <div className="text-center p-4 bg-[#BCA564]/10 rounded-2xl">
              <div className="text-3xl font-bold text-[#BCA564]">{totalAnalyses}</div>
              <div className="text-sm text-[#7D8C9F]">本月分析</div>
            </div>
          </div>
        </section>
      </div>

      {/* 功能快捷入口 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[#2C3E50] mb-4 flex items-center gap-2">
          <MaterialSymbol icon="apps" className="text-[#7D8C9F]" />
          快捷入口
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.key}
              href={feature.href}
              className="group bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/60 hover:shadow-md transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <MaterialSymbol icon={feature.icon} />
              </div>
              <h3 className="font-semibold text-[#2C3E50] mb-1">{feature.label}</h3>
              <p className="text-sm text-[#7D8C9F]">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 关系管理入口 */}
      <section className="bg-gradient-to-r from-[#A8D8B9]/20 to-[#7D8C9F]/20 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2C3E50] mb-1">
              管理你的人际关系图谱
            </h2>
            <p className="text-sm text-[#7D8C9F]">
              为不同关系对象建立档案，让 AI 分析更精准
            </p>
          </div>
          <Link
            href="/me/relations"
            className="flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-full hover:bg-[#3D4F5F] transition-colors"
          >
            <MaterialSymbol icon="hub" className="text-sm" />
            进入图谱
          </Link>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: 验证编译**

```bash
cd apps/web && npx tsc --noEmit app/(main)/me/page.tsx app/(main)/me/layout.tsx
```

Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add app/(main)/me/
git commit -m "feat: 用户中心首页 /me

- 展示当前选中关系
- 使用统计卡片
- 功能快捷入口
- 关系管理引导"
```

---

## Task 4: 迁移关系管理页面到 /me/relations

**Files:**
- Create: `app/(main)/me/relations/page.tsx`
- Create: `app/(main)/me/relations/layout.tsx`
- Modify: `components/relations/RelationDetail.tsx`

**背景:** 将原 `/relations` 页面迁移到 `/me/relations`，并增强"设为当前"功能。

- [ ] **Step 1: 创建 relations 布局**

```typescript
// app/(main)/me/relations/layout.tsx
import { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';

export default function RelationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F6F2] to-[#E8F0EA]">
      <AppHeader activeHref="/me/relations" />
      <div className="pt-24">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: 复制并增强原 relations 页面**

复制 `app/(main)/relations/page.tsx` 内容到 `app/(main)/me/relations/page.tsx`，然后修改：

```typescript
// 在 imports 中添加
import { useUserCenterStore } from '@/store/user-center-store';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// 在组件内部添加
export default function MeRelationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backUrl = searchParams.get('back') || '/me';

  const { nodes, isLoading, error, loadNodes, selectNode, selectedNodeId } = useRelationStore();
  const { selectRelation, selectedRelationId } = useUserCenterStore();
  const [selectedNode, setSelectedNode] = useState<RelationNode | null>(null);

  // ... 原有逻辑

  // 新增：设为当前关系
  const handleSetAsCurrent = useCallback(() => {
    if (selectedNode) {
      selectRelation(selectedNode);
      // 如果有返回路径，跳转回去
      if (backUrl && backUrl !== '/me/relations') {
        router.push(decodeURIComponent(backUrl));
      }
    }
  }, [selectedNode, selectRelation, router, backUrl]);

  return (
    <div className="min-h-screen fluid-bg relative overflow-hidden">
      {/* 头部 - 修改返回按钮逻辑 */}
      <header className="relative z-10 px-8 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href={decodeURIComponent(backUrl)}
            className="w-10 h-10 rounded-full pebble-glass flex items-center justify-center hover:bg-white/50 transition-colors"
          >
            <MaterialSymbol icon="arrow_back" />
          </Link>
          <h1 className="text-3xl font-bold text-[#2C3E50]">人际关系图谱</h1>
        </div>
        <p className="text-[#7D8C9F] ml-[52px]">
          点击节点查看详情，点击"设为当前"在读心翻译中使用
        </p>
      </header>

      {/* ... 原有图谱内容 ... */}

      {/* 修改 RelationDetail 调用，添加设为当前按钮 */}
      <RelationDetail
        node={selectedNode}
        onStartChat={handleStartChat}
        onClose={handleCloseDetail}
        onSetAsCurrent={handleSetAsCurrent}
        isCurrent={selectedNode?.id === selectedRelationId}
      />
    </div>
  );
}
```

- [ ] **Step 3: 修改 RelationDetail 组件支持新 props**

```typescript
// components/relations/RelationDetail.tsx
interface RelationDetailProps {
  node: RelationNode | null;
  onStartChat: () => void;
  onClose: () => void;
  onSetAsCurrent?: () => void;  // 新增
  isCurrent?: boolean;          // 新增
}

// 在组件渲染中添加按钮
{onSetAsCurrent && (
  <button
    onClick={onSetAsCurrent}
    disabled={isCurrent}
    className={cn(
      'w-full py-3 rounded-xl font-medium transition-colors mb-3',
      isCurrent
        ? 'bg-[#A8D8B9]/30 text-[#A8D8B9] cursor-default'
        : 'bg-[#A8D8B9] text-white hover:bg-[#8BC4A0]'
    )}
  >
    {isCurrent ? '当前使用中' : '设为当前关系'}
  </button>
)}
```

- [ ] **Step 4: Commit**

```bash
git add app/(main)/me/relations/ components/relations/RelationDetail.tsx
git commit -m "feat: 迁移关系图谱到 /me/relations

- 支持返回路径参数
- 添加设为当前关系功能
- RelationDetail 增强新 props"
```

---

## Task 5: 迁移创建关系页面

**Files:**
- Create: `app/(main)/me/relations/new/page.tsx`
- Create: `app/(main)/me/relations/new/layout.tsx`

**背景:** 创建关系页面迁移到新路径。

- [ ] **Step 1: 复制原创建页面**

将 `app/(main)/relations/new/page.tsx` 复制到 `app/(main)/me/relations/new/page.tsx`，修改返回路径：

```typescript
// 修改返回按钮
const handleBack = () => {
  router.push('/me/relations');
};

// 创建成功后
router.push('/me/relations');
```

- [ ] **Step 2: 创建布局文件**

```typescript
// app/(main)/me/relations/new/layout.tsx
import { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';

export default function NewRelationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F6F2] to-[#E8F0EA]">
      <AppHeader activeHref="/me/relations" />
      <div className="pt-24">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(main)/me/relations/new/
git commit -m "feat: 迁移创建关系到 /me/relations/new"
```

---

## Task 6: 修改译器页面使用统一 Header

**Files:**
- Modify: `app/(main)/translator/page.tsx`

**背景:** 移除译器页面的独立 Header，使用 AppHeader。

- [ ] **Step 1: 添加 import**

```typescript
import { AppHeader } from '@/components/layout/AppHeader';
```

- [ ] **Step 2: 替换 Header**

删除 `TranslatorContent` 内部的 header 代码（约 183-223 行），替换为：

```tsx
<AppHeader activeHref="/translator" />
```

- [ ] **Step 3: 调整布局**

确保页面有正确的上边距（AppHeader 是 fixed）：

```tsx
<main className="min-h-screen fluid-bg-translator relative overflow-hidden pt-24">
  {/* ... 原内容 ... */}
</main>
```

- [ ] **Step 4: 验证编译**

```bash
cd apps/web && npx tsc --noEmit app/(main)/translator/page.tsx
```

- [ ] **Step 5: Commit**

```bash
git add app/(main)/translator/page.tsx
git commit -m "refactor: 译器页面使用统一 AppHeader

- 移除独立 Header 实现
- 使用全局 AppHeader 组件
- 显示当前选中关系"
```

---

## Task 7: 后端 API 支持 relationId 参数

**Files:**
- Modify: `app/api/decode/route.ts`
- Modify: `lib/backend/services/decode-service.ts`

**背景:** API 需要接收可选的 relationId，并将其信息注入 prompt。

- [ ] **Step 1: 修改 decode API route**

```typescript
// app/api/decode/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, context, relationId } = body;  // 提取 relationId

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid text field' },
        { status: 400 }
      );
    }

    const result = await analyzeText({
      text,
      context,
      relationId,  // 传递给服务
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    // ... 错误处理
  }
}
```

- [ ] **Step 2: 修改 analyzeText 服务**

```typescript
// lib/backend/services/decode-service.ts
interface AnalyzeOptions {
  text: string;
  context?: string;
  relationId?: string;  // 新增
  skipPII?: boolean;
}

// 新增：构建关系上下文
async function buildRelationContext(relationId: string): Promise<string> {
  try {
    // 这里简化处理，实际应该调用 relation service
    // 先 mock 实现，后续集成真实查询
    return '';
  } catch {
    return '';
  }
}

export async function analyzeText(options: AnalyzeOptions): Promise<DecodeResponse> {
  const { text, context, relationId, skipPII = false } = options;

  // ... 验证和 PII 处理 ...

  // 构建关系上下文
  const relationContext = relationId
    ? await buildRelationContext(relationId)
    : '';

  // 拼接完整上下文
  const fullContext = [context, relationContext].filter(Boolean).join('\n\n');

  try {
    const analysis = await withTimeout(
      performLLMAnalysis(processedText, fullContext),
      FALLBACK_TIMEOUT_MS,
      'LLM analysis timed out'
    );
    // ... 后续处理
  } catch (error) {
    // ... fallback
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/decode/route.ts lib/backend/services/decode-service.ts
git commit -m "feat: API 支持 relationId 参数

- decode route 接收并传递 relationId
- analyzeText 服务支持关系上下文构建
- 为后续 prompt 注入做准备"
```

---

## Task 8: 前端译器传递 relationId

**Files:**
- Modify: `lib/frontend/decode-client.ts`
- Modify: `store/translator-store.ts`

**背景:** 译器页面需要将当前选中的 relationId 传递给 API。

- [ ] **Step 1: 修改 decode-client**

```typescript
// lib/frontend/decode-client.ts
interface DecodeRequest {
  text: string;
  context?: string;
  relationId?: string;  // 新增
}

export async function decode(request: DecodeRequest): Promise<DecodeResponse> {
  const { text, context, relationId } = request;

  const controller = new AbortController();

  const fetchPromise = fetch('/api/decode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, context, relationId }),  // 包含 relationId
    signal: controller.signal,
  });

  // ... 后续逻辑不变
}
```

- [ ] **Step 2: 修改 translator store**

```typescript
// store/translator-store.ts
import { useUserCenterStore } from './user-center-store';

// 在 decode 方法中
async decode() {
  const { inputText } = get();
  if (!inputText.trim()) return;

  set({ status: 'analyzing', error: null });

  try {
    // 获取当前选中的 relation
    const { selectedRelationId } = useUserCenterStore.getState();

    const result = await decode({
      text: inputText,
      relationId: selectedRelationId || undefined,
    });

    set({ status: 'result', result });
  } catch (error) {
    set({
      status: 'error',
      error: error instanceof Error ? error.message : '分析失败',
    });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/frontend/decode-client.ts store/translator-store.ts
git commit -m "feat: 译器前端传递 relationId

- decode-client 支持 relationId 参数
- translator store 读取全局选中关系并传递"
```

---

## Task 9: 添加关系上下文到 Prompt

**Files:**
- Modify: `lib/backend/services/decode-service.ts`
- Modify: `lib/llm/prompts.ts`

**背景:** 将关系信息格式化为文本，拼接到 system prompt。

- [ ] **Step 1: 修改 prompts.ts**

```typescript
// lib/llm/prompts.ts
/**
 * 构建注入关系上下文的 system prompt
 */
export function buildDecoderSystemWithContext(relationContext: string): string {
  if (!relationContext) return DECODER_SYSTEM;

  return `${DECODER_SYSTEM}

【当前对话对象背景】
${relationContext}

请结合以上背景信息，分析对方话语的潜在意图，并给出针对性的回复建议。背景信息是用户的私人笔记，分析时需考虑但不要直接引用。`;
}
```

- [ ] **Step 2: 完善 buildRelationContext**

```typescript
// lib/backend/services/decode-service.ts
import { db } from '@/lib/db';
import { relations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function buildRelationContext(relationId: string): Promise<string> {
  try {
    if (!db) return '';

    const [relation] = await db
      .select()
      .from(relations)
      .where(eq(relations.id, relationId))
      .limit(1);

    if (!relation) return '';

    const parts: string[] = [];

    if (relation.name) parts.push(`- 姓名：${relation.name}`);
    if (relation.relationshipType) parts.push(`- 关系类型：${relation.relationshipType}`);
    if (relation.对方特点) parts.push(`- 对方特点：${relation.对方特点}`);
    if (relation.期望结果) parts.push(`- 期望结果：${relation.期望结果}`);
    if (relation.情境补充) parts.push(`- 情境补充：${relation.情境补充}`);
    if (relation.generatedContext) parts.push(`- 系统生成画像：${relation.generatedContext}`);

    return parts.join('\n');
  } catch (error) {
    console.error('Failed to build relation context:', error);
    return '';
  }
}
```

- [ ] **Step 3: 修改 performLLMAnalysis 使用带上下文的 prompt**

```typescript
// lib/backend/services/decode-service.ts
import { buildDecoderSystemWithContext } from '@/lib/llm/prompts';

async function performLLMAnalysis(
  text: string,
  context?: string
): Promise<EmotionAnalysisWithReplies> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw createBackendError('SERVICE_UNAVAILABLE', 'OpenRouter API key not configured');
  }

  // context 已经包含关系上下文，直接传递
  const result = await callOpenRouterDecoder(text, apiKey, context);

  // ... 后续映射逻辑不变
}
```

- [ ] **Step 4: 修改 openrouter.ts 支持自定义 system prompt**

```typescript
// lib/llm/openrouter.ts
export async function callOpenRouterDecoder(
  text: string,
  apiKey: string,
  customContext?: string,  // 新增参数
  siteUrl?: string,
  siteName?: string
): Promise<...> {
  // ...

  const systemPrompt = customContext
    ? buildDecoderSystemWithContext(customContext)
    : DECODER_SYSTEM;

  const response = await fetch(OPENROUTER_API_URL, {
    // ...
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请分析以下对话：\n\n"${text}"` },
      ],
      // ...
    }),
  });
  // ...
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/llm/prompts.ts lib/backend/services/decode-service.ts lib/llm/openrouter.ts
git commit -m "feat: 关系上下文注入 Prompt

- buildRelationContext 查询关系数据
- buildDecoderSystemWithContext 构建带上下文的 system prompt
- performLLMAnalysis 和 callOpenRouterDecoder 支持自定义上下文"
```

---

## Task 10: 设置原 /relations 重定向

**Files:**
- Modify: `app/(main)/relations/page.tsx`

**背景:** 保持旧链接可用，自动跳转到新路径。

- [ ] **Step 1: 替换原页面为重定向**

```typescript
// app/(main)/relations/page.tsx
import { redirect } from 'next/navigation';

export default function RelationsRedirectPage() {
  redirect('/me/relations');
}
```

- [ ] **Step 2: 删除不再需要的文件**

```bash
rm app/(main)/relations/new/page.tsx
rm app/(main)/relations/layout.tsx  # 如果存在
```

- [ ] **Step 3: Commit**

```bash
git add app/(main)/relations/page.tsx
git commit -m "chore: /relations 重定向到 /me/relations

- 保持旧链接可用
- 删除已迁移的页面文件"
```

---

## Task 11: 端到端测试

**Files:**
- 测试所有修改的文件

**背景:** 验证整个流程工作正常。

- [ ] **Step 1: 类型检查**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 2: 验证路由**

访问以下路径，确认正常工作：
- `/me` - 用户中心首页
- `/me/relations` - 关系图谱
- `/me/relations/new` - 创建关系
- `/translator` - 译器显示 RelationSelector
- `/relations` - 自动跳转到 `/me/relations`

- [ ] **Step 3: 验证功能流程**

1. 在 `/me/relations` 创建关系
2. 选择关系，点击"设为当前"
3. 跳转到 `/translator`，Header 显示关系名称
4. 输入对话解码，观察后端日志确认 relationId 传递
5. 验证返回的分析结果包含关系上下文

- [ ] **Step 4: Commit 测试结果**

```bash
git commit -m "test: 端到端验证用户中心与 Relation 集成

- 验证所有路由正常
- 验证关系选择流程
- 验证 prompt 注入工作"
```

---

## 文件变更汇总

### 新建文件 (7)
- `store/user-center-store.ts`
- `components/layout/AppHeader.tsx`
- `app/(main)/me/page.tsx`
- `app/(main)/me/layout.tsx`
- `app/(main)/me/relations/page.tsx`
- `app/(main)/me/relations/layout.tsx`
- `app/(main)/me/relations/new/page.tsx`
- `app/(main)/me/relations/new/layout.tsx`

### 修改文件 (6)
- `components/relations/RelationDetail.tsx` - 添加设为当前按钮
- `app/(main)/translator/page.tsx` - 使用 AppHeader
- `app/api/decode/route.ts` - 支持 relationId
- `lib/backend/services/decode-service.ts` - 关系上下文注入
- `lib/llm/openrouter.ts` - 支持自定义 system prompt
- `lib/llm/prompts.ts` - 构建带上下文的 prompt
- `lib/frontend/decode-client.ts` - 传递 relationId
- `store/translator-store.ts` - 读取全局关系状态
- `app/(main)/relations/page.tsx` - 重定向

### 删除文件 (2)
- `app/(main)/relations/new/page.tsx`
- `app/(main)/relations/layout.tsx` (如存在)
