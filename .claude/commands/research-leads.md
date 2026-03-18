# Lead Research & Import

Research and import business leads into the DreamForge CRM database.

## Instructions

The user will provide:
- **Industry/niche** (e.g., "veterinary clinics", "pet grooming", "dental offices")
- **Location** (zip code, city, or radius)
- **Count** (how many leads they want, default 10)

Follow this process:

### 1. Research Phase
- Use WebSearch to find businesses in the specified area and industry
- Search for business names, owners, contact info
- Cross-reference with Florida Sunbiz (sunbiz.org) to verify business registrations
- Use WebFetch on business websites to extract:
  - Owner/contact name
  - Email address (check contact pages, footers, about pages)
  - Phone number
  - Physical address
  - Website URL

### 2. Quality Ranking
Rank leads by information completeness. Prioritize leads with:
- Verified owner name (highest priority)
- Valid email address found
- Sunbiz registration confirmed
- Phone number
- Physical address
- Website

Discard leads where the business name and basic info cannot be verified.

### 3. Generate Seed Script
Create a TypeScript script at `scripts/seed-leads-{industry}-{location}.ts` that:
- Connects to the database using PrismaNeon adapter
- Checks for duplicates by company name before inserting
- Creates leads with all available fields: name, email, company, phone, website, address, source, notes, value
- Set `source` to "Web research"
- Set `notes` with owner info, years in business, services, verification status
- Estimate `value` based on business size (small mobile: $5k, solo practice: $8-12k, established clinic: $15-22k)
- Uses `email: lead.email || null` for missing emails (email is optional)

### 4. Present & Execute
- Show the user a ranked table of leads found
- Ask if they want to run the script
- Run with: `npx tsx scripts/seed-leads-{industry}-{location}.ts`
- Report how many were created vs skipped (duplicates)

### Template for seed script:
```typescript
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL not set"); process.exit(1); }

const adapter = new PrismaNeon({ connectionString });
const db = new PrismaClient({ adapter });

const leads = [
  // ... lead objects
];

async function main() {
  console.log(`Seeding ${leads.length} leads...\n`);
  let created = 0, skipped = 0;
  for (const lead of leads) {
    const existing = await db.lead.findFirst({ where: { company: lead.company } });
    if (existing) { console.log(`  SKIP: ${lead.company}`); skipped++; continue; }
    await db.lead.create({
      data: {
        name: lead.name,
        email: lead.email || null,
        company: lead.company,
        phone: lead.phone || null,
        website: lead.website || null,
        address: lead.address || null,
        source: lead.source,
        notes: lead.notes,
        value: lead.value,
      },
    });
    console.log(`  ✓ ${lead.company} — ${lead.name}`);
    created++;
  }
  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
```
