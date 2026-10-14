import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't read Next's env files, so load .env.local ourselves.
process.loadEnvFile(".env.local");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
