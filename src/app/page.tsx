import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { SignInGate } from "./sign-in-gate";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center text-zinc-500">
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
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          AI 뉴스 수집기
        </h1>
        <UserButton />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 text-zinc-500">
        뉴스 목록은 다음 단계에서 추가됩니다.
      </main>
    </div>
  );
}
