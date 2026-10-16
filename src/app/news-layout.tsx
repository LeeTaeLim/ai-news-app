import type { ReactNode } from "react";
import type { ArticleCard } from "@/lib/articles";
import { NewsCard } from "./news-card";

// Shared by the real main page and the dev-only /preview page.
export function NewsShell({
  userMenu,
  children,
}: {
  userMenu: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              AI
            </span>
            AI 뉴스 수집기
          </h1>
          {userMenu}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-sm break-keep text-slate-500 sm:px-6 dark:text-slate-400">
          Copyright 2026 AI 뉴스 수집기. Powered by{" "}
          <span className="font-medium text-slate-700 dark:text-slate-200">
            Claude
          </span>
          .
        </p>
      </footer>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="font-medium break-keep text-slate-700 dark:text-slate-200">
        {title}
      </p>
      {hint && (
        <p className="mt-1 text-sm break-keep text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}

// Total stored articles, regardless of the selected tab or search.
export function NewsCountBadge({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-medium whitespace-nowrap text-blue-700 dark:bg-blue-950 dark:text-blue-300">
      총 {count}개의 뉴스
    </span>
  );
}

export function NewsCardGrid({ articles }: { articles: ArticleCard[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}

const SKELETON_BAR = "rounded bg-slate-200 dark:bg-slate-800";

// Placeholder with the same box and spacing as NewsCard, so nothing jumps on load.
function NewsCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex animate-pulse flex-col motion-reduce:animate-none rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-2 pt-1">
        <div className="size-5 rounded-md bg-slate-100 dark:bg-slate-800" />
        <div className={`h-3.5 w-40 ${SKELETON_BAR}`} />
      </div>
      <div className={`mt-4 h-5 w-11/12 ${SKELETON_BAR}`} />
      <div className={`mt-2 h-5 w-2/3 ${SKELETON_BAR}`} />
      <div className="mt-5 space-y-3">
        <div className={`h-3.5 ${SKELETON_BAR}`} />
        <div className={`h-3.5 ${SKELETON_BAR}`} />
        <div className={`h-3.5 ${SKELETON_BAR}`} />
        <div className={`h-3.5 w-3/5 ${SKELETON_BAR}`} />
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="h-5 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
        <div className="flex items-center gap-3">
          <div className={`h-4 w-16 ${SKELETON_BAR}`} />
          <div className="h-8 w-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

// Two rows of the 3-column grid.
const DEFAULT_SKELETON_COUNT = 6;

export function NewsCardGridSkeleton({
  count = DEFAULT_SKELETON_COUNT,
}: {
  count?: number;
}) {
  return (
    <div role="status">
      <p className="mb-6 text-slate-500 dark:text-slate-400">
        뉴스를 불러오는 중…
      </p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function NewsGrid({ articles }: { articles: ArticleCard[] }) {
  if (articles.length === 0) {
    return (
      <EmptyState
        title="아직 저장된 뉴스가 없어요."
        hint="뉴스를 가져오면 여기에 카드로 표시됩니다."
      />
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          최신 뉴스
        </h2>
        <NewsCountBadge count={articles.length} />
      </div>
      <NewsCardGrid articles={articles} />
    </>
  );
}
