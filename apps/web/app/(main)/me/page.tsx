"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUserCenterStore } from "@/store/user-center-store";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import { AppHeader } from "@/components/layout/AppHeader";
import { signOutAction } from "@/app/(main)/login/actions";
import type { RelationNode } from "@pebble/types";

const FEATURES = [
  {
    key: "decoder",
    label: "读心翻译",
    description: "分析对话潜台词，生成回复建议",
    href: "/translator",
    icon: "psychology",
    color: "from-[#A8D8B9] to-[#7D8C9F]",
  },
  {
    key: "simulator",
    label: "模拟陪练",
    description: "与 AI 模拟对话，练习边界设定",
    href: "/dojo",
    icon: "sports_martial_arts",
    color: "from-[#BCA564] to-[#9A8544]",
  },
  {
    key: "practice",
    label: "练习本",
    description: "记录练习进度，巩固关系技能",
    href: "/me/practice",
    icon: "edit_note",
    color: "from-[#B8C9D9] to-[#98A8B8]",
  },
  {
    key: "breathing",
    label: "急救呼吸",
    description: "情绪急救，快速恢复平静",
    href: "/breathing",
    icon: "air",
    color: "from-[#7D8C9F] to-[#5A6A7A]",
  },
];

interface RelationStats {
  count: number;
}

export default function MePage() {
  const { selectedRelation, loadSelectedRelation, clearSelectedRelation } =
    useUserCenterStore();
  const currentRelation = isRenderableRelation(selectedRelation) ? selectedRelation : null;
  const [relationStats, setRelationStats] = useState<RelationStats | null>(
    null,
  );
  const totalAnalyses = 12; // TODO: 从实际数据获取

  useEffect(() => {
    loadSelectedRelation();

    // TODO: 加载关系统计
    setRelationStats({ count: 0 });
  }, [loadSelectedRelation]);

  return (
    <>
      <AppHeader activeHref="/me" />
      <main className="container mx-auto px-6 py-8 max-w-5xl pt-24">
        {/* 欢迎区 */}
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">欢迎回来</h1>
          <p className="text-[#7D8C9F]">管理你的关系档案，让 AI 更懂你</p>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* 当前关系卡片 */}
          <section className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/60">
            <div className="flex items-center gap-2 mb-4">
              <MaterialSymbol icon="hub" className="text-[#A8D8B9]" />
              <h2 className="text-lg font-semibold text-[#2C3E50]">当前关系</h2>
            </div>

            {currentRelation ? (
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8D8B9] to-[#7D8C9F] flex items-center justify-center text-white text-2xl font-bold">
                  {currentRelation.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#2C3E50]">
                    {currentRelation.name}
                  </h3>
                  <p className="text-sm text-[#7D8C9F] mt-1">
                    {currentRelation.relationshipType || "未指定关系类型"}
                  </p>
                  {currentRelation.对方特点 && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {currentRelation.对方特点}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                    <Link
                      href="/me/relations"
                      className="inline-flex items-center gap-1 text-[#A8D8B9] transition-colors hover:text-[#8BC4A0]"
                    >
                      管理关系
                      <MaterialSymbol icon="arrow_forward" className="text-sm" />
                    </Link>
                    <span className="text-[#7D8C9F]/30" aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={clearSelectedRelation}
                      className="inline-flex items-center gap-1 text-[#7D8C9F] transition-colors hover:text-[#5D6D7E]"
                      aria-label="取消使用当前关系"
                    >
                      取消使用
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <MaterialSymbol
                    icon="person_add"
                    className="text-2xl text-slate-400"
                  />
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
                <div className="text-3xl font-bold text-[#A8D8B9]">
                  {relationStats?.count ?? 0}
                </div>
                <div className="text-sm text-[#7D8C9F]" title="当前为占位统计，后续会接入真实关系档案数量">关系档案</div>
              </div>
              <div className="text-center p-4 bg-[#BCA564]/10 rounded-2xl">
                <div className="text-3xl font-bold text-[#BCA564]">
                  {totalAnalyses}
                </div>
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
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                >
                  <MaterialSymbol icon={feature.icon} />
                </div>
                <h3 className="font-semibold text-[#2C3E50] mb-1">
                  {feature.label}
                </h3>
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

        {/* 账户安全 */}
        <section className="mt-6 bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/60">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E07A5F]/10 flex items-center justify-center shrink-0">
                <MaterialSymbol icon="shield_lock" className="text-[#B95C46]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#2C3E50] mb-1">
                  账户安全
                </h2>
                <p className="text-sm text-[#7D8C9F] leading-relaxed">
                  退出后，你需要重新登录才能访问个人中心和关系档案。
                </p>
              </div>
            </div>

            <form
              action={signOutAction}
              onSubmit={() => {
                clearSelectedRelation();
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#E07A5F]/10 text-[#B95C46] hover:bg-[#E07A5F]/15 hover:text-[#9F4F3D] transition-colors text-sm font-medium whitespace-nowrap"
              >
                <MaterialSymbol icon="logout" className="text-sm" />
                退出当前账户
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

function isRenderableRelation(relation: RelationNode | null): relation is RelationNode {
  return typeof relation?.name === 'string' && relation.name.length > 0;
}
