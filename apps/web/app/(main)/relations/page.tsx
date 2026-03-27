'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRelationStore } from '@/store/relation-store';
import { RelationNodeCard, RelationNodeCardSkeleton } from '@/components/relations/RelationNode';
import { RelationDetail } from '@/components/relations/RelationDetail';
import type { RelationNode } from '@pebble/types';

// 圆形布局参数
const CENTER_X = 400;
const CENTER_Y = 300;
const ORBIT_RADIUS = 220;
const MAX_NODES = 10;

function getNodePosition(index: number, total: number) {
  if (total === 0) return { x: CENTER_X, y: CENTER_Y };
  const angle = (index / Math.min(total, MAX_NODES)) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER_X + ORBIT_RADIUS * Math.cos(angle),
    y: CENTER_Y + ORBIT_RADIUS * Math.sin(angle),
  };
}

export default function RelationsPage() {
  const router = useRouter();
  const { nodes, isLoading, error, loadNodes, selectNode, selectedNodeId } = useRelationStore();
  const [selectedNode, setSelectedNode] = useState<RelationNode | null>(null);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  const handleNodeClick = useCallback((node: RelationNode) => {
    setSelectedNode(node);
    selectNode(node.id);
  }, [selectNode]);

  const handleStartChat = useCallback(() => {
    if (selectedNode) {
      router.push(`/relations/${selectedNode.id}/chat`);
    }
  }, [selectedNode, router]);

  const handleCloseDetail = useCallback(() => {
    setSelectedNode(null);
    selectNode(null);
  }, [selectNode]);

  const visibleNodes = nodes.slice(0, MAX_NODES);

  return (
    <div className="min-h-screen fluid-bg relative overflow-hidden">
      {/* 背景装饰 - 有机光晕 */}
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-[#A8D8B9]/20 rounded-full blur-[120px] animate-orb-float pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-[#BCA564]/15 rounded-full blur-[100px] animate-orb-float pointer-events-none" style={{ animationDelay: '-5s' }} />
      <div className="absolute top-[60%] left-[50%] w-[250px] h-[250px] bg-[#7D8C9F]/10 rounded-full blur-[80px] animate-orb-float pointer-events-none" style={{ animationDelay: '-10s' }} />

      {/* 头部 */}
      <header className="relative z-10 px-8 pt-32 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            aria-label="返回上一页"
            className="w-10 h-10 rounded-full pebble-glass flex items-center justify-center hover:bg-white/50 transition-colors"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-[#7D8C9F]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-[#2C3E50]">人际关系图谱</h1>
        </div>
        <p className="text-[#7D8C9F] ml-[52px]">点击节点进入与特定关系的对话</p>
      </header>

      {/* 主内容 */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-280px)]">
        {isLoading && nodes.length === 0 ? (
          <div className="flex flex-col items-center gap-8">
            {/* 加载状态 */}
            <div className="relative w-[500px] h-[400px]">
              {/* 中心骨架 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-24 rounded-full pebble-glass animate-pulse" />
              </div>
              {/* 节点骨架 */}
              {[0, 1, 2, 3].map((i) => {
                const pos = getNodePosition(i, 4);
                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: pos.x - 40,
                      top: pos.y - 40,
                    }}
                  >
                    <RelationNodeCardSkeleton index={i} />
                  </div>
                );
              })}
            </div>
            <p className="text-[#7D8C9F] animate-pulse">正在加载关系图谱...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => loadNodes()}
              className="px-4 py-2 bg-[#A8D8B9] hover:bg-[#8BC4A0] text-white rounded-full transition-colors"
            >
              重试
            </button>
          </div>
        ) : (
          <>
            {/* SVG 连接线和装饰 */}
            <svg
              width="800"
              height="600"
              viewBox="0 0 800 600"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              {/* 轨道圆环 */}
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

              {/* 连接线 */}
              {visibleNodes.map((node, index) => {
                const pos = getNodePosition(index, visibleNodes.length);
                return (
                  <motion.line
                    key={`line-${node.id}`}
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

              {/* 外层光晕环 */}
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

            {/* 中心用户节点 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative"
              >
                {/* 外层呼吸光环 */}
                <div className="absolute inset-0 rounded-full bg-[#A8D8B9]/20 animate-pebble-breathe" />

                {/* 主节点 */}
                <div className="relative w-24 h-24 rounded-full pebble-glass bg-gradient-to-br from-[#A8D8B9] to-[#7D8C9F] shadow-[0_15px_40px_rgba(168,216,185,0.3)] flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-white">我</span>
                    <p className="text-[10px] text-white/80">中心</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 关系节点 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              {visibleNodes.map((node, index) => {
                const pos = getNodePosition(index, visibleNodes.length);
                return (
                  <div
                    key={node.id}
                    className="absolute"
                    style={{
                      left: pos.x - 40,
                      top: pos.y - 40,
                    }}
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

            {/* 空状态提示 */}
            {nodes.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[120px] text-center"
              >
                <div className="pebble-glass rounded-[2rem_3rem_2.5rem_4rem] px-8 py-6 inline-block">
                  <p className="text-[#7D8C9F] mb-2">还没有添加任何关系</p>
                  <p className="text-sm text-[#7D8C9F]/60">点击右下角 + 添加第一个关系</p>
                </div>
              </motion.div>
            )}

            {/* 添加按钮 */}
            {nodes.length < MAX_NODES && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                onClick={() => router.push('/relations/new')}
                aria-label="添加关系"
                className="fixed bottom-8 right-8 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-[#A8D8B9] to-[#7D8C9F] text-white shadow-[0_8px_25px_rgba(168,216,185,0.4)] hover:shadow-[0_12px_35px_rgba(168,216,185,0.5)] hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
              >
                <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
            )}
          </>
        )}
      </main>

      {/* 详情卡片 */}
      <RelationDetail
        node={selectedNode}
        onStartChat={handleStartChat}
        onClose={handleCloseDetail}
      />

      {/* 底部留白 */}
      <div className="h-32" />
    </div>
  );
}
