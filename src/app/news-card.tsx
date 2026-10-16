import type { ArticleCard } from "@/lib/articles";
import { DeleteNewsButton } from "./delete-news-button";
import { NotionSaveButton } from "./notion-save-button";

const SOURCES: Record<
  ArticleCard["source"],
  { label: string; monogram: string }
> = {
  techcrunch: { label: "TechCrunch", monogram: "TC" },
  theverge: { label: "The Verge", monogram: "V" },
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
  const source = SOURCES[article.source];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03] transition duration-200 ease-out focus-within:border-slate-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/[0.06] motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:focus-within:border-slate-700 dark:hover:border-slate-700 dark:hover:shadow-black/30">
      {/* Accent line that draws in from the left on hover or keyboard focus. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-blue-600 transition-transform duration-300 ease-out group-focus-within:scale-x-100 group-hover:scale-x-100 motion-reduce:transition-none dark:bg-blue-500"
      />

      <div className="flex items-start justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 pt-1 text-[13px] text-slate-500 dark:text-slate-400">
          <span
            aria-hidden
            className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 px-1 text-[10px] font-bold tracking-tight text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {source.monogram}
          </span>
          <span className="truncate font-semibold text-slate-700 dark:text-slate-200">
            {source.label}
          </span>
          <span aria-hidden className="text-slate-300 dark:text-slate-600">
            ·
          </span>
          <time
            dateTime={article.publishedAt.toISOString()}
            className="shrink-0 tabular-nums"
          >
            {dateFormat.format(article.publishedAt)}
          </time>
        </p>
        <DeleteNewsButton articleId={article.id} title={article.titleKo} />
      </div>

      <h2 className="mt-3 text-lg leading-snug font-semibold tracking-tight text-pretty break-keep text-slate-900 dark:text-slate-50">
        {article.titleKo}
      </h2>
      <p className="mt-3 text-[15px] leading-7 break-keep text-slate-600 dark:text-slate-300">
        {article.summaryKo}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <span
          title={article.categoryName ?? "미분류"}
          className={`min-w-0 truncate rounded-full px-2.5 py-0.5 text-xs font-medium ${
            uncategorized
              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              : "bg-blue-50 text-blue-700 ring-1 ring-blue-100 ring-inset dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-900"
          }`}
        >
          {article.categoryName ?? "미분류"}
        </span>
        <div className="flex shrink-0 items-start gap-3">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex items-center gap-0.5 py-1.5 text-sm font-medium whitespace-nowrap text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            원문 보기
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none"
            >
              ↗
            </span>
          </a>
          <NotionSaveButton
            articleId={article.id}
            notionPageUrl={article.notionPageUrl}
          />
        </div>
      </div>
    </article>
  );
}
