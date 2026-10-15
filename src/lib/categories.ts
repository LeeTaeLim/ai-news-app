import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { CategoryOption } from "@/lib/translate";

export type CategoryTab = {
  id: string;
  name: string;
};

// Creation order, so the defaults keep their seeded order on the tab bar.
// Scoped to the user; never call without a verified userId.
export async function getCategoryTabs(userId: string): Promise<CategoryTab[]> {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.createdAt), asc(categories.name));
}

// Name and description of every category, for the Claude classification prompt.
export async function getCategoryOptions(
  userId: string,
): Promise<CategoryOption[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
    })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.createdAt), asc(categories.name));
}
