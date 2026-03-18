import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const notes = await db.stageNote.findMany({
    where: { stage: "PROPOSAL" },
    include: { project: { select: { name: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (notes.length === 0) {
    console.log("No PROPOSAL stage notes found.");
  } else {
    for (const n of notes) {
      console.log("---");
      console.log(`Project: ${n.project.name} (${n.project.status})`);
      console.log(`Created: ${n.createdAt.toISOString()}`);
      console.log(`Length: ${n.content.length} chars`);
      console.log(`Preview: ${n.content.slice(0, 200)}...`);
    }
  }

  console.log(`\nTotal PROPOSAL notes: ${notes.length}`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
