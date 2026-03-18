import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) });
async function main() {
  const row = await db.appSettings.findUnique({ where: { key: "athena" } });
  if (row) {
    const config = JSON.parse(row.value);
    console.log("DB has saved Athena config");
    console.log("Prompt preview:", config.systemPrompt?.slice(0, 100) + "...");
    console.log("Mentions Proposal?", config.systemPrompt?.includes("Proposal") ?? false);
    console.log("Mentions Support Plans?", config.systemPrompt?.includes("Support Plan") ?? false);
  } else {
    console.log("No saved Athena config in DB — using defaults (up to date)");
  }
  await db.$disconnect();
}
main();
