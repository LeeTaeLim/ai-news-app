import type { ArticleCard } from "@/lib/articles";
import { DeleteNewsButton } from "./delete-news-button";
import { NotionSaveButton } from "./notion-save-button";

const SOURCE_LABELS: Record<ArticleCard["source"], string> = {
  techcrunch: "TechCrunch",
  theverge: "The Verge",
};

// Dates are shown in Korean time regardless of where the server runs.
const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export function NewsCard({ article }: { article: ArticleCard }) {
  const uncategorized = article.categoryName === null;

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900">
      <div className="flex items-start justify-between gap-3">
        <span
          className={
            uncategorized
              ? "rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              : "rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-700 ring-1 ring-blue-100 ring-inset dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-900"
          }
        >
          {article.categoryName ?? "미분류"}
        </span>
        <DeleteNewsButton articleId={article.id} title={article.titleKo} />
      </div>

      <h2 className="mt-4 text-lg leading-snug font-semibold break-keep text-slate-900 dark:text-slate-50">
        {article.titleKo}
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {SOURCE_LABELS[article.source]}
        <span aria-hidden className="mx-1.5">
          ·
        </span>
        <time dateTime={article.publishedAt.toISOString()}>
          {dateFormat.format(article.publishedAt)}
        </time>
      </p>
      <p className="mt-4 text-[15px] leading-7 break-keep text-slate-600 dark:text-slate-300">
        {article.summaryKo}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          원문 보기 ↗
        </a>
        <NotionSaveButton
          articleId={article.id}
          notionPageUrl={article.notionPageUrl}
        />
      </div>
    </article>
  );
}
