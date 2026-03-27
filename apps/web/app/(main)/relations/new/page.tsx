'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRelationStore } from '@/store/relation-store';

const RELATIONSHIP_TYPES = [
  '老板', '上司', '同事', '下属', '客户',
  '父母', '配偶', '伴侣', '子女', '兄弟姐妹',
  '朋友', '密友', '普通朋友', '同学', '老师', '其他'
];

const PRESET_TAGS = ['职场', '家庭', '亲密关系', '朋友', 'NPD', 'BPD', '控制型', '情感操纵'];

export default function NewRelationPage() {
  const router = useRouter();
  const { addNode, isLoading, error } = useRelationStore();

  const [formData, setFormData] = useState({
    name: '',
    relationshipType: '',
    对方特点: '',
    期望结果: '',
    情境补充: '',
    tags: [] as string[],
  });

  const [customTag, setCustomTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      await addNode(formData);
      router.push('/relations');
    } catch {
      // Error is handled by the store
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setCustomTag('');
    }
  };

  return (
    <div className="min-h-screen fluid-bg relative overflow-hidden">
      {/* 背景光晕 */}
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-accent-gold/10 rounded-full blur-[120px] animate-breathing pointer-events-none" />

      {/* 头部 */}
      <header className="relative z-10 px-8 pt-32 pb-6">
        <button
          onClick={() => router.back()}
          aria-label="返回上一页"
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h1 className="text-4xl font-bold text-white mb-2">添加人际关系</h1>
        <p className="text-white/60">填写关系信息，AI 将为你生成专属的应对策略</p>
      </header>

      {/* 表单 */}
      <main className="relative z-10 max-w-2xl mx-auto px-8 pb-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 关系名称 */}
          <div>
            <label htmlFor="relation-name" className="block text-white/80 text-sm font-medium mb-2">
              关系名称 <span className="text-red-400">*</span>
            </label>
            <input
              id="relation-name"
              name="name"
              autoComplete="organization-title"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="如：我的老板张总"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              maxLength={100}
            />
          </div>

          {/* 关系类型 */}
          <fieldset>
            <legend className="block text-white/80 text-sm font-medium mb-2">
              关系类型
            </legend>
            <div role="radiogroup" aria-label="关系类型" className="grid grid-cols-4 gap-2">
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={formData.relationshipType === type}
                  onClick={() => setFormData((prev) => ({ ...prev, relationshipType: type }))}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    formData.relationshipType === type
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 标签 */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              标签（可多选）
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.tags.includes(tag)
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                aria-label="自定义标签"
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                placeholder="添加自定义标签"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary transition-colors text-sm"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
              >
                添加
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary/30 text-primary-foreground rounded-full text-xs flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      aria-label={`移除标签 ${tag}`}
                      onClick={() => toggleTag(tag)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 对方特点 */}
          <div>
            <label htmlFor="relation-traits" className="block text-white/80 text-sm font-medium mb-2">
              对方特点
            </label>
            <textarea
              id="relation-traits"
              name="traits"
              autoComplete="off"
              value={formData.对方特点}
              onChange={(e) => setFormData((prev) => ({ ...prev, 对方特点: e.target.value }))}
              placeholder="描述对方的行为特点，如：经常否定我的工作成果，喜欢在公开场合批评我..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
          </div>

          {/* 期望结果 */}
          <div>
            <label htmlFor="relation-goal" className="block text-white/80 text-sm font-medium mb-2">
              期望结果
            </label>
            <textarea
              id="relation-goal"
              name="goal"
              autoComplete="off"
              value={formData.期望结果}
              onChange={(e) => setFormData((prev) => ({ ...prev, 期望结果: e.target.value }))}
              placeholder="你希望在这段关系中获得什么？如：减少冲突，建立平等对话..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
          </div>

          {/* 情境补充 */}
          <div>
            <label htmlFor="relation-context" className="block text-white/80 text-sm font-medium mb-2">
              情境补充（可选）
            </label>
            <textarea
              id="relation-context"
              name="context"
              autoComplete="off"
              value={formData.情境补充}
              onChange={(e) => setFormData((prev) => ({ ...prev, 情境补充: e.target.value }))}
              placeholder="补充任何你认为重要的情境信息..."
              rows={2}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <motion.button
            type="submit"
            disabled={!formData.name.trim() || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-primary hover:bg-primary/80 disabled:bg-primary/40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                创建中...
              </span>
            ) : (
              '创建关系'
            )}
          </motion.button>
        </form>
      </main>
    </div>
  );
}
