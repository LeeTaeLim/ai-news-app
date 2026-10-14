import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import type { FeedItem } from "@/lib/rss";

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

// Newest first. Scoped to the user; never call without a verified userId.
export async function getArticleCards(userId: string): Promise<ArticleCard[]> {
  return db
    .select({
      id: articles.id,
      source: articles.source,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      link: articles.link,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      notionPageUrl: articles.notionPageUrl,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.userId, userId))
    .orderBy(desc(articles.publishedAt));
}

// Stores feed items for the user and returns how many were new. Links already
// stored for this user are skipped by the unique (userId, link) constraint.
// Until the Claude step exists, titleKo/summaryKo hold the original title and
// RSS excerpt, and every article is 미분류.
export async function insertNewArticles(
  userId: string,
  items: FeedItem[],
): Promise<number> {
  if (items.length === 0) return 0;
  const inserted = await db
    .insert(articles)
    .values(
      items.map((item) => ({
        userId,
        source: item.source,
        originalTitle: item.originalTitle,
        link: item.link,
        author: item.author,
        publishedAt: item.publishedAt,
        titleKo: item.originalTitle,
        summaryKo: item.summary,
        categoryId: null,
      })),
    )
    .onConflictDoNothing({ target: [articles.userId, articles.link] })
    .returning({ id: articles.id });
  return inserted.length;
}
