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
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        AI 뉴스 수집기
      </h1>
      <p className="max-w-md text-slate-600 dark:text-slate-400">
        해외 AI 뉴스를 한국어로 번역·요약해서 보여드려요. 로그인하고 시작하세요.
      </p>
      <div className="flex gap-3">
        <SignInButton mode="modal" forceRedirectUrl="/">
          <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            로그인
          </button>
        </SignInButton>
        <SignUpButton mode="modal" forceRedirectUrl="/">
          <button className="rounded-full border border-blue-200 px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950">
            회원가입
          </button>
        </SignUpButton>
      </div>
    </main>
  );
}
