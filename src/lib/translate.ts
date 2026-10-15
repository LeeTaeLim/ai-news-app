import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { FeedItem } from "@/lib/rss";

const MODEL = "claude-opus-5-5";
// How many Claude requests run at once during one fetch.
const CONCURRENCY = 5;
// Article body sent to Claude. Enough for a 3–4 sentence summary without
// paying for very long articles in full.
const BODY_MAX_LENGTH = 8_000;
// Returned when no category fits; stored as categoryId = null.
const UNCATEGORIZED = "미분류";

const client = new Anthropic();

export type CategoryOption = {
  id: string;
  name: string;
  description: string;
};

export type ProcessedArticle = {
  item: FeedItem;
  titleKo: string;
  summaryKo: string;
  // null = 미분류
  categoryId: string | null;
  // false = Claude failed; titleKo/summaryKo hold the original title and excerpt.
  translated: boolean;
};

type ClaudeResult = {
  titleKo: string;
  summaryKo: string;
  category: string;
};

const SYSTEM = `You are an editor for a Korean AI news service. For each English news article you receive, produce:
- titleKo: the headline translated into natural Korean. Keep product, company and model names in their original spelling.
- summaryKo: a 3–4 sentence Korean summary of the article's key points, in neutral Korean news style with plain declarative "-다" endings.
- category: the single category name from the provided list that best fits the article, matched against each category's description. Use "${UNCATEGORIZED}" if none fits.`;

// One Claude call per article, at most CONCURRENCY at a time, in input order.
// Never throws: a failed call keeps the original text and leaves it 미분류.
export async function processArticles(
  items: FeedItem[],
  categories: CategoryOption[],
): Promise<ProcessedArticle[]> {
  const results: ProcessedArticle[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await processArticle(items[i], categories);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker),
  );
  return results;
}

async function processArticle(
  item: FeedItem,
  categories: CategoryOption[],
): Promise<ProcessedArticle> {
  try {
    const result = await callClaude(item, categories);
    const category = categories.find((c) => c.name === result.category);
    return {
      item,
      titleKo: result.titleKo.trim() || item.originalTitle,
      summaryKo: result.summaryKo.trim() || item.summary,
      categoryId: category?.id ?? null,
      translated: true,
    };
  } catch (error) {
    console.error(`Claude processing failed: ${item.link}`, error);
    return {
      item,
      titleKo: item.originalTitle,
      summaryKo: item.summary,
      categoryId: null,
      translated: false,
    };
  }
}

async function callClaude(
  item: FeedItem,
  categories: CategoryOption[],
): Promise<ClaudeResult> {
  const categoryList = categories
    .map((c) => `- ${c.name}: ${c.description}`)
    .join("\n");
  const body = item.body.slice(0, BODY_MAX_LENGTH);

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 4_000,
    // Plain translation and summarizing; low effort keeps it fast and cheap.
    output_config: {
      effort: "low",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            titleKo: { type: "string" },
            summaryKo: { type: "string" },
            category: {
              type: "string",
              enum: [...categories.map((c) => c.name), UNCATEGORIZED],
            },
          },
          required: ["titleKo", "summaryKo", "category"],
          additionalProperties: false,
        },
      },
    },
    // If a safety classifier declines, the API retries on a fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `<categories>
${categoryList || "(none)"}
</categories>

<article>
<title>${item.originalTitle}</title>
<body>
${body || item.summary || "(no body in feed)"}
</body>
</article>`,
      },
    ],
  });

  if (response.stop_reason !== "end_turn") {
    throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);
  }
  const text = response.content.find((block) => block.type === "text");
  if (!text) throw new Error("No text block in response");
  return JSON.parse(text.text) as ClaudeResult;
}
