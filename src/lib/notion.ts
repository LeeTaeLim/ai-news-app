import "server-only";

// Saves articles to the "AI 뉴스 북마크" database through the Notion REST API
// with an internal integration token. Notion's hosted MCP server
// (mcp.notion.com) only accepts OAuth tokens, so it can't be used with this one.

const NOTION_VERSION = "2022-06-28";
// Notion rejects rich_text items longer than this.
const RICH_TEXT_MAX_LENGTH = 2_000;

export type NotionArticle = {
  titleKo: string;
  summaryKo: string;
  link: string;
  publishedAt: Date;
  // null = 미분류
  categoryName: string | null;
};

// Publish date as YYYY-MM-DD in Korean time, matching the card.
const dateFormat = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Seoul",
});

const text = (content: string) => [
  { type: "text", text: { content: content.slice(0, RICH_TEXT_MAX_LENGTH) } },
];

// Creates one database row and returns its page URL. Throws on failure.
export async function createNotionPage(article: NotionArticle): Promise<string> {
  const token = process.env.NOTION_API_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    throw new Error("NOTION_API_TOKEN or NOTION_DATABASE_ID is not set");
  }

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        제목: { title: text(article.titleKo) },
        요약: { rich_text: text(article.summaryKo) },
        // Select options are created on first use.
        카테고리: { select: { name: article.categoryName ?? "미분류" } },
        출처: { url: article.link },
        날짜: { date: { start: dateFormat.format(article.publishedAt) } },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Notion API ${response.status}: ${await response.text()}`,
    );
  }
  const page = (await response.json()) as { url: string };
  return page.url;
}
