/**
 * Seed script: Add 10 SWFL veterinary/pet business leads
 *
 * Run with: npx tsx scripts/seed-swfl-leads.ts
 *
 * These are real businesses in the Fort Myers / Cape Coral / Naples area
 * (33916 zip, ~50 mile radius) verified via Sunbiz and public websites.
 */

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const db = new PrismaClient({ adapter });

const leads = [
  {
    name: "Dr. Veja Tillman",
    email: "info@just4petsfl.vet",
    company: "Just 4 Pets Wellness Center LLC",
    phone: "(239) 270-5721",
    website: "https://just4petsfl.vet",
    address: "8911 Daniels Pkwy Ste 7, Fort Myers, FL 33912",
    source: "Web research",
    notes: "Owner & DVM. Opened 2019. Small animals, exotics, pocket pets. 15+ years experience. Verified on Sunbiz.",
    value: 15000,
  },
  {
    name: "Dr. Wade Ewing",
    email: "ncac@ncacofnaples.com",
    company: "North Collier Animal Clinic",
    phone: "(239) 597-1313",
    website: "https://ncacofnaples.com",
    address: "10895 Tamiami Trail N, Naples, FL 34108",
    source: "Web research",
    notes: "Owner & DVM. LSU grad. Opened 1985 — 40+ years in business. Full-service clinic. Verified on Sunbiz.",
    value: 20000,
  },
  {
    name: "Dr. Lisa Neuman",
    email: "bayshoreah@yourvetdoc.com",
    company: "Bayshore Animal Hospital of SW Florida LLC",
    phone: "(239) 997-9663",
    website: "https://bayshore-animal-hospital.com",
    address: "6351 Bayshore Rd Ste 50, North Fort Myers, FL 33917",
    source: "Web research",
    notes: "Co-owner with Dr. Vanessa Richards. 20+ years serving N Fort Myers. Full-service including surgery & dental. Verified on Sunbiz.",
    value: 18000,
  },
  {
    name: "Dr. W. Dane Foxwell",
    email: "cah1info@gmail.com",
    company: "Colonial Animal Hospital LLC",
    phone: "(239) 541-0726",
    website: "https://colonialblvdanimalhospital.com",
    address: "9321 6 Mile Cypress Pkwy Ste 150, Fort Myers, FL 33966",
    source: "Web research",
    notes: "Owner & business manager. Opened July 2018. Open 7 days 8am-10pm. Walk-ins welcome. Serves Fort Myers, Lehigh Acres, Estero. Verified on Sunbiz.",
    value: 22000,
  },
  {
    name: "Dr. Michael P. Rohlk",
    email: "",
    company: "Rohlk Animal Hospital",
    phone: "(239) 995-8582",
    website: "https://www.rohlkanimalhospital.com",
    address: "4002 Wholesale Ct, North Fort Myers, FL 33903",
    source: "Web research",
    notes: "Owner & DVM. 26+ years experience. Small husband/wife team operation. Full-service small animal hospital. Verified on Sunbiz.",
    value: 12000,
  },
  {
    name: "Elaine Brower",
    email: "",
    company: "Glamour Paws Grooming & Daycare",
    phone: "(239) 225-9663",
    website: "http://myglamourpaws.com",
    address: "6810 Shoppes at Plantation Dr #10, Fort Myers, FL 33912",
    source: "Web research",
    notes: "Owner & groomer. 44 years experience. Est. 1996. Grooming, training, daycare, boarding. AKC show dog exhibitor. Verified on Sunbiz.",
    value: 8000,
  },
  {
    name: "Kelle",
    email: "PerfectPawsofSWFL@gmail.com",
    company: "Perfect Paws of SWFL",
    phone: "(239) 990-7805",
    website: "https://perfectpawsofswfl.com",
    address: "Cape Coral / Fort Myers, FL (mobile service)",
    source: "Web research",
    notes: "Owner. 6+ years serving SWFL. Mobile pet grooming. Serves Cape Coral, Fort Myers and surrounding areas.",
    value: 5000,
  },
  {
    name: "Kathie",
    email: "",
    company: "Kathie's Mobile Grooming Spa LLC",
    phone: "",
    website: "https://www.kathiesmobilegroomingspa.net",
    address: "Cape Coral, FL (mobile service)",
    source: "Web research",
    notes: "Owner. 23 years grooming experience. Est. 2016 (MN), relocated to FL 2020. Small to medium dogs. Serves Pine Island, Cape Coral, Fort Myers, Estero, Bonita. Verified on Sunbiz.",
    value: 5000,
  },
  {
    name: "Dr. Jane Chetkowski",
    email: "towncountry@mynaplesvet.com",
    company: "Town & Country Animal Hospital",
    phone: "(239) 353-5060",
    website: "https://mynaplesvet.com",
    address: "1828 Santa Barbara Blvd, Naples, FL 34116",
    source: "Web research",
    notes: "DVM at Town & Country Animal Hospital Naples. Serves Naples, Estero, Bonita Springs. Verified on Sunbiz (Town and Country Animal Hospital LLC).",
    value: 16000,
  },
  {
    name: "Doodles & Friends Mobile Grooming",
    email: "",
    company: "Doodles & Friends",
    phone: "(239) 299-5775",
    website: "https://www.doodlesandfriendsmobile.com",
    address: "Cape Coral / Fort Myers / Naples, FL (mobile service)",
    source: "Web research",
    notes: "Mobile dog grooming service. Serves Cape Coral, Fort Myers, Estero, Bonita, Naples. Owner not publicly identified.",
    value: 5000,
  },
];

async function main() {
  console.log("Seeding 10 SWFL veterinary/pet business leads...\n");

  let created = 0;
  let skipped = 0;

  for (const lead of leads) {
    // Skip if a lead with this company already exists
    const existing = await db.lead.findFirst({
      where: { company: lead.company },
    });

    if (existing) {
      console.log(`  SKIP: ${lead.company} (already exists)`);
      skipped++;
      continue;
    }

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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
