'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRelationStore } from '@/store/relation-store';

const RELATIONSHIP_TYPES = [
  '老板', '上司', '同事', '下属', '客户',
  '父母', '配偶', '伴侣', '子女', '兄弟姐妹',
  '朋友', '密友', '普通朋友', '同学', '老师', '其他',
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) return;

    try {
      await addNode(formData);
      router.push('/me/relations');
    } catch {
      // Store handles the error state.
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((item) => item !== tag)
        : [...prev.tags, tag],
    }));
  };

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (!tag || formData.tags.includes(tag)) return;

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
    setCustomTag('');
  };

  return (
    <div className="min-h-screen fluid-bg relative overflow-hidden">
      <div className="absolute top-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-accent-gold/10 blur-[120px] animate-breathing pointer-events-none" />

      <header className="relative z-10 px-8 pt-8 pb-6">
        <button
          type="button"
          onClick={() => router.push('/me/relations')}
          aria-label="返回上一页"
          className="mb-4 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h1 className="mb-2 text-4xl font-bold text-white">添加人际关系</h1>
        <p className="text-white/60">填写关系信息，AI 将为你生成专属的应对策略</p>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-8 pb-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="relation-name" className="mb-2 block text-sm font-medium text-white/80">
              关系名称 <span className="text-red-400">*</span>
            </label>
            <input
              id="relation-name"
              name="name"
              autoComplete="organization-title"
              type="text"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="如：我的老板张总"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              maxLength={100}
            />
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-white/80">关系类型</legend>
            <div role="radiogroup" aria-label="关系类型" className="grid grid-cols-4 gap-2">
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={formData.relationshipType === type}
                  onClick={() => setFormData((prev) => ({ ...prev, relationshipType: type }))}
                  className={`rounded-lg px-3 py-2 text-sm transition-all ${
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

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">标签（可多选）</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-all ${
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
                onChange={(event) => setCustomTag(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addCustomTag();
                  }
                }}
                placeholder="添加自定义标签"
                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/40 transition-colors focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
              >
                添加
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-primary/30 px-2 py-1 text-xs text-primary-foreground"
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

          <div>
            <label htmlFor="relation-traits" className="mb-2 block text-sm font-medium text-white/80">
              对方特点
            </label>
            <textarea
              id="relation-traits"
              name="traits"
              autoComplete="off"
              value={formData.对方特点}
              onChange={(event) => setFormData((prev) => ({ ...prev, 对方特点: event.target.value }))}
              placeholder="描述对方的行为特点，如：经常否定我的工作成果，喜欢在公开场合批评我..."
              rows={3}
              className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="relation-goal" className="mb-2 block text-sm font-medium text-white/80">
              期望结果
            </label>
            <textarea
              id="relation-goal"
              name="goal"
              autoComplete="off"
              value={formData.期望结果}
              onChange={(event) => setFormData((prev) => ({ ...prev, 期望结果: event.target.value }))}
              placeholder="你希望在这段关系中获得什么？如：减少冲突，建立平等对话..."
              rows={3}
              className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="relation-context" className="mb-2 block text-sm font-medium text-white/80">
              情境补充（可选）
            </label>
            <textarea
              id="relation-context"
              name="context"
              autoComplete="off"
              value={formData.情境补充}
              onChange={(event) => setFormData((prev) => ({ ...prev, 情境补充: event.target.value }))}
              placeholder="补充任何你认为重要的情境信息..."
              rows={2}
              className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/20 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={!formData.name.trim() || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-primary py-4 font-semibold text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:bg-primary/40"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
