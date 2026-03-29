# 关系洞察闭环系统 - 剩余任务实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成关系洞察闭环系统的页面集成、实时状态、画像展示和端到端测试，实现从聊天到洞察的完整闭环体验。

**Architecture:** 采用前端组件集成模式，将行为模式面板嵌入现有关系详情页。通过 Zustand store 管理状态，配合 React Query/SWR 实现实时轮询。画像仪表盘使用 recharts 可视化类型分布和置信度趋势。

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand, Drizzle ORM

---

## Chunk 1: 页面集成 - 行为模式面板嵌入关系详情页

### Task 1.1: Create RelationBehaviorPanel Component

**Files:**
- Create: `apps/web/components/relations/RelationBehaviorPanel.tsx`
- Create: `apps/web/components/relations/__tests__/RelationBehaviorPanel.test.tsx`

**Purpose:** 封装行为模式面板为独立组件，可嵌入关系详情页侧边栏。

- [ ] **Step 1: Write the failing test**

```tsx
// apps/web/components/relations/__tests__/RelationBehaviorPanel.test.tsx
import { render, screen } from '@testing-library/react';
import { RelationBehaviorPanel } from '../RelationBehaviorPanel';

describe('RelationBehaviorPanel', () => {
  it('should render loading state initially', () => {
    render(<RelationBehaviorPanel relationId="test-relation-1" />);
    expect(screen.getByText(/加载中/i)).toBeInTheDocument();
  });

  it('should render pattern list when data loaded', async () => {
    render(<RelationBehaviorPanel relationId="test-relation-1" />);
    expect(await screen.findByText(/沟通风格/i)).toBeInTheDocument();
  });

  it('should render empty state when no patterns', async () => {
    render(<RelationBehaviorPanel relationId="empty-relation" />);
    expect(await screen.findByText(/暂无行为模式/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && npm test -- RelationBehaviorPanel.test.tsx`
Expected: FAIL with "Cannot find module '../RelationBehaviorPanel'"

- [ ] **Step 3: Write minimal implementation**

```tsx
// apps/web/components/relations/RelationBehaviorPanel.tsx
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useBehaviorStore } from '@/store/behavior-store';
import {
  BehaviorPatternList,
  PatternTypeFilter,
  AnalysisStatusIndicator,
} from './BehaviorPatternCard';

interface RelationBehaviorPanelProps {
  relationId: string;
  className?: string;
}

export function RelationBehaviorPanel({
  relationId,
  className,
}: RelationBehaviorPanelProps) {
  const {
    patterns,
    isLoading,
    selectedType,
    showAcknowledged,
    analysisJobs,
    hasActiveAnalysis,
    loadPatterns,
    setSelectedType,
    acknowledgePattern,
    togglePattern,
    refreshAnalysisStatus,
  } = useBehaviorStore();

  // 初始加载
  useEffect(() => {
    loadPatterns(relationId);
    refreshAnalysisStatus(relationId);
  }, [relationId, loadPatterns, refreshAnalysisStatus]);

  // 过滤模式
  const filteredPatterns = patterns.filter((p) => {
    if (selectedType !== 'all' && p.patternType !== selectedType) return false;
    if (!showAcknowledged && p.userAcknowledged) return false;
    return p.isActive;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100',
        'p-5 space-y-4',
        className
      )}
    >
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">行为洞察</h3>
        <AnalysisStatusIndicator
          hasActiveAnalysis={hasActiveAnalysis}
          onRefresh={() => refreshAnalysisStatus(relationId)}
        />
      </div>

      {/* 类型筛选 */}
      <PatternTypeFilter
        selectedType={selectedType}
        onChange={setSelectedType}
      />

      {/* 模式列表 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : (
        <BehaviorPatternList
          patterns={filteredPatterns}
          onAcknowledge={(id) => acknowledgePattern(relationId, id)}
          onToggleActive={(id, isActive) => togglePattern(relationId, id, isActive)}
        />
      )}
    </motion.div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && npm test -- RelationBehaviorPanel.test.tsx`
Expected: PASS (may need mock for useBehaviorStore)

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/relations/RelationBehaviorPanel.tsx

git add apps/web/components/relations/__tests__/RelationBehaviorPanel.test.tsx
git commit -m "feat: add RelationBehaviorPanel component for behavior insights"
```

---

### Task 1.2: Modify RelationDetail to Include Behavior Panel

**Files:**
- Modify: `apps/web/components/relations/RelationDetail.tsx`
- Test: Manual visual verification

**Purpose:** 在关系详情页侧边栏集成行为模式面板。

- [ ] **Step 1: Add import for RelationBehaviorPanel**

```tsx
// Add to imports in RelationDetail.tsx
import { RelationBehaviorPanel } from './RelationBehaviorPanel';
```

- [ ] **Step 2: Modify layout to include behavior panel**

```tsx
// Modify the return statement to include side panel
// Change from single card to two-column layout on larger screens

return (
  <AnimatePresence>
    {node && colors && (
      <motion.div
        initial={{ opacity: 0, y: 100, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 100, x: '-50%' }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl"
      >
        <div className="flex gap-4 items-end">
          {/* Main relation info card */}
          <div
            className={cn(
              'relative overflow-hidden rounded-[2rem_3rem_2.5rem_4rem] pebble-glass',
              'border shadow-[0_20px_60px_rgba(125,140,159,0.2)]',
              'flex-1'
            )}
          >
            {/* ... existing card content ... */}
          </div>

          {/* Behavior panel - only show on larger screens */}
          <div className="hidden lg:block">
            <RelationBehaviorPanel relationId={node.id} />
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
```

- [ ] **Step 3: Test manually**

1. Navigate to relation graph page
2. Click on a relation node
3. Verify behavior panel appears on the right side
4. Verify panel loads patterns correctly

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/relations/RelationDetail.tsx
git commit -m "feat: integrate behavior panel into relation detail view"
```

---

### Task 1.3: Add Mobile Responsive Behavior Panel

**Files:**
- Create: `apps/web/components/relations/BehaviorPanelSheet.tsx`
- Modify: `apps/web/components/relations/RelationDetail.tsx`

**Purpose:** 移动端显示行为面板的底部弹出层。

- [ ] **Step 1: Write the failing test**

```tsx
// apps/web/components/relations/__tests__/BehaviorPanelSheet.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BehaviorPanelSheet } from '../BehaviorPanelSheet';

describe('BehaviorPanelSheet', () => {
  it('should not render when closed', () => {
    render(
      <BehaviorPanelSheet
        isOpen={false}
        onClose={() => {}}
        relationId="test-1"
      />
    );
    expect(screen.queryByText(/行为洞察/i)).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <BehaviorPanelSheet
        isOpen={true}
        onClose={() => {}}
        relationId="test-1"
      />
    );
    expect(screen.getByText(/行为洞察/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create BehaviorPanelSheet component**

```tsx
// apps/web/components/relations/BehaviorPanelSheet.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RelationBehaviorPanel } from './RelationBehaviorPanel';

interface BehaviorPanelSheetProps {
  isOpen: boolean;
  onClose: () => void;
  relationId: string;
}

export function BehaviorPanelSheet({
  isOpen,
  onClose,
  relationId,
}: BehaviorPanelSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-50 lg:hidden"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
          >
            <div className="bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-auto">
              {/* Drag handle */}
              <div className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b z-10">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">行为洞察</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4">
                <RelationBehaviorPanel relationId={relationId} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Add mobile toggle button to RelationDetail**

```tsx
// In RelationDetail.tsx, add mobile toggle button
// Near the "开始对话" button, add:

<button
  onClick={() => setShowBehaviorPanel(true)}
  className={cn(
    'lg:hidden w-full py-2 rounded-full font-medium',
    'bg-white/50 border border-gray-200',
    'text-gray-700 hover:bg-white/80',
    'flex items-center justify-center gap-2'
  )}
>
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
  查看洞察
</button>

// And add state and sheet component:
const [showBehaviorPanel, setShowBehaviorPanel] = useState(false);

// At the end of component:
<BehaviorPanelSheet
  isOpen={showBehaviorPanel}
  onClose={() => setShowBehaviorPanel(false)}
  relationId={node.id}
/>
```

- [ ] **Step 4: Test and commit**

Run: Test on mobile viewport
Expected: Toggle button visible, sheet opens/closes correctly

```bash
git add apps/web/components/relations/BehaviorPanelSheet.tsx

git add apps/web/components/relations/RelationDetail.tsx
git commit -m "feat: add mobile responsive behavior panel sheet"
```

---

## Chunk 2: 实时状态 - 分析进度轮询与视觉反馈

### Task 2.1: Add Polling Hook for Analysis Status

**Files:**
- Create: `apps/web/lib/frontend/use-analysis-polling.ts`
- Create: `apps/web/lib/frontend/__tests__/use-analysis-polling.test.ts`

**Purpose:** 自定义 Hook 实现分析状态的自动轮询。

- [ ] **Step 1: Write the failing test**

```tsx
// apps/web/lib/frontend/__tests__/use-analysis-polling.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAnalysisPolling } from '../use-analysis-polling';

describe('useAnalysisPolling', () => {
  it('should start with idle status', () => {
    const { result } = renderHook(() =>
      useAnalysisPolling({ relationId: 'test-1' })
    );
    expect(result.current.status).toBe('idle');
  });

  it('should poll when enabled', async () => {
    const { result } = renderHook(() =>
      useAnalysisPolling({ relationId: 'test-1', enabled: true })
    );
    await waitFor(() => {
      expect(result.current.status).not.toBe('idle');
    });
  });
});
```

- [ ] **Step 2: Implement the hook**

```tsx
// apps/web/lib/frontend/use-analysis-polling.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAnalysisStatus } from './behavior-client';

export type AnalysisStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'error';

interface UseAnalysisPollingOptions {
  relationId: string;
  enabled?: boolean;
  interval?: number; // ms
  onComplete?: () => void;
}

interface UseAnalysisPollingReturn {
  status: AnalysisStatus;
  jobCount: number;
  lastUpdated: Date | null;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAnalysisPolling({
  relationId,
  enabled = true,
  interval = 5000, // 5 seconds default
  onComplete,
}: UseAnalysisPollingOptions): UseAnalysisPollingReturn {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [jobCount, setJobCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const prevStatusRef = useRef<AnalysisStatus>('idle');

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const result = await getAnalysisStatus(relationId);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch status');
      }

      const hasActive = result.data.hasActive;
      const jobs = result.data.jobs || [];
      const pendingJobs = jobs.filter(
        (j) => j.status === 'pending' || j.status === 'processing'
      );

      // Determine status
      let newStatus: AnalysisStatus;
      if (pendingJobs.length > 0) {
        const hasProcessing = pendingJobs.some((j) => j.status === 'processing');
        newStatus = hasProcessing ? 'processing' : 'pending';
      } else {
        newStatus = 'idle';
      }

      // Check for completion transition
      if (
        (prevStatusRef.current === 'pending' || prevStatusRef.current === 'processing') &&
        newStatus === 'idle' &&
        onComplete
      ) {
        onComplete();
      }

      prevStatusRef.current = newStatus;
      setStatus(newStatus);
      setJobCount(pendingJobs.length);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus('error');
    }
  }, [relationId, onComplete]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    refresh();

    // Setup polling interval
    const intervalId = setInterval(refresh, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, refresh]);

  return {
    status,
    jobCount,
    lastUpdated,
    error,
    refresh,
  };
}
```

- [ ] **Step 3: Run tests and commit**

Run: `cd apps/web && npm test -- use-analysis-polling.test.ts`
Expected: PASS

```bash
git add apps/web/lib/frontend/use-analysis-polling.ts
git add apps/web/lib/frontend/__tests__/use-analysis-polling.test.ts
git commit -m "feat: add useAnalysisPolling hook for real-time analysis status"
```

---

### Task 2.2: Create AnalysisProgressIndicator Component

**Files:**
- Create: `apps/web/components/relations/AnalysisProgressIndicator.tsx`

**Purpose:** 可视化分析进度，包含进度条、状态文本和动画效果。

- [ ] **Step 1: Create component with visual feedback**

```tsx
// apps/web/components/relations/AnalysisProgressIndicator.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAnalysisPolling } from '@/lib/frontend/use-analysis-polling';

interface AnalysisProgressIndicatorProps {
  relationId: string;
  onAnalysisComplete?: () => void;
  className?: string;
}

export function AnalysisProgressIndicator({
  relationId,
  onAnalysisComplete,
  className,
}: AnalysisProgressIndicatorProps) {
  const { status, jobCount, refresh } = useAnalysisPolling({
    relationId,
    enabled: true,
    interval: 3000,
    onComplete: onAnalysisComplete,
  });

  if (status === 'idle' || status === 'error') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'bg-gradient-to-r from-blue-50 to-indigo-50',
        'border border-blue-100 rounded-xl p-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Animated spinner */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-30"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-blue-900">
              {status === 'pending' ? '等待分析...' : '正在分析对话...'}
            </span>
            <span className="text-sm text-blue-600">
              {jobCount > 0 && `${jobCount} 个任务`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <motion.div
              animate={{
                width: status === 'pending' ? '30%' : ['40%', '70%', '90%'],
              }}
              transition={{
                duration: status === 'pending' ? 0 : 3,
                repeat: status === 'pending' ? 0 : Infinity,
                ease: 'easeInOut',
              }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            />
          </div>

          <p className="text-xs text-blue-600 mt-2">
            AI 正在识别行为模式，识别到的新模式将自动显示在面板中
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={refresh}
          className="p-2 hover:bg-blue-100 rounded-full transition-colors"
          title="刷新状态"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Integrate into RelationBehaviorPanel**

```tsx
// Add to RelationBehaviorPanel.tsx imports
import { AnalysisProgressIndicator } from './AnalysisProgressIndicator';

// Add after the header section:
<AnalysisProgressIndicator
  relationId={relationId}
  onAnalysisComplete={() => loadPatterns(relationId)}
/>
```

- [ ] **Step 3: Test and commit**

Test: Trigger analysis and verify progress indicator appears
Expected: Spinner animates, progress bar moves, completes when analysis done

```bash
git add apps/web/components/relations/AnalysisProgressIndicator.tsx

git add apps/web/components/relations/RelationBehaviorPanel.tsx
git commit -m "feat: add AnalysisProgressIndicator with real-time polling"
```

---

## Chunk 3: 画像展示 - 关系洞察仪表盘

### Task 3.1: Create ProfileDashboard Component

**Files:**
- Create: `apps/web/components/relations/ProfileDashboard.tsx`
- Install: `recharts` for visualization

**Purpose:** 创建可视化仪表盘展示关系画像数据。

- [ ] **Step 1: Install recharts**

Run: `cd apps/web && npm install recharts`
Expected: Package installed successfully

- [ ] **Step 2: Create ProfileDashboard component**

```tsx
// apps/web/components/relations/ProfileDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import { getRelationProfile } from '@/lib/frontend/relation-client';
import type { RelationProfile, PatternSummary } from '@/lib/backend/services/relation-service';

interface ProfileDashboardProps {
  relationId: string;
  className?: string;
}

const PATTERN_TYPE_COLORS: Record<string, string> = {
  communication_style: '#3B82F6',
  emotional_pattern: '#8B5CF6',
  control_tactics: '#F97316',
  boundary_behavior: '#6366F1',
  conflict_style: '#EF4444',
  empathy_indicator: '#10B981',
};

const PATTERN_TYPE_LABELS: Record<string, string> = {
  communication_style: '沟通风格',
  emotional_pattern: '情绪模式',
  control_tactics: '控制策略',
  boundary_behavior: '边界行为',
  conflict_style: '冲突风格',
  empathy_indicator: '共情指标',
};

export function ProfileDashboard({ relationId, className }: ProfileDashboardProps) {
  const [profile, setProfile] = useState<RelationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await getRelationProfile(relationId);
        if (result.success) {
          setProfile(result.data);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [relationId]);

  if (isLoading) {
    return (
      <div className={cn('p-8 text-center text-gray-500', className)}>
        加载画像数据...
      </div>
    );
  }

  if (!profile || profile.totalPatterns === 0) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-600">暂无足够数据生成画像</p>
        <p className="text-sm text-gray-400 mt-2">继续对话以积累行为模式</p>
      </div>
    );
  }

  // Prepare chart data
  const distributionData = Object.entries(profile.patternDistribution)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: PATTERN_TYPE_LABELS[type] || type,
      value: count,
      color: PATTERN_TYPE_COLORS[type] || '#6B7280',
    }));

  const confidenceData = profile.highConfidencePatterns.map((p) => ({
    name: p.description.slice(0, 20) + '...',
    confidence: Math.round(p.confidence * 100),
    type: PATTERN_TYPE_LABELS[p.type] || p.type,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('space-y-6', className)}
    >
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="总模式数"
          value={profile.totalPatterns}
          subtext={`${profile.activePatterns} 个活跃`}
          color="blue"
        />
        <StatCard
          label="高置信度"
          value={profile.highConfidencePatterns.length}
          subtext="置信度 ≥70%"
          color="green"
        />
        <StatCard
          label="已确认"
          value={profile.acknowledgedPatterns.length}
          subtext="用户已查看"
          color="purple"
        />
      </div>

      {/* Charts */}
      {distributionData.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Distribution Pie Chart */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <h4 className="font-medium text-gray-900 mb-4">模式类型分布</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Confidence Bar Chart */}
          {confidenceData.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h4 className="font-medium text-gray-900 mb-4">高置信度模式</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={confidenceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="confidence" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Recent Patterns */}
      {profile.recentlyObserved.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h4 className="font-medium text-gray-900 mb-4">最近观察到的模式</h4>
          <div className="space-y-2">
            {profile.recentlyObserved.slice(0, 3).map((pattern) => (
              <PatternRow key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: number;
  subtext: string;
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    purple: 'bg-purple-50 text-purple-900',
  };

  return (
    <div className={cn('rounded-xl p-4 text-center', colorClasses[color])}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-xs opacity-60 mt-1">{subtext}</p>
    </div>
  );
}

function PatternRow({ pattern }: { pattern: PatternSummary }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: PATTERN_TYPE_COLORS[pattern.type] || '#6B7280' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {pattern.description}
        </p>
        <p className="text-xs text-gray-500">
          {PATTERN_TYPE_LABELS[pattern.type] || pattern.type} ·
          置信度 {Math.round(pattern.confidence * 100)}% ·
          观察到 {pattern.frequency} 次
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create relation-client.ts API client**

```tsx
// apps/web/lib/frontend/relation-client.ts
import type { RelationProfile } from '@/lib/backend/services/relation-service';
import type { ApiResponse } from '@/types/api';

export async function getRelationProfile(
  relationId: string
): Promise<ApiResponse<RelationProfile>> {
  const response = await fetch(`/api/relations/${relationId}/profile`);
  return response.json();
}
```

- [ ] **Step 4: Add dashboard tab to RelationBehaviorPanel**

```tsx
// In RelationBehaviorPanel.tsx, add tabs
const [activeTab, setActiveTab] = useState<'patterns' | 'dashboard'>('patterns');

// Add before PatternTypeFilter:
<div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
  <button
    onClick={() => setActiveTab('patterns')}
    className={cn(
      'flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors',
      activeTab === 'patterns'
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    )}
  >
    模式列表
  </button>
  <button
    onClick={() => setActiveTab('dashboard')}
    className={cn(
      'flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors',
      activeTab === 'dashboard'
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    )}
  >
    画像分析
  </button>
</div>

// Replace pattern list with conditional rendering:
{activeTab === 'patterns' ? (
  <>
    <PatternTypeFilter ... />
    <BehaviorPatternList ... />
  </>
) : (
  <ProfileDashboard relationId={relationId} />
)}
```

- [ ] **Step 5: Test and commit**

Test: Navigate to dashboard tab, verify charts render correctly
Expected: Pie chart shows distribution, bar chart shows confidence

```bash
git add apps/web/components/relations/ProfileDashboard.tsx

git add apps/web/lib/frontend/relation-client.ts
git add apps/web/components/relations/RelationBehaviorPanel.tsx
git add apps/web/package.json

git commit -m "feat: add ProfileDashboard with charts for relation insights"
```

---

## Chunk 4: 端到端测试 - 完整闭环验证

### Task 4.1: Create E2E Test Setup

**Files:**
- Create: `apps/web/e2e/relation-insight-loop.spec.ts`
- Modify: `playwright.config.ts` (if needed)

**Purpose:** 验证从聊天到洞察的完整闭环。

- [ ] **Step 1: Write E2E test**

```typescript
// apps/web/e2e/relation-insight-loop.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Relation Insight Loop E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login or set up test user
    await page.goto('/relations');
    await page.waitForLoadState('networkidle');
  });

  test('complete insight loop: chat -> analysis -> profile update', async ({ page }) => {
    // 1. Create a new relation
    await page.click('[data-testid="create-relation-button"]');
    await page.fill('[data-testid="relation-name-input"]', 'Test Contact');
    await page.selectOption('[data-testid="relation-type-select"]', '同事');
    await page.click('[data-testid="save-relation-button"]');

    // Wait for relation to appear
    await expect(page.locator('text=Test Contact')).toBeVisible();

    // 2. Click on relation to open detail
    await page.click('text=Test Contact');
    await expect(page.locator('[data-testid="relation-detail"]')).toBeVisible();

    // 3. Start chat
    await page.click('text=开始对话');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

    // 4. Send multiple messages to trigger analysis
    const testMessages = [
      '我老板总是说我做得不够好',
      '他说如果我真的在乎这份工作就会加班',
      '我感觉很沮丧，无论怎么努力都不够',
      '他总是用同样的方式来批评我',
      '我觉得他在操控我的情绪',
    ];

    for (const message of testMessages) {
      await page.fill('[data-testid="chat-input"]', message);
      await page.click('[data-testid="send-message-button"]');
      // Wait for AI response
      await page.waitForTimeout(2000);
    }

    // 5. Close chat and return to relation view
    await page.click('[data-testid="close-chat-button"]');

    // 6. Check behavior panel for analysis progress
    await expect(
      page.locator('[data-testid="analysis-progress-indicator"]')
    ).toBeVisible({ timeout: 10000 });

    // 7. Wait for analysis to complete
    await page.waitForSelector('[data-testid="analysis-progress-indicator"]', {
      state: 'hidden',
      timeout: 60000,
    });

    // 8. Verify patterns appear in panel
    await expect(
      page.locator('[data-testid="behavior-pattern-card"]')
    ).toBeVisible({ timeout: 10000 });

    // 9. Navigate to dashboard tab
    await page.click('text=画像分析');

    // 10. Verify dashboard shows data
    await expect(page.locator('text=模式类型分布')).toBeVisible();
    await expect(page.locator('.recharts-pie')).toBeVisible();

    // 11. Verify profile stats updated
    const totalPatterns = await page
      .locator('[data-testid="stat-total-patterns"]')
      .textContent();
    expect(parseInt(totalPatterns || '0')).toBeGreaterThan(0);
  });

  test('user can acknowledge and manage patterns', async ({ page }) => {
    // Pre-condition: relation with existing patterns
    await page.goto('/relations/test-relation-id');

    // 1. View patterns
    await expect(page.locator('[data-testid="behavior-pattern-card"]')).toBeVisible();

    // 2. Acknowledge a pattern
    await page.click('[data-testid="acknowledge-pattern-button"]');

    // 3. Verify unacknowledged indicator disappears
    await expect(
      page.locator('[data-testid="unacknowledged-badge"]')
    ).toBeHidden();

    // 4. Deactivate a pattern
    await page.click('[data-testid="deactivate-pattern-button"]');

    // 5. Verify pattern grayed out
    await expect(
      page.locator('[data-testid="behavior-pattern-card"].opacity-60')
    ).toBeVisible();
  });
});
```

- [ ] **Step 2: Add data-testid attributes to components**

```tsx
// Add to key components for test selectors

// RelationDetail.tsx - add data-testid="relation-detail"
// Chat input - add data-testid="chat-input"
// Send button - add data-testid="send-message-button"
// AnalysisProgressIndicator - add data-testid="analysis-progress-indicator"
// BehaviorPatternCard - add data-testid="behavior-pattern-card"
```

- [ ] **Step 3: Run E2E test**

Run: `cd apps/web && npx playwright test e2e/relation-insight-loop.spec.ts`
Expected: Tests pass (may need retries for async analysis)

- [ ] **Step 4: Commit**

```bash
git add apps/web/e2e/relation-insight-loop.spec.ts

git add apps/web/components/relations/*.tsx
git commit -m "test: add E2E tests for complete insight loop"
```

---

### Task 4.2: Create Integration Tests for Services

**Files:**
- Create: `apps/web/lib/backend/services/__tests__/analysis-scheduler.integration.test.ts`

**Purpose:** 验证分析调度器与仓储层的集成。

- [ ] **Step 1: Write integration test**

```typescript
// apps/web/lib/backend/services/__tests__/analysis-scheduler.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scheduleAnalysis, processAnalysisJob } from '../analysis-scheduler';
import { analysisQueueRepository } from '../../repositories/analysis-queue-repository';
import { chatMessageRepository } from '../../repositories/chat-message-repository';
import { behaviorPatternRepository } from '../../repositories/behavior-pattern-repository';

describe('Analysis Scheduler Integration', () => {
  const testRelationId = 'test-relation-123';

  beforeEach(async () => {
    // Clean up test data
    await chatMessageRepository.deleteByRelationId(testRelationId);
    const jobs = await analysisQueueRepository.findByRelationId(testRelationId);
    for (const job of jobs) {
      await analysisQueueRepository.delete(job.id);
    }
  });

  afterEach(async () => {
    // Clean up
    await chatMessageRepository.deleteByRelationId(testRelationId);
  });

  it('should schedule analysis when conditions met', async () => {
    // Arrange: Create 3 unanalyzed messages (MIN_MESSAGES threshold)
    for (let i = 0; i < 3; i++) {
      await chatMessageRepository.create({
        relationId: testRelationId,
        role: 'user',
        content: `Test message ${i}`,
        timestamp: new Date(),
      });
    }

    // Act
    const result = await scheduleAnalysis(testRelationId, 'Test Relation');

    // Assert
    expect(result.scheduled).toBe(true);
    expect(result.jobId).toBeDefined();

    const job = await analysisQueueRepository.findById(result.jobId!);
    expect(job).not.toBeNull();
    expect(job?.status).toBe('pending');
  });

  it('should not schedule if insufficient messages', async () => {
    // Arrange: Only 2 messages
    for (let i = 0; i < 2; i++) {
      await chatMessageRepository.create({
        relationId: testRelationId,
        role: 'user',
        content: `Test message ${i}`,
        timestamp: new Date(),
      });
    }

    // Act
    const result = await scheduleAnalysis(testRelationId, 'Test Relation');

    // Assert
    expect(result.scheduled).toBe(false);
    expect(result.reason).toContain('消息不足');
  });

  it('should process job and create patterns', async () => {
    // Arrange
    await chatMessageRepository.create({
      relationId: testRelationId,
      role: 'user',
      content: 'He always says I am not good enough',
      timestamp: new Date(),
    });

    const scheduleResult = await scheduleAnalysis(testRelationId, 'Test Relation');
    expect(scheduleResult.scheduled).toBe(true);

    // Act
    const processResult = await processAnalysisJob(scheduleResult.jobId!);

    // Assert
    expect(processResult.success).toBe(true);

    const job = await analysisQueueRepository.findById(scheduleResult.jobId!);
    expect(job?.status).toBe('completed');
  });
});
```

- [ ] **Step 2: Run integration tests**

Run: `cd apps/web && npm test -- analysis-scheduler.integration.test.ts`
Expected: PASS (requires test database setup)

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/backend/services/__tests__/analysis-scheduler.integration.test.ts
git commit -m "test: add integration tests for analysis scheduler"
```

---

## Final Verification Checklist

Before completing the implementation, verify:

- [ ] All TypeScript errors resolved
- [ ] All unit tests passing
- [ ] E2E tests passing (may need flakiness handling)
- [ ] Mobile responsive design verified
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance: No excessive re-renders
- [ ] Error boundaries in place

## Execution Handoff

After completing all tasks:

```bash
# Final verification
cd apps/web
npm run type-check
npm run test
npm run e2e

# Create final commit
git add .
git commit -m "feat: complete relation insight loop integration

- Add RelationBehaviorPanel with dashboard and patterns tabs
- Implement real-time analysis status polling
- Add ProfileDashboard with charts for insight visualization
- Create mobile responsive behavior panel sheet
- Add comprehensive E2E and integration tests"
```

**Plan complete and saved to `docs/superpowers/plans/2026-03-28-relation-insight-loop-remaining.md`. Ready to execute?**
