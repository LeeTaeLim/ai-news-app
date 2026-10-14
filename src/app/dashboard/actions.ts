"use server";

import { refresh } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { insertNewArticles } from "@/lib/articles";
import { fetchRecentItems } from "@/lib/rss";

const DAY_MS = 24 * 60 * 60 * 1000;

export type FetchNewsResult =
  | { ok: true; added: number; failedSources: string[] }
  | { ok: false; error: string };

// "뉴스 가져오기": stores articles published in the last 24 hours.
export async function fetchNews(): Promise<FetchNewsResult> {
  // Outside the try: a signed-out user's redirect must not be caught.
  const userId = await requireUserId();

  try {
    const since = new Date(Date.now() - DAY_MS);
    const { items, failedSources } = await fetchRecentItems(since);
    const added = await insertNewArticles(userId, items);
    refresh();
    return { ok: true, added, failedSources };
  } catch (error) {
    console.error("fetchNews failed", error);
    return {
      ok: false,
      error: "뉴스를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}
