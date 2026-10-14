import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

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
