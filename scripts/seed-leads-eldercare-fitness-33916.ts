import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL not set"); process.exit(1); }

const adapter = new PrismaNeon({ connectionString });
const db = new PrismaClient({ adapter });

const leads = [
  // ── Elder Care / Home Health ──
  {
    name: "Gisel Medrano",
    email: "friendlyhhc239@gmail.com",
    company: "Friendly Home Health Care Corp",
    phone: "239-529-5986",
    website: "https://friendlyhhc.com",
    address: "5051 Castello Dr Ste 16, Naples, FL 34103",
    source: "Smart lead discovery",
    notes: "Opportunity: 8/10. Owner: Gisel Medrano RN (President). Medicare-certified home health agency. Modern Tailwind website but zero booking/portal. Relies on phone + fax referrals. Uses Gmail for business email. Pitch: client/family portal + scheduling automation + digital intake forms.",
    value: 5000,
  },
  {
    name: "Adam Corcoran",
    email: null,
    company: "Golden Care Home Health",
    phone: "239-440-2900",
    website: "https://goldencarefl.com",
    address: "1917 Trade Center Way Ste 2, Naples, FL 34109",
    source: "Smart lead discovery",
    notes: "Opportunity: 8/10. Contact: Adam Corcoran (239-302-8863). No email found online. Phone-only 24/7 operation. Professional site but all manual intake — no booking, no portal. Locally owned. Pitch: family portal with care updates + scheduling automation + online intake. Reach out by phone or mail.",
    value: 6000,
  },
  {
    name: "Tim Bradshaw",
    email: null,
    company: "Affordable Senior Home Care",
    phone: "239-236-7238",
    website: "https://www.affordableseniorhomecare.net",
    address: "12995 S Cleveland Ave #252, Fort Myers, FL 33907",
    source: "Smart lead discovery",
    notes: "Opportunity: 7/10. Founder/CEO: Tim Bradshaw. Est. 2005 in NJ, expanded to SW Florida. No email found online. Modern WordPress site but no online booking, manual home assessments, no client portal. Serves Lee + Collier counties. Pitch: client dashboard for families + automated scheduling + caregiver tracking. Reach out by phone or mail.",
    value: 5000,
  },
  {
    name: "Cornerstone Home Healthcare",
    email: "cornerstonehomehealth@yahoo.com",
    company: "Cornerstone Home Healthcare Services",
    phone: "239-356-8851",
    website: "https://cornerstonehomehealthcare.com",
    address: "9240 Bonita Beach Rd SE Ste 3305, Bonita Springs, FL 34135",
    source: "Smart lead discovery",
    notes: "Opportunity: 7/10. Sunbiz confirmed since 2004. Uses Yahoo email for business. No booking, no portal. 3 phone lines suggests high call volume. Family-owned. Pitch: scheduling system + compliance dashboard + family portal. Yahoo email signals low tech adoption — strong candidate.",
    value: 4000,
  },
  {
    name: "A1 America Home Health Agency",
    email: "info@a1americahha.com",
    company: "A1 America Home Health Agency",
    phone: "239-221-8410",
    website: "https://a1americahha.com",
    address: "2454 Winkler Ave, Fort Myers, FL 33901",
    source: "Smart lead discovery",
    notes: "Opportunity: 6/10. Joint Commission accredited. WordPress site focused on employment not patient services. No booking, no patient portal visible. Multiple email contacts (info@, hr@, patientcare@). Pitch: patient-facing portal + online referral intake + scheduling automation.",
    value: 4000,
  },

  // ── Boutique Fitness Studios ──
  {
    name: "Maryann McKenna",
    email: "mamckenna55@yahoo.com",
    company: "Dragonfly Yoga & Pilates",
    phone: "239-822-0415",
    website: "https://www.fortmyersyogapilates.com",
    address: "14261 S Tamiami Trail #19, Fort Myers, FL 33912",
    source: "Smart lead discovery",
    notes: "Opportunity: 8/10. Owner: Maryann McKenna. Basic Wix site — no booking system, no scheduling, no membership management. Yahoo personal email. Sunbiz confirmed LLC. Pitch: full website redesign + integrated booking/scheduling + membership portal. Biggest tech gap of all fitness leads.",
    value: 3000,
  },
  {
    name: "Heather Miller",
    email: "frondesk@capecoralyoga.com",
    company: "Cape Coral Yoga & Pilates",
    phone: "239-541-8253",
    website: "https://capecoralyoga.com",
    address: "1202 SE 8th Place, Cape Coral, FL 33990",
    source: "Smart lead discovery",
    notes: "Opportunity: 7/10. Owner: Heather Miller. Has a custom mobile app (iOS/Android) and virtual classes — more tech-savvy than most. But no integrated booking on website, 35+ weekly classes without visible scheduling tool. Pitch: booking integration + membership management portal + website enhancement.",
    value: 2500,
  },
  {
    name: "Nancy Gerald",
    email: "info@ouryogaplace.com",
    company: "Our Yoga Place",
    phone: "623-670-4782",
    website: "https://ouryogaplace.com",
    address: "8002 Mediterranean Dr, Estero, FL 33928",
    source: "Smart lead discovery",
    notes: "Opportunity: 7/10. Owners: Nancy Gerald & Tom Palmer. Located in Coconut Point Mall. WordPress site with analytics but no booking, no scheduling, no membership tools. Also offers IV therapy, halotherapy, red light — needs e-commerce for wellness services. Pitch: booking system + Shopify for wellness products + membership portal.",
    value: 2500,
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
