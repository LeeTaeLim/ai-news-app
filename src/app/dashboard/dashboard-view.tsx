"use client";

import { useState } from "react";
import Link from "next/link";
import type { ArticleCard } from "@/lib/articles";
import type { CategoryTab } from "@/lib/categories";
import { EmptyState, NewsCardGrid } from "../news-layout";

// Tab key: "all", "uncategorized", or "category:<name>" (names are unique per user).
type Filter = string;
const ALL = "all";
const UNCATEGORIZED = "uncategorized";
const categoryFilter = (name: string) => `category:${name}`;

const PILL =
  "inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition";
const TAB = `${PILL} border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:text-blue-300`;
const SELECTED = `${PILL} border border-blue-600 bg-blue-600 text-white`;
const ADD = `${PILL} border border-dashed border-blue-300 text-blue-700 hover:border-solid hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950`;

function matches(article: ArticleCard, filter: Filter) {
  if (filter === ALL) return true;
  if (filter === UNCATEGORIZED) return article.categoryName === null;
  return (
    article.categoryName !== null &&
    filter === categoryFilter(article.categoryName)
  );
}

export function DashboardView({
  articles,
  categories,
}: {
  articles: ArticleCard[];
  categories: CategoryTab[];
}) {
  const [filter, setFilter] = useState<Filter>(ALL);

  const tabs: { label: string; filter: Filter }[] = [
    { label: "전체", filter: ALL },
    ...categories.map((c) => ({ label: c.name, filter: categoryFilter(c.name) })),
    { label: "미분류", filter: UNCATEGORIZED },
  ];

  const visible = articles.filter((a) => matches(a, filter));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            최신 뉴스
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {visible.length}개
          </span>
        </div>
        {/* Wired up in stage 3 (RSS + Claude). */}
        <button
          type="button"
          disabled
          title="곧 사용할 수 있어요"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          뉴스 가져오기
        </button>
      </div>

      <nav
        aria-label="카테고리"
        className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {tabs.map((tab) => {
            const selected = tab.filter === filter;
            const count = articles.filter((a) => matches(a, tab.filter)).length;
            return (
              <li key={tab.filter}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(tab.filter)}
                  className={selected ? SELECTED : TAB}
                >
                  {tab.label}
                  <span className="ml-1 text-xs opacity-70">{count}</span>
                </button>
              </li>
            );
          })}
          <li>
            <Link href="/categories?new=1" className={ADD}>
              + 카테고리 추가
            </Link>
          </li>
        </ul>
      </nav>

      {articles.length === 0 ? (
        <EmptyState
          title="아직 저장된 뉴스가 없어요."
          hint="뉴스를 가져오면 여기에 카드로 표시됩니다."
        />
      ) : visible.length === 0 ? (
        <EmptyState title="이 카테고리에 해당하는 뉴스가 없어요." />
      ) : (
        <NewsCardGrid articles={visible} />
      )}
    </>
  );
}
