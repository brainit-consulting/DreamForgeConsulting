# Lead Research & Import

Smart lead discovery for DreamForge Consulting. Researches market opportunities, interviews the user to pick a sector, then finds and imports real business leads.

## How to invoke

- `/research-leads` — start from Phase 1 (market research)
- `/research-leads veterinary clinics 34786` — skip to Phase 3 (already know industry + location)

## DreamForge Service Offering

These are DreamForge's **known** service lines — use them as context when scoring leads. However, **do not limit research to these categories**. Phase 1 should actively discover new sectors and opportunities based on current market demand, even if they don't fit neatly into these tiers. DreamForge offers:

- **Custom SaaS development**: client portals, booking/scheduling systems, inventory management, CRM tools, payment integrations, automated workflows
- **Business process automation**: replacing manual workflows, paper forms, spreadsheets, and email chains with automated systems
- **Process optimization**: streamlining operations, integrating disconnected tools, building dashboards for visibility and decision-making
- **IT support & infrastructure**: managed IT, cloud migration, system maintenance, security hardening, backup solutions
- **Website & digital presence**: website redesign, SEO, online branding — often a foot-in-the-door service that leads to bigger projects
- **Shopify & e-commerce**: custom Shopify store setup/migration for boutique retail (1-3 owner, <2k products), theme customization, product import, AI shopping agent, checkout automations, app integrations
- **Training & consulting**: tech training, digital transformation strategy, workflow audits, adoption coaching

## Phase 1: Market Research

**When:** User runs `/research-leads` with no arguments.

**Goal:** Identify 3-5 small business sectors that would benefit from DreamForge's services. **Go beyond the known service tiers** — surface sectors and opportunities the user may not have considered.

Use WebSearch to research:
- "small businesses that need custom software 2025"
- "industries still using paper processes"
- "small business sectors underserved by technology"
- "businesses that need online booking portals"
- "industries without good SaaS solutions"
- "small businesses struggling with manual workflows"
- "businesses that need IT support and don't have it"
- "emerging small business niches needing tech help"
- "small business pain points technology can solve 2025"
- "fastest growing small business sectors needing digital tools"
- Local business trends in Florida

Look for sectors where businesses are:
- Still using paper, spreadsheets, or manual processes
- Lacking online presence or using outdated websites
- Missing booking/scheduling tools
- Managing clients via email and phone with no system
- Running without IT support or proper backups
- Using disconnected tools that don't talk to each other
- In a growing niche where tech adoption is lagging behind demand
- Facing new regulations or compliance needs that require digital systems

**Important:** At least 1-2 of the 3-5 sectors should be **unexpected or niche** — not obvious picks. The value of this research is surfacing opportunities the user hasn't thought of yet.

Present findings as a ranked table:

| # | Sector | Pain Points | DreamForge Service Fit | Typical Budget | Competition |
|---|--------|-------------|----------------------|----------------|-------------|
| 1 | Example | Manual scheduling, paper intake | Booking portal + automation | $8-15k | Low |

After presenting, move to Phase 2.

## Phase 2: Interview

Ask these questions **one at a time**, waiting for an answer before the next:

1. "Which of these sectors interests you most? (pick 1-2, or suggest your own)"
2. "What's your geographic focus? (city, zip code, or radius — e.g., 'Orlando FL' or 'within 20mi of 34786')"
3. "What kind of solution would you pitch? (e.g., booking portal, process automation, managed IT — or I'll suggest based on their pain points)"
4. "Any minimum business size? (solo operator, 2-10 employees, 10+, any)"
5. "How many leads should I find? (default: 10)"

After the interview, summarize the targeting criteria and confirm before proceeding to Phase 3.

## Phase 3: Prospect

Search for real businesses matching the interview criteria:

- Use WebSearch with queries like: "{sector} near {location}", "{sector} {city} FL", "best {sector} in {area}"
- Cross-reference with Florida Sunbiz (sunbiz.org) to verify business registrations
- Use WebFetch on business websites to extract:
  - Owner/contact name (about page, team page, footer)
  - Email address (contact page, footer, about page)
  - Phone number
  - Physical address
  - Website URL
  - Services offered
  - Website quality (modern vs outdated — outdated = higher opportunity)
  - Visible tech stack (online booking? client login? forms?)

### Opportunity Scoring (1-10)

Score each lead based on signals that they need DreamForge's services:

| Signal | Points |
|--------|--------|
| No website or very outdated website | +3 |
| No online booking/scheduling | +2 |
| No client portal or login area | +2 |
| Manual processes visible (call to book, paper forms, fax) | +2 |
| Using disconnected tools (separate email, spreadsheets, no CRM) | +1 |
| No visible IT infrastructure (no cloud, no backups mentioned) | +1 |
| Verified owner name found | +1 |
| Valid email found | +1 |
| Sunbiz registration confirmed | +1 |
| 2-20 employees (sweet spot for custom solutions) | +1 |

Deduct points: modern website with booking (-3), already uses visible SaaS tools (-2), franchise/chain (-2)

### Present Results

Rank leads by opportunity score (highest first). Discard leads scoring below 3 or where basic info can't be verified.

| # | Score | Business | Owner | Email | Phone | Website | Why They're a Fit |
|---|-------|----------|-------|-------|-------|---------|-------------------|
| 1 | 8/10 | Example Vet | Dr. Smith | smith@... | 407-... | outdated | No online booking, paper intake forms, needs automation |

Ask user to confirm which leads to import (all, or select specific ones).

## Phase 4: Import

Generate a TypeScript seed script at `scripts/seed-leads-{industry}-{location}.ts`:

```typescript
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL not set"); process.exit(1); }

const adapter = new PrismaNeon({ connectionString });
const db = new PrismaClient({ adapter });

const leads = [
  // ... lead objects from Phase 3
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

Field mapping:
- `source`: "Smart lead discovery"
- `notes`: Include opportunity score, owner info, services offered, why they're a fit, website quality, suggested DreamForge service
- `value`: Estimate based on business size and project type (conservative — real quotes come later):
  - Shopify store setup/customization (boutique retail, <2k products): $800-1.5k — includes theme work, product import, AI agent add-on, automations
  - Website/digital presence: $1.5-3k
  - IT support retainer: $400-1.2k/month
  - Process automation: $2.5-6k
  - Custom SaaS: $4-12k
  - Training/consulting: $1-2.5k
- `status`: NEW (default)

After generating the script:
1. Show the user the lead data that will be imported
2. Ask for confirmation
3. Run with: `npx tsx scripts/seed-leads-{industry}-{location}.ts`
4. Report results: created vs skipped (duplicates)

## Important Notes

- Always wait for user confirmation between phases
- If the user provides industry + location as arguments, skip directly to Phase 3
- Be honest about data quality — if an email or owner name couldn't be verified, say so
- Never fabricate contact information — only use data found via web research
- The seed script checks for duplicates by company name before inserting
- Consider the FULL service range when scoring opportunities — a business might not need SaaS but desperately needs IT support or process automation
