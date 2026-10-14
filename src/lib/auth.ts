import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Every protected page, Server Function and route handler calls this before
// touching user data. Signed-out users go to "/", which opens the sign-in modal.
// Reads the request, so callers in pages must sit behind a <Suspense> boundary.
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }
  return userId;
}
