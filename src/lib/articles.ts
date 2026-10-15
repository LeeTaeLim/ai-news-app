import "server-only";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import type { FeedItem } from "@/lib/rss";
import type { ProcessedArticle } from "@/lib/translate";

export type ArticleCard = {
  id: string;
  source: "techcrunch" | "theverge";
  titleKo: string;
  summaryKo: string;
  link: string;
  publishedAt: Date;
  // null = 미분류
  categoryName: string | null;
  notionPageUrl: string | null;
};

const cardColumns = {
  id: articles.id,
  source: articles.source,
  titleKo: articles.titleKo,
  summaryKo: articles.summaryKo,
  link: articles.link,
  publishedAt: articles.publishedAt,
  categoryName: categories.name,
  notionPageUrl: articles.notionPageUrl,
};

// Newest first. Scoped to the user; never call without a verified userId.
export async function getArticleCards(userId: string): Promise<ArticleCard[]> {
  return db
    .select(cardColumns)
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.userId, userId))
    .orderBy(desc(articles.publishedAt));
}

// One of the user's articles, or undefined if it doesn't exist or isn't theirs.
export async function getArticleCard(
  userId: string,
  articleId: string,
): Promise<ArticleCard | undefined> {
  const [row] = await db
    .select(cardColumns)
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(eq(articles.userId, userId), eq(articles.id, articleId)));
  return row;
}

// Marks the article as saved. Only fills an empty URL, so a concurrent second
// save can't overwrite the first page's URL.
export async function setNotionPageUrl(
  userId: string,
  articleId: string,
  notionPageUrl: string,
): Promise<void> {
  await db
    .update(articles)
    .set({ notionPageUrl })
    .where(
      and(
        eq(articles.userId, userId),
        eq(articles.id, articleId),
        isNull(articles.notionPageUrl),
      ),
    );
}

// Feed items whose link this user hasn't stored yet. Runs before Claude so an
// article is never processed twice (cost rule).
export async function filterNewItems(
  userId: string,
  items: FeedItem[],
): Promise<FeedItem[]> {
  if (items.length === 0) return [];
  const stored = await db
    .select({ link: articles.link })
    .from(articles)
    .where(
      and(
        eq(articles.userId, userId),
        inArray(
          articles.link,
          items.map((item) => item.link),
        ),
      ),
    );
  const storedLinks = new Set(stored.map((row) => row.link));
  return items.filter((item) => !storedLinks.has(item.link));
}

// Stores Claude's results for the user and returns how many rows were added.
// The unique (userId, link) constraint still guards against a concurrent fetch.
export async function insertNewArticles(
  userId: string,
  processed: ProcessedArticle[],
): Promise<number> {
  if (processed.length === 0) return 0;
  const inserted = await db
    .insert(articles)
    .values(
      processed.map(({ item, titleKo, summaryKo, categoryId }) => ({
        userId,
        source: item.source,
        originalTitle: item.originalTitle,
        link: item.link,
        author: item.author,
        publishedAt: item.publishedAt,
        titleKo,
        summaryKo,
        categoryId,
      })),
    )
    .onConflictDoNothing({ target: [articles.userId, articles.link] })
    .returning({ id: articles.id });
  return inserted.length;
}
