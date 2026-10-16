"use server";

import { refresh } from "next/cache";
import { requireUserId } from "@/lib/auth";
import {
  deleteArticle,
  filterNewItems,
  getArticleCard,
  insertNewArticles,
  setNotionPageUrl,
} from "@/lib/articles";
import { getCategoryOptions } from "@/lib/categories";
import { createNotionPage } from "@/lib/notion";
import { fetchRecentItems } from "@/lib/rss";
import { processArticles } from "@/lib/translate";

const DAY_MS = 24 * 60 * 60 * 1000;

export type FetchNewsResult =
  | {
      ok: true;
      added: number;
      // Stored with the original English text because Claude failed.
      untranslated: number;
      failedSources: string[];
    }
  | { ok: false; error: string };

// "뉴스 가져오기": translates, summarizes and categorizes articles published in
// the last 24 hours that this user hasn't stored yet, then stores them.
export async function fetchNews(): Promise<FetchNewsResult> {
  // Outside the try: a signed-out user's redirect must not be caught.
  const userId = await requireUserId();

  try {
    const since = new Date(Date.now() - DAY_MS);
    const { items, failedSources } = await fetchRecentItems(since);
    const [newItems, categories] = await Promise.all([
      filterNewItems(userId, items),
      getCategoryOptions(userId),
    ]);
    const processed = await processArticles(newItems, categories);
    const added = await insertNewArticles(userId, processed);
    const untranslated = processed.filter((p) => !p.translated).length;
    refresh();
    return { ok: true, added, untranslated, failedSources };
  } catch (error) {
    console.error("fetchNews failed", error);
    return {
      ok: false,
      error: "뉴스를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export type SaveToNotionResult =
  | { ok: true; notionPageUrl: string }
  | { ok: false; error: string };

// "뉴스 저장": adds the article to the Notion database and records the page URL.
export async function saveToNotion(
  articleId: string,
): Promise<SaveToNotionResult> {
  const userId = await requireUserId();

  try {
    const article = await getArticleCard(userId, articleId);
    if (!article) return { ok: false, error: "뉴스를 찾을 수 없어요." };
    // Already saved: never create a second page.
    if (article.notionPageUrl) {
      return { ok: true, notionPageUrl: article.notionPageUrl };
    }
    const notionPageUrl = await createNotionPage(article);
    await setNotionPageUrl(userId, articleId, notionPageUrl);
    refresh();
    return { ok: true, notionPageUrl };
  } catch (error) {
    console.error(`saveToNotion failed: ${articleId}`, error);
    return { ok: false, error: "Notion에 저장하지 못했어요. 다시 시도해 주세요." };
  }
}

export type DeleteNewsResult = { ok: true } | { ok: false; error: string };

// X button on a card: removes the article from the DB and the list.
export async function deleteNews(articleId: string): Promise<DeleteNewsResult> {
  const userId = await requireUserId();

  try {
    await deleteArticle(userId, articleId);
    // Already gone (e.g. deleted in another tab) still counts as deleted.
    refresh();
    return { ok: true };
  } catch (error) {
    console.error(`deleteNews failed: ${articleId}`, error);
    return { ok: false, error: "뉴스를 삭제하지 못했어요. 다시 시도해 주세요." };
  }
}
