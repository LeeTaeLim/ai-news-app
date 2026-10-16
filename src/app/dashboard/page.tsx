import { Suspense } from "react";
import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";
import { requireUserId } from "@/lib/auth";
import { countArticles, getArticleCards } from "@/lib/articles";
import { getCategoryTabs } from "@/lib/categories";
import { NewsShell } from "../news-layout";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "대시보드 | AI 뉴스 수집기",
};

export default function DashboardPage() {
  return (
    <NewsShell userMenu={<UserButton />}>
      <Suspense
        fallback={
          <p className="text-slate-500 dark:text-slate-400">
            뉴스를 불러오는 중…
          </p>
        }
      >
        <DashboardContent />
      </Suspense>
    </NewsShell>
  );
}

// Reads the session, so it must stay behind the Suspense boundary (cacheComponents).
async function DashboardContent() {
  const userId = await requireUserId();
  const [articles, categories, totalCount] = await Promise.all([
    getArticleCards(userId),
    getCategoryTabs(userId),
    countArticles(userId),
  ]);
  return (
    <DashboardView
      articles={articles}
      categories={categories}
      totalCount={totalCount}
    />
  );
}
