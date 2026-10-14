import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { getArticleCards } from "@/lib/articles";
import { NewsGrid, NewsShell } from "./news-layout";
import { SignInGate } from "./sign-in-gate";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center text-slate-500">
          불러오는 중…
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

// Reads the session, so it must stay behind the Suspense boundary (cacheComponents).
async function HomeContent() {
  const { userId } = await auth();
  if (!userId) {
    return <SignInGate />;
  }

  return (
    <NewsShell userMenu={<UserButton />}>
      <Suspense
        fallback={<p className="text-slate-500">뉴스를 불러오는 중…</p>}
      >
        <NewsList userId={userId} />
      </Suspense>
    </NewsShell>
  );
}

async function NewsList({ userId }: { userId: string }) {
  const articles = await getArticleCards(userId);
  return <NewsGrid articles={articles} />;
}
