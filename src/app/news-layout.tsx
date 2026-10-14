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

export function NewsCardGrid({ articles }: { articles: ArticleCard[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
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
      <div className="mb-6 flex items-baseline gap-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          최신 뉴스
        </h2>
        <span className="text-sm text-slate-500">{articles.length}개</span>
      </div>
      <NewsCardGrid articles={articles} />
    </>
  );
}
