# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

AI news collector: a user clicks a button to pull articles from the TechCrunch AI and The Verge AI RSS feeds. Claude translates, summarizes and categorizes each article in Korean, and the user can save articles to Notion. **`PRD.md` is the spec.** It covers features F1–F7, the data model, processing flows, env vars, development stages and acceptance criteria. Read it before you implement anything. The UI language is Korean.

Current state: stage 1 (Clerk auth) is implemented on the `auth` branch. Development follows the 5 stages in PRD §9: Clerk auth → Neon/Drizzle schema and seed → RSS + Claude + card UI → category filter/management → Notion OAuth + MCP save.

## Commands

```bash
npm run dev     # dev server (Turbopack) at http://localhost:3000
npm run build   # production build — also the type check
npm run lint    # ESLint (flat config, next core-web-vitals + typescript)
```

No test runner is configured yet.

The `dev`/`build`/`start` scripts run Next through `node --use-system-ca`. This machine's network re-signs HTTPS with its own root CA (`namguswg`). Windows trusts that CA but Node does not, so without the flag every server-side `fetch` fails with `SELF_SIGNED_CERT_IN_CHAIN`. That covers Clerk's handshake, Claude, Neon, RSS and Notion. Next passes the flag to its worker processes through `NODE_OPTIONS`. Don't change these scripts back to plain `next dev`.

## Stack and Next.js version caveats

- Next.js 16 (App Router, `src/` dir, `@/*` → `src/*`), React 19, Tailwind CSS v4 (CSS-first config in `src/app/globals.css`, no `tailwind.config`). Tailwind is compiled by the `@tailwindcss/turbopack` loader under `turbopack.rules` in `next.config.ts`. There is no PostCSS config, so don't add one.
- `next.config.ts` enables **`cacheComponents`** and **`partialPrefetching`**. This changes how dynamic data and auth behave in rendering. See `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md` and `01-app/01-getting-started/08-caching.md` before you write data-fetching or auth-gated pages.
- Request interception uses `proxy.ts`, not `middleware.ts` (see `01-app/01-getting-started/16-proxy.md`). Clerk's route protection (F1) goes there.
- **Auth (Clerk v7 / Core 3):** `src/proxy.ts` only runs `clerkMiddleware()`. Don't use `createRouteMatcher`, which is deprecated. Every protected page, Server Function and route handler calls `requireUserId()` from `src/lib/auth.ts`, which redirects signed-out users to `/`. On `/`, signed-out visitors see `SignInGate`, which opens the sign-in modal. Use `<Show when="signed-in">` instead of the removed `SignedIn`/`SignedOut`/`Protect` components. Clerk UI is Korean through `koKR` from `@clerk/localizations`.
- Installed libraries: `@clerk/nextjs`, `@neondatabase/serverless`, `drizzle-orm` / `drizzle-kit`, `@anthropic-ai/sdk`, `rss-parser`.
- No `.env*` file or `drizzle.config.ts` exists yet. PRD §8 lists the required env vars (Clerk keys, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NOTION_OAUTH_*`).
- npm skipped `esbuild`'s postinstall script (allowScripts policy). If `drizzle-kit` fails, run `npm install-scripts approve esbuild`.

## Screens (PRD §3)

Visual design (colors, typography, card/button/badge styles) is in **`DESIGN.md`**. Follow it for every new screen. The dev-only `/preview` page renders the main page's real components with sample data, without sign-in.

- **Login:** Clerk sign-in/sign-up UI. Every other page requires auth (F1). Unauthenticated requests redirect to login.
- **Main (news list):** header (app name, category management link, Notion connection status, user menu), "뉴스 가져오기" button, filter tabs **전체 / one tab per category / 미분류** (F5), responsive card grid sorted newest first. Each card shows: Korean title, Korean summary, source (TechCrunch / The Verge), published date, category badge, original link (new tab), and a "Notion 저장" button that becomes "저장됨" plus a Notion link once saved.
- **Category management:** list, add form (name + description, which is the classification criterion), edit, and delete with a confirmation step.
- **Notion connection:** OAuth flow, then the user picks the target Notion page.

## Data model (PRD §5)

Three tables. Use Drizzle on Neon.

- `categories`: `id` uuid PK, `userId`, `name`, `description`, `createdAt`. Unique on `(userId, name)`.
- `articles`: `id` uuid PK, `userId`, `source` (`techcrunch` | `theverge`), `originalTitle`, `link`, `author` (nullable), `publishedAt`, `titleKo`, `summaryKo`, `categoryId` (nullable FK → categories, `ON DELETE SET NULL`), `notionPageUrl` (nullable), `createdAt`. Unique on `(userId, link)`.
- `notion_connections`: `userId` PK, `accessToken`, `refreshToken`, `expiresAt`, `targetPageId`.

`categoryId = null` means "미분류" (uncategorized). "미분류" is never stored as a row.

## Processing flows and rules (PRD §2, §6, §7)

**Fetching news** happens only when the user clicks the button. There is no automatic or scheduled collection.
1. Fetch both RSS feeds in parallel with `rss-parser`:
   - TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/`
   - The Verge AI: `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`
2. Keep only links not already stored for this user. Never call Claude for an article that was already processed (this is a cost rule).
3. Load the user's current categories.
4. Make **one Claude call per new article**, returning JSON `{titleKo, summaryKo (3–4 sentences), category}`. The prompt includes every category's name and description. Run the calls in parallel with a concurrency limit. On failure, or when no category matches, set `categoryId = null`.
5. Insert the results. Show a loading state during the fetch, then report how many new articles were added.

**Categories:** first login seeds the 5 defaults listed in PRD §F6 (AI 모델/연구, 제품/서비스, 투자/비즈니스, 정책/규제, 기타), with their descriptions. Category edits apply only to articles fetched afterward. Existing articles are never reclassified. Deleting a category leaves its articles as 미분류.

**Notion save:**
1. If the user has no `notion_connections` row, send them to the connection screen.
2. If the token has expired, refresh it.
3. Call the Claude API with the **MCP connector**: put `https://mcp.notion.com/mcp` and the user's token in `mcp_servers`. Claude creates a page under `targetPageId` containing the title, summary, category, source, published date and original link. Do not call the Notion REST API directly.
4. Store the returned page URL in `articles.notionPageUrl`. A non-null value means "저장됨" and blocks saving again.
5. On failure, show an error and allow a retry.

**Cross-cutting:**
- **Per-user isolation:** every DB read and write is scoped to the Clerk `userId`. Accounts never see each other's articles or categories.
- **Partial failure:** a failing RSS feed, Claude call or Notion save must not break the app. Show the user a clear Korean message and continue with the rest.
- API keys and tokens (Anthropic, Clerk secret, Notion OAuth) stay on the server only.

## Done criteria and scope

PRD §10 is the acceptance checklist. Verify against it when you finish a stage. PRD §11 lists what is out of scope: adding or managing RSS sources, a reclassify button, scheduled collection, and search or favorites. Don't build any of these unless asked.
