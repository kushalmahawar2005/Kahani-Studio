import "dotenv/config";
import { defineConfig } from "prisma/config";

// `prisma generate` (run via postinstall on every `npm install`) doesn't
// need a real database connection — only runtime queries do. Falling back
// to "" instead of using prisma/config's `env()` (which throws if the var
// is unset) keeps installs/builds working even when DATABASE_URL isn't
// configured for the current deploy environment (e.g. a Vercel Preview
// deploy that only has it set on Production).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
