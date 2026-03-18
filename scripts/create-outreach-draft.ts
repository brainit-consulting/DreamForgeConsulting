import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL not set"); process.exit(1); }

const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

async function main() {
  const draft = await db.outreachEmail.create({
    data: {
      subject: "Complimentary IT / AI Training & Consultation — In Person",
      body: `I'd love to learn more about you and your business — and together we can discover if I can add value to your operations.

No obligation. Free in-person meetings available in the Fort Myers / Cape Coral area.

Kind Regards,
Emile du Toit

Text: (972) 900-6286
Book a meeting: brainitconsulting.com
Free learning resources: dreamforgeworld.com`,
    },
  });

  console.log(`✓ Draft template created`);
  console.log(`  ID: ${draft.id}`);
  console.log(`  Subject: ${draft.subject}`);
  console.log(`  Status: ${draft.status}`);
  console.log(`  Recipient: None (template — assign leads from Outreach page)`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
