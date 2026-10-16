"use client";

import { useState, useTransition } from "react";
import { saveToNotion } from "./dashboard/actions";

const BUTTON =
  "rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";

// "뉴스 저장" → "✓ 저장됨" (a link to the Notion page) once the save succeeds.
export function NotionSaveButton({
  articleId,
  notionPageUrl,
}: {
  articleId: string;
  notionPageUrl: string | null;
}) {
  // Set right after saving so the card flips before the page data refreshes.
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const url = savedUrl ?? notionPageUrl;

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BUTTON} inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900`}
      >
        ✓ 저장됨
      </a>
    );
  }

  function handleSave() {
    setError(null);
    startSaving(async () => {
      try {
        const result = await saveToNotion(articleId);
        if (result.ok) setSavedUrl(result.notionPageUrl);
        else setError(result.error);
      } catch {
        setError("서버에 연결하지 못했어요. 다시 시도해 주세요.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={`${BUTTON} bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {saving ? "저장 중…" : "뉴스 저장"}
      </button>
      {error && (
        <p
          role="alert"
          className="text-right text-xs break-keep text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
