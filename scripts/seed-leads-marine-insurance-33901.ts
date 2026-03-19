import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL not set"); process.exit(1); }

const adapter = new PrismaNeon({ connectionString });
const db = new PrismaClient({ adapter });

const leads = [
  {
    name: "Pete Huebner",
    email: "everestmarina@outlook.com",
    company: "Everest Marina",
    phone: "(239) 458-6604",
    website: "https://www.capecoralboatrepair.com/",
    address: "1838 Everest Pkwy, Cape Coral, FL 33904",
    sector: "Marine Services",
    source: "Smart lead discovery",
    notes: "Score: 8/10 | Confidence: Medium | Owner: Pete Huebner | In business since 1993. Outdated website (legacy jQuery/CSS), no online booking, no client portal, using Outlook email. Full-service marina: boat repair, dry rack storage, detailing, parts, bait shop, Mercury dealer. Needs: website redesign + booking system + work order tracking. verification: sunbiz-pending+website-match",
    value: 4000,
  },
  {
    name: "Philipp",
    email: "info@portsidedetailing.com",
    company: "Portside Detailing",
    phone: "(989) 768-0454",
    website: "https://portsidedetailing.com/",
    address: "Cape Coral, FL (mobile)",
    sector: "Marine Services",
    source: "Smart lead discovery",
    notes: "Score: 7/10 | Confidence: Medium | Owner: Philipp (last name unknown) | Mobile marine detailing & restoration. Modern site but no booking system — call/text only. No automation for scheduling. Services SWFL coast from North Port to Naples. Needs: online booking + scheduling automation + invoicing. verification: website-only",
    value: 2500,
  },
  {
    name: "Gary Tantum",
    email: "service@amzim.net",
    company: "Amzim Marine Services",
    phone: "(239) 228-6713",
    website: "https://www.amzimmarineservices.com/",
    address: "3945 Tollhouse Dr #919, Naples, FL 34114",
    sector: "Marine Services",
    source: "Smart lead discovery",
    notes: "Score: 7/10 | Confidence: High | Owner/Founder: Gary Tantum | Mercury Platinum Elite dealer, Formula Boats Factory dealer. 4 mobile workshop vans. Outdated website, basic service request form only, no real-time booking. Needs: booking portal + work order management + client communication. verification: sunbiz-pending+website-match",
    value: 5000,
  },
  {
    name: "Scott",
    email: null,
    company: "Oasis Naples Boat Detailing",
    phone: "(239) 877-7253",
    website: "https://oasisnaplesboatdetailing.com/",
    address: "Naples, FL 34120",
    sector: "Marine Services",
    source: "Smart lead discovery",
    notes: "Score: 6/10 | Confidence: Medium | Owner: Scott (last name unknown) | Mobile boat detailing. Has 'Boat Soaps' subscription program (weekly/biweekly/monthly) — great automation candidate. Modern site but no email listed, quote form only, no booking. Needs: subscription management + booking automation. verification: website-only",
    value: 2500,
  },
  {
    name: "Connie Galewski",
    email: "connie@avalon-insurance.com",
    company: "Avalon Insurance Group",
    phone: "(239) 275-3888",
    website: "https://avalon-insurance.com/",
    address: "7370 College Pkwy #312, Fort Myers, FL 33907",
    sector: "Independent Insurance",
    source: "Smart lead discovery",
    notes: "Score: 7/10 | Confidence: High | Director: Connie Galewski, Manager: Joe Galewski (family-owned) | 3 locations (Fort Myers, Cape Coral, North Port). Mid-2000s website design, 40+ quote forms but no CRM or client portal — clients go to carrier sites for payments. Needs: client portal + CRM + automated follow-ups. verification: sunbiz-pending+website-match",
    value: 6000,
  },
  {
    name: "Toni Ivankovic",
    email: "info@dynamicinsurance.com",
    company: "Dynamic Insurance Agency",
    phone: "(941) 205-5900",
    website: "https://dynamicinsurance.com/",
    address: "353 Mary St, Punta Gorda, FL 33950",
    sector: "Independent Insurance",
    source: "Smart lead discovery",
    notes: "Score: 6/10 | Confidence: Medium | Owner: Toni Ivankovic | Family-owned since 2003, now division of Patriot Growth Insurance Services. No quote system, no portal, no email on site, basic WordPress. Corporate parent may limit scope. Needs: quote form + client portal + process automation. verification: sunbiz-confirmed+website-match",
    value: 4000,
  },
  {
    name: "David Wilcox",
    email: "mark@wilcoxfamilyinsurance.com",
    company: "Wilcox Family Insurance",
    phone: "(239) 337-7755",
    website: "https://www.wilcoxfamilyinsurance.com/",
    address: "3707 Cleveland Ave, Fort Myers, FL 33901",
    sector: "Independent Insurance",
    source: "Smart lead discovery",
    notes: "Score: 5/10 | Confidence: High | President: David Wilcox, VP: Maria Wilcox | Family-owned 25+ years, A+ BBB, largest homeowner agency in SWFL. Modern site with quote forms + carrier payment links but no client portal or CRM. Needs: client portal + automated renewals. verification: sunbiz-pending+website-match",
    value: 5000,
  },
  {
    name: "Tanner Huber",
    email: "tannerhuber@allstate.com",
    company: "3rd Generation Insurance",
    phone: "(239) 225-9026",
    website: "https://3rdgeninsurance.com/fortmyers",
    address: "14421 Metropolis Ave #105A, Fort Myers, FL 33912",
    sector: "Independent Insurance",
    source: "Smart lead discovery",
    notes: "Score: 5/10 | Confidence: High | Owners: Tanner, Brett, Rod Huber (3 generations) | 300+ carrier agreements, non-commissioned model. Modern site with quick quote, 2 locations (Fort Myers + Punta Gorda). Uses Allstate email — no branded domain email. No CRM or client portal. Needs: branded email + CRM + client portal. verification: sunbiz-pending+website-match",
    value: 4000,
  },
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
        sector: lead.sector,
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
