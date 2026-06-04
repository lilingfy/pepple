'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { RelationDetail } from '@/components/relations/RelationDetail';
import { RelationNodeCard, RelationNodeCardSkeleton } from '@/components/relations/RelationNode';
import { useRelationStore } from '@/store/relation-store';
import { useUserCenterStore } from '@/store/user-center-store';
import type { RelationNode } from '@pebble/types';

const CENTER_X = 400;
const CENTER_Y = 300;
const ORBIT_RADIUS = 220;
const MAX_NODES = 10;

function getNodePosition(position: number) {
  const slot = ((position % MAX_NODES) + MAX_NODES) % MAX_NODES;
  const angle = (slot / MAX_NODES) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER_X + ORBIT_RADIUS * Math.cos(angle),
    y: CENTER_Y + ORBIT_RADIUS * Math.sin(angle),
  };
}

function sortByGraphPosition(nodes: RelationNode[]) {
  return [...nodes].sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
}

function MeRelationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backParam = searchParams.get('back') ?? '/me';
  const { nodes, isLoading, error, loadNodes, selectNode, selectedNodeId } = useRelationStore();
  const { selectRelation, selectedRelationId } = useUserCenterStore();
  const [selectedNode, setSelectedNode] = useState<RelationNode | null>(null);

  useEffect(() => {
    void loadNodes();
  }, [loadNodes]);

  const backUrl = useMemo(() => {
    return backParam.startsWith('/') && !backParam.startsWith('//') ? backParam : '/me';
  }, [backParam]);

  const handleNodeClick = useCallback((node: RelationNode) => {
    setSelectedNode(node);
    selectNode(node.id);
  }, [selectNode]);

  const handleCloseDetail = useCallback(() => {
    setSelectedNode(null);
    selectNode(null);
  }, [selectNode]);

  const handleSetAsCurrent = useCallback(() => {
    if (!selectedNode) return;

    selectRelation(selectedNode);
    if (backUrl !== '/me/relations') {
      router.push(backUrl);
    }
  }, [backUrl, router, selectRelation, selectedNode]);

  const handleStartChat = useCallback(() => {
    if (!selectedNode) return;

    selectRelation(selectedNode);
    router.push('/translator');
  }, [router, selectRelation, selectedNode]);

  const visibleNodes = sortByGraphPosition(nodes).slice(0, MAX_NODES);

  return (
    <div className="min-h-screen fluid-bg relative overflow-hidden">
      <div className="absolute top-[20%] left-[10%] h-[400px] w-[400px] rounded-full bg-[#A8D8B9]/20 blur-[120px] animate-orb-float pointer-events-none" />
      <div
        className="absolute bottom-[20%] right-[10%] h-[300px] w-[300px] rounded-full bg-[#BCA564]/15 blur-[100px] animate-orb-float pointer-events-none"
        style={{ animationDelay: '-5s' }}
      />
      <div
        className="absolute top-[60%] left-[50%] h-[250px] w-[250px] rounded-full bg-[#7D8C9F]/10 blur-[80px] animate-orb-float pointer-events-none"
        style={{ animationDelay: '-10s' }}
      />

      <header className="relative z-10 px-8 pt-8 pb-6">
        <div className="mb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(backUrl)}
            aria-label="返回上一页"
            className="flex h-10 w-10 items-center justify-center rounded-full pebble-glass transition-colors hover:bg-white/50"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-[#7D8C9F]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-[#2C3E50]">人际关系图谱</h1>
        </div>
        <p className="ml-[52px] text-[#7D8C9F]">
          点击节点查看详情，点击“设为当前关系”后会在读心翻译中使用
        </p>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-280px)] flex-col items-center justify-center">
        {isLoading && nodes.length === 0 ? (
          <div className="flex flex-col items-center gap-8">
            <div className="relative h-[400px] w-[500px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-24 w-24 rounded-full pebble-glass animate-pulse" />
              </div>
              {[0, 1, 2, 3].map((index) => {
                const pos = getNodePosition(index);
                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{ left: pos.x - 40, top: pos.y - 40 }}
                  >
                    <RelationNodeCardSkeleton index={index} />
                  </div>
                );
              })}
            </div>
            <p className="animate-pulse text-[#7D8C9F]">正在加载关系图谱...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => void loadNodes()}
              className="rounded-full bg-[#A8D8B9] px-4 py-2 text-white transition-colors hover:bg-[#8BC4A0]"
            >
              重试
            </button>
          </div>
        ) : (
          <>
            <svg
              width="800"
              height="600"
              viewBox="0 0 800 600"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={ORBIT_RADIUS}
                fill="none"
                stroke="rgba(125, 140, 159, 0.15)"
                strokeWidth={2}
                strokeDasharray="12 8"
                className="animate-flow-dash"
              />
              {visibleNodes.map((node, index) => {
                const pos = getNodePosition(node.position);
                return (
                  <motion.line
                    key={`line-${node.id}`}
                    data-testid={`relation-graph-line-${node.id}`}
                    x1={CENTER_X}
                    y1={CENTER_Y}
                    x2={pos.x}
                    y2={pos.y}
                    stroke="rgba(168, 216, 185, 0.4)"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="animate-flow-dash"
                  />
                );
              })}
              <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={ORBIT_RADIUS + 30}
                fill="none"
                stroke="rgba(168, 216, 185, 0.1)"
                strokeWidth={40}
                className="animate-glow-pulse"
              />
            </svg>

            <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full bg-[#A8D8B9]/20 animate-pebble-breathe" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full pebble-glass bg-gradient-to-br from-[#A8D8B9] to-[#7D8C9F] shadow-[0_15px_40px_rgba(168,216,185,0.3)]">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-white">我</span>
                    <p className="text-[10px] text-white/80">中心</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div
              data-testid="relation-graph-node-layer"
              className="absolute top-1/2 left-1/2 z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2"
            >
              {visibleNodes.map((node, index) => {
                const pos = getNodePosition(node.position);
                return (
                  <div
                    key={node.id}
                    data-testid={`relation-graph-node-${node.id}`}
                    className="absolute"
                    style={{ left: pos.x - 40, top: pos.y - 40 }}
                  >
                    <RelationNodeCard
                      node={node}
                      index={index}
                      onClick={() => handleNodeClick(node)}
                      isSelected={selectedNodeId === node.id}
                    />
                  </div>
                );
              })}
            </div>

            {nodes.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[120px] text-center"
              >
                <div className="inline-block rounded-[2rem_3rem_2.5rem_4rem] pebble-glass px-8 py-6">
                  <p className="mb-2 text-[#7D8C9F]">还没有添加任何关系</p>
                  <p className="text-sm text-[#7D8C9F]/60">点击右下角 + 添加第一个关系</p>
                </div>
              </motion.div>
            )}

            {nodes.length < MAX_NODES && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                onClick={() => router.push('/me/relations/new')}
                aria-label="添加关系"
                className="fixed right-8 bottom-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#A8D8B9] to-[#7D8C9F] text-white shadow-[0_8px_25px_rgba(168,216,185,0.4)] transition-all duration-200 hover:scale-110 hover:shadow-[0_12px_35px_rgba(168,216,185,0.5)] active:scale-95"
              >
                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
            )}
          </>
        )}
      </main>

      <RelationDetail
        node={selectedNode}
        onStartChat={handleStartChat}
        onClose={handleCloseDetail}
        onSetAsCurrent={handleSetAsCurrent}
        isCurrent={selectedNode?.id === selectedRelationId}
      />

      <div className="h-32" />
    </div>
  );
}

export default function MeRelationsPage() {
  return (
    <Suspense fallback={null}>
      <MeRelationsContent />
    </Suspense>
  );
}
