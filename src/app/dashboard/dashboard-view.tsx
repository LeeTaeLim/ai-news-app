"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ArticleCard } from "@/lib/articles";
import type { CategoryTab } from "@/lib/categories";
import { EmptyState, NewsCardGrid } from "../news-layout";
import { fetchNews, type FetchNewsResult } from "./actions";

// Tab key: "all", "uncategorized", or "category:<name>" (names are unique per user).
type Filter = string;
const ALL = "all";
const UNCATEGORIZED = "uncategorized";
const categoryFilter = (name: string) => `category:${name}`;

const PAGE_SIZE = 9;

const PILL =
  "inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition";
const TAB = `${PILL} border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:text-blue-300`;
const SELECTED = `${PILL} border border-blue-600 bg-blue-600 text-white`;
const ADD = `${PILL} border border-dashed border-blue-300 text-blue-700 hover:border-solid hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950`;

type Notice = { tone: "info" | "error"; text: string };

const NOTICE_STYLES: Record<Notice["tone"], string> = {
  info: "rounded-xl bg-blue-50 px-4 py-3 text-sm break-keep text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  error:
    "rounded-xl bg-red-50 px-4 py-3 text-sm break-keep text-red-700 dark:bg-red-950 dark:text-red-300",
};

function toNotices(result: FetchNewsResult): Notice[] {
  if (!result.ok) return [{ tone: "error", text: result.error }];
  const notices: Notice[] = [];
  if (result.failedSources.length > 0) {
    notices.push({
      tone: "error",
      text: `${result.failedSources.join(", ")} 뉴스를 가져오지 못했어요.`,
    });
  }
  // Skip the count when every feed failed; the error above says it all.
  if (result.failedSources.length < 2) {
    notices.push({
      tone: "info",
      text:
        result.added > 0
          ? `새 뉴스 ${result.added}개를 가져왔어요.`
          : "지난 24시간 동안 새로 올라온 뉴스가 없어요.",
    });
  }
  if (result.untranslated > 0) {
    notices.push({
      tone: "error",
      text: `${result.untranslated}개는 번역하지 못해 원문 그대로 미분류로 저장했어요.`,
    });
  }
  return notices;
}

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
  const [page, setPage] = useState(1);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [fetching, startFetching] = useTransition();

  function handleFetch() {
    setNotices([]);
    startFetching(async () => {
      try {
        const result = await fetchNews();
        setNotices(toNotices(result));
        // New articles are the newest, so show them on page 1.
        if (result.ok && result.added > 0) setPage(1);
      } catch {
        setNotices([
          {
            tone: "error",
            text: "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.",
          },
        ]);
      }
    });
  }

  const tabs: { label: string; filter: Filter }[] = [
    { label: "전체", filter: ALL },
    ...categories.map((c) => ({ label: c.name, filter: categoryFilter(c.name) })),
    { label: "미분류", filter: UNCATEGORIZED },
  ];

  const visible = articles.filter((a) => matches(a, filter));
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  // Clamped so a shrinking list never leaves the user on an empty page.
  const currentPage = Math.min(page, pageCount);

  function goToPage(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
        <button
          type="button"
          onClick={handleFetch}
          disabled={fetching}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {fetching ? "가져와서 번역하는 중…" : "뉴스 가져오기"}
        </button>
      </div>

      {notices.length > 0 && (
        <div role="status" className="mb-4 space-y-2">
          {notices.map((notice) => (
            <p key={notice.text} className={NOTICE_STYLES[notice.tone]}>
              {notice.text}
            </p>
          ))}
        </div>
      )}

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
                  onClick={() => {
                    setFilter(tab.filter);
                    setPage(1);
                  }}
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
        <>
          <NewsCardGrid
            articles={visible.slice(
              (currentPage - 1) * PAGE_SIZE,
              currentPage * PAGE_SIZE,
            )}
          />
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onChange={goToPage}
          />
        </>
      )}
    </>
  );
}

// How many pages to show on each side of the current page.
const PAGE_SIBLINGS = 2;

const PAGE_BUTTON =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition sm:h-9 sm:min-w-9";
const PAGE_IDLE = `${PAGE_BUTTON} border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:text-blue-300`;
const PAGE_CURRENT = `${PAGE_BUTTON} bg-blue-600 text-white`;

// Page 50 of 100 → 1 … 48 49 50 51 52 … 100. A "…" appears only where the
// numbers skip; next to page 1 or the last page they simply join up.
function pageNumbers(
  page: number,
  pageCount: number,
): (number | "gap")[] {
  const start = Math.max(2, page - PAGE_SIBLINGS);
  const end = Math.min(pageCount - 1, page + PAGE_SIBLINGS);
  const result: (number | "gap")[] = [1];
  if (start > 2) result.push("gap");
  for (let p = start; p <= end; p++) result.push(p);
  if (end < pageCount - 1) result.push("gap");
  if (pageCount > 1) result.push(pageCount);
  return result;
}

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const isFirst = page === 1;
  const isLast = page === pageCount;
  const jump = (label: string, target: number, disabled: boolean) => (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(target)}
        className={PAGE_IDLE}
      >
        {label}
      </button>
    </li>
  );

  // Mobile: numbers on the first row, 처음/이전/다음/끝 below. sm+: one row.
  return (
    <nav aria-label="페이지" className="mt-8">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        {jump("처음", 1, isFirst)}
        {jump("이전", page - 1, isFirst)}
        <li className="order-first flex w-full justify-center sm:order-none sm:w-auto">
          <ul className="flex items-center gap-1">
            {pageNumbers(page, pageCount).map((p, i) =>
              p === "gap" ? (
                <li
                  key={`gap-${i}`}
                  aria-hidden
                  className="inline-flex h-8 min-w-6 items-center justify-center text-sm text-slate-400 sm:h-9 dark:text-slate-500"
                >
                  …
                </li>
              ) : (
                <li key={p}>
                  <button
                    type="button"
                    aria-label={`${p}페이지`}
                    aria-current={p === page ? "page" : undefined}
                    onClick={() => onChange(p)}
                    className={p === page ? PAGE_CURRENT : PAGE_IDLE}
                  >
                    {p}
                  </button>
                </li>
              ),
            )}
          </ul>
        </li>
        {jump("다음", page + 1, isLast)}
        {jump("끝", pageCount, isLast)}
      </ul>
    </nav>
  );
}
