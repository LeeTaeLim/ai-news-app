"use client";

import { useState, useTransition } from "react";
import { deleteNews } from "./dashboard/actions";

// The card's top-right X. The action refreshes the page data, so the card
// disappears from the list as soon as the delete succeeds.
export function DeleteNewsButton({
  articleId,
  title,
}: {
  articleId: string;
  title: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDeleting] = useTransition();

  function handleDelete() {
    setError(null);
    startDeleting(async () => {
      try {
        const result = await deleteNews(articleId);
        if (!result.ok) setError(result.error);
      } catch {
        setError("서버에 연결하지 못했어요. 다시 시도해 주세요.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`‘${title}’ 뉴스 삭제`}
        title="뉴스 삭제"
        className="-mt-1 -mr-1 flex size-8 items-center justify-center rounded-lg text-slate-300 transition group-focus-within:text-slate-400 group-hover:text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-600 dark:group-focus-within:text-slate-500 dark:group-hover:text-slate-500 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          className="size-4"
        >
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>
      {error && (
        <p
          role="alert"
          className="max-w-48 text-right text-xs break-keep text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
