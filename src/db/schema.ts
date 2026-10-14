import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Column names are camelCase here and snake_case in Postgres (casing: "snake_case").
// Every row belongs to a Clerk user; all queries must filter by userId.

export const categories = pgTable(
  "categories",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text().notNull(),
    name: text().notNull(),
    // Classification criterion, sent to Claude in the categorize prompt.
    description: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.name)],
);

export const articles = pgTable(
  "articles",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text().notNull(),
    source: text({ enum: ["techcrunch", "theverge"] }).notNull(),
    originalTitle: text().notNull(),
    link: text().notNull(),
    // RSS dc:creator; null when the feed item has no author.
    author: text(),
    publishedAt: timestamp({ withTimezone: true }).notNull(),
    titleKo: text().notNull(),
    summaryKo: text().notNull(),
    // null = 미분류 (no match, Claude failure, or the category was deleted).
    categoryId: uuid().references(() => categories.id, { onDelete: "set null" }),
    // Non-null = already saved to Notion; blocks saving again.
    notionPageUrl: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Dedupe per user so an article is never sent to Claude twice.
    unique().on(t.userId, t.link),
    index().on(t.userId, t.publishedAt),
    index().on(t.categoryId),
  ],
);

export const notionConnections = pgTable("notion_connections", {
  userId: text().primaryKey(),
  accessToken: text().notNull(),
  refreshToken: text(),
  expiresAt: timestamp({ withTimezone: true }),
  // Picked by the user after OAuth completes.
  targetPageId: text(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type NotionConnection = typeof notionConnections.$inferSelect;
