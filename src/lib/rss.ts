import "server-only";
import Parser from "rss-parser";
import type { NewArticle } from "@/db/schema";

type Source = NewArticle["source"];

const FEEDS: { source: Source; label: string; url: string }[] = [
  {
    source: "techcrunch",
    label: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    source: "theverge",
    label: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];

// Length of the temporary summary until Claude writes summaryKo.
const SUMMARY_MAX_LENGTH = 300;

export type FeedItem = {
  source: Source;
  originalTitle: string;
  link: string;
  author: string | null;
  publishedAt: Date;
  // RSS excerpt, stored as summaryKo until the Claude step exists.
  summary: string;
};

type ParsedItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  // TechCrunch (RSS 2.0) uses dc:creator; The Verge (Atom) uses author.
  creator?: string;
  author?: string;
  // Atom only: short excerpt. contentSnippet is the full article there.
  summary?: string;
  contentSnippet?: string;
};

const parser: Parser<object, ParsedItem> = new Parser({ timeout: 10_000 });

// Fetches both feeds in parallel and keeps items published at or after `since`.
// A failing feed is reported in failedSources instead of failing the whole fetch.
export async function fetchRecentItems(
  since: Date,
): Promise<{ items: FeedItem[]; failedSources: string[] }> {
  const results = await Promise.allSettled(
    FEEDS.map((feed) => parser.parseURL(feed.url)),
  );

  const items: FeedItem[] = [];
  const failedSources: string[] = [];
  const seenLinks = new Set<string>();

  results.forEach((result, i) => {
    const feed = FEEDS[i];
    if (result.status === "rejected") {
      console.error(`RSS fetch failed: ${feed.url}`, result.reason);
      failedSources.push(feed.label);
      return;
    }
    for (const raw of result.value.items) {
      const item = toFeedItem(feed.source, raw);
      if (!item || item.publishedAt < since || seenLinks.has(item.link)) {
        continue;
      }
      seenLinks.add(item.link);
      items.push(item);
    }
  });

  return { items, failedSources };
}

function toFeedItem(source: Source, raw: ParsedItem): FeedItem | null {
  const title = raw.title ? decodeEntities(raw.title).trim() : "";
  const link = raw.link ? normalizeLink(raw.link) : null;
  const publishedAt = raw.isoDate ? new Date(raw.isoDate) : null;
  if (!title || !link || !publishedAt || Number.isNaN(publishedAt.getTime())) {
    return null;
  }
  const author = (raw.creator ?? raw.author)?.trim() || null;
  return {
    source,
    originalTitle: title,
    link,
    author,
    publishedAt,
    summary: toPlainSummary(raw.summary || raw.contentSnippet || ""),
  };
}

// The dedupe key: drops the fragment and utm_* tracking params so the same
// article shared with different tracking links is stored once.
function normalizeLink(link: string): string | null {
  try {
    const url = new URL(link.trim());
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_")) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

// The Verge escapes punctuation in titles (e.g. &#8216;AI&#8217;).
function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] !== "#") return NAMED_ENTITIES[code.toLowerCase()] ?? match;
    const point =
      code[1] === "x" || code[1] === "X"
        ? parseInt(code.slice(2), 16)
        : parseInt(code.slice(1), 10);
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match;
  });
}

function toPlainSummary(text: string): string {
  const plain = decodeEntities(text.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > SUMMARY_MAX_LENGTH
    ? `${plain.slice(0, SUMMARY_MAX_LENGTH).trimEnd()}…`
    : plain;
}
