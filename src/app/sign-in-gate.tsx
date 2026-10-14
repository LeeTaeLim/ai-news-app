"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useAuth, useClerk } from "@clerk/nextjs";

// Shown to signed-out visitors. Opens the sign-in modal as soon as Clerk loads;
// the buttons reopen it if the user closes the modal.
export function SignInGate() {
  const clerk = useClerk();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (!isLoaded || handled.current) return;
    handled.current = true;
    if (isSignedIn) {
      // The server rendered this gate from a stale session (e.g. right after
      // signing in). Clerk refuses to open the modal while signed in, so
      // re-render the server view instead.
      router.refresh();
    } else {
      clerk.openSignIn({ forceRedirectUrl: "/" });
    }
  }, [isLoaded, isSignedIn, clerk, router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-4 text-center dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        AI 뉴스 수집기
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        해외 AI 뉴스를 한국어로 번역·요약해서 보여드려요. 로그인하고 시작하세요.
      </p>
      <div className="flex gap-3">
        <SignInButton mode="modal" forceRedirectUrl="/">
          <button className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300">
            로그인
          </button>
        </SignInButton>
        <SignUpButton mode="modal" forceRedirectUrl="/">
          <button className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900">
            회원가입
          </button>
        </SignUpButton>
      </div>
    </main>
  );
}
