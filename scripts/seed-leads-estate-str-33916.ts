import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL not set"); process.exit(1); }

const adapter = new PrismaNeon({ connectionString });
const db = new PrismaClient({ adapter });

const leads = [
  // ── Estate Liquidation / Consignment ──────────────────────────────────────
  {
    name: "Paige McTeague",
    email: "clearlyquick@gmail.com",
    company: "Clearly Quick Estate Services LLC",
    phone: "(239) 409-1112",
    website: "https://clearlyquickcom.wordpress.com",
    address: "Bonita Springs, FL",
    sector: "Estate Liquidation / Consignment",
    source: "Smart lead discovery",
    notes: "Score 9/10. Husband-and-wife family operation. Gmail-based, phone-only intake (call 7am–8pm). WordPress site, no booking system, no consignor portal. ASEL member, 25 sales on record. Ideal fit for consignor portal + inventory + automated payout system. verification: sunbiz+website",
    value: 4000,
  },
  {
    name: "Frederic Smith III",
    email: "crimsonestateservices@gmail.com",
    company: "Crimson Estate Services",
    phone: "(941) 380-7688",
    website: "https://crimsonestateservices.com",
    address: "Port Charlotte, FL",
    sector: "Estate Liquidation / Consignment",
    source: "Smart lead discovery",
    notes: "Score 10/10. Veteran-owned LLC, est. 2012. FL Auctioneer License AB3641. Uses HiBid for online auctions but no CRM, no consignor portal, no inventory management. Gmail address signals informal tech stack. BBB confirmed, A+ rating. Charlotte County territory. Suggested service: consignor portal + inventory + payout automation. verification: sunbiz+bbb+website",
    value: 5000,
  },
  {
    name: "Heather K. Downie",
    email: "heather@heirloomliquidators.com",
    company: "Heirloom Liquidators",
    phone: "(941) 726-7829",
    website: "https://heirloomliquidators.com",
    address: "Sarasota, FL",
    sector: "Estate Liquidation / Consignment",
    source: "Smart lead discovery",
    notes: "Score 10/10. FL Auctioneer License #5342. Sunbiz confirmed LLC (L21000461214, active since Oct 2021). No booking system, no portal, no inventory software mentioned on site. Handles remote out-of-state clients. Direct owner email confirmed via ZoomInfo. Small operation — 8 recorded sales but growing. Suggested service: consignor portal + inventory + automated payouts. verification: sunbiz+website",
    value: 4000,
  },
  {
    name: "Claudia N. Deming",
    email: "claudia@demingestatesales.com",
    company: "Deming Estate Sales LLC",
    phone: "(941) 306-2140",
    website: "https://demingestatesales.com",
    address: "Bradenton, FL",
    sector: "Estate Liquidation / Consignment",
    source: "Smart lead discovery",
    notes: "Score 10/10. ISA-certified appraiser, 15+ years in business. Sunbiz confirmed active LLC (L10000025677, est. 2010). No online booking, no portal, no inventory system — email subscription newsletter is only digital tool. Direct owner email confirmed via LinkedIn + RocketReach. Suggested service: consignor portal + inventory + payout automation. verification: sunbiz+linkedin+website",
    value: 5500,
  },
  {
    name: "Joe Corey",
    email: "allegroestateservices@gmail.com",
    company: "Allegro Estate Sales & Services",
    phone: "(239) 326-3362",
    website: "https://allegroestatesales.com",
    address: "Bonita Springs, FL",
    sector: "Estate Liquidation / Consignment",
    source: "Smart lead discovery",
    notes: "Score 9/10. Highest-volume operator in SW FL — 274 recorded sales across Fort Myers, Naples, Sarasota, Charlotte County. Co-owner Amber Leas also on About page. Gmail address, contact form only digital tool, no booking system, no consignor portal. Volume makes ROI pitch very clear — hours saved per sale x 274 sales. Suggested service: consignor portal + inventory + automated payouts. verification: website+estatesales.org",
    value: 6500,
  },
  {
    name: "Gina Pleshar",
    email: "gpleshar2@comcast.net",
    company: "Remember That! Estate Sales",
    phone: "(630) 254-1953",
    website: "https://rememberthatestatesales.com",
    address: "Cape Coral, FL",
    sector: "Estate Liquidation / Consignment",
    source: "Smart lead discovery",
    notes: "Score 9/10. Active since 2006, small crew. Comcast.net email signals very informal tech stack. WordPress site, no booking system, no portal. Mentions 'computerized item research' but no inventory platform named. LinkedIn profile confirmed. Suggested service: consignor portal + inventory management + automated payouts. verification: website+linkedin",
    value: 4000,
  },
  {
    name: "Daniel Clark",
    email: "info@dunnwrightfl.com",
    company: "Dunn Wright Estates",
    phone: "(941) 209-3528",
    website: "https://dunnwrightfl.com",
    address: "Port Charlotte, FL",
    sector: "Estate Liquidation / Consignment",
    source: "Smart lead discovery",
    notes: "Score 9/10. Active Florida LLC. Website returning 500 errors during research — broken/outdated site signals high opportunity. Port Charlotte base covers Charlotte County gap in territory. No booking system, no portal. Owner name + email confirmed. Suggested service: consignor portal + inventory + payout automation + website rebuild. verification: website-only (sunbiz unconfirmed)",
    value: 3500,
  },
  {
    name: "Beth",
    email: "info@consigndesignbonitasprings.com",
    company: "Consign & Design SWFL",
    phone: "(239) 221-3541",
    website: "https://consigndesignswfl.com",
    address: "Bonita Springs, FL",
    sector: "Estate Liquidation / Consignment",
    source: "Smart lead discovery",
    notes: "Score 8/10. Owner first name 'Beth' confirmed, last name not found. Family-owned upscale retail consignment gallery serving Naples/Bonita/SWFL. No inventory system, no online booking, no consignor portal visible. Different model (retail consignment vs. mobile estate sales) — strong fit for consignor management portal pitch. Active as of March 2026. verification: website-only",
    value: 4500,
  },

  // ── STR Co-Hosts / Vacation Rental Managers ───────────────────────────────
  {
    name: "Dennis Junk",
    email: "contact@home24seven.com",
    company: "Home 24/7 Inc.",
    phone: "(239) 318-9273",
    website: "https://home24seven.com",
    address: "Cape Coral, FL",
    sector: "Short-Term Rental Management",
    source: "Smart lead discovery",
    notes: "Score 10/10. Founded 2017 by husband-and-wife team Dennis & Claudia Junk. STR-focused, under 20 properties estimated. No owner portal found anywhere on site. No maintenance ticketing system. Basic Elementor/WordPress site. Under 5 employees. Sunbiz confirmed 'Home 24/7 Inc.' FL registered. Ideal fit for owner portal + maintenance ticketing pitch. verification: sunbiz+website",
    value: 5500,
  },
  {
    name: "Kathleen Fleming",
    email: "reservations@seastarvacationrentals.com",
    company: "Sea Star Property Management LLC",
    phone: "(239) 689-4586",
    website: "https://capecoralvacationrentalhomes.com",
    address: "Fort Myers, FL",
    sector: "Short-Term Rental Management",
    source: "Smart lead discovery",
    notes: "Score 9/10. Registered 2009, 17-year-old LLC verified via BBB. President Kathleen Fleming confirmed via LinkedIn + BBB. Vacation rentals in Fort Myers + Cape Coral, estimated 10–30 property portfolio. No owner portal found on website. No maintenance ticketing system. Basic site (Gravity Forms). No direct owner email publicly posted — use reservations line or LinkedIn. Suggested service: owner portal + maintenance ticketing. verification: sunbiz+bbb+linkedin",
    value: 6000,
  },
  {
    name: "David Puskaric",
    email: "david@grandviewlocalpm.com",
    company: "Grandview Property Management",
    phone: "(239) 244-2124",
    website: "https://grandviewlocalpm.com",
    address: "Naples, FL",
    sector: "Short-Term Rental Management",
    source: "Smart lead discovery",
    notes: "Score 8/10. Sunbiz confirmed LLC L18000117020, active since May 2018. Owner name + email confirmed via ZoomInfo. Manages Naples, Bonita, Estero, Port Charlotte, Fort Myers. Currently uses Buildium/ManageBuilding owner portal — pitch a custom branded upgrade with better UX and maintenance ticketing. Likely 3–7 employees. Suggested service: custom owner portal to replace/augment Buildium. verification: sunbiz+zoominf+website",
    value: 5000,
  },
  {
    name: "(Owner not found)",
    email: "info@beachboutiquerentals.com",
    company: "Beach Boutique Rentals",
    phone: "(866) 817-7974",
    website: "https://beachboutiquerentals.com",
    address: "Anna Maria Island, FL",
    sector: "Short-Term Rental Management",
    source: "Smart lead discovery",
    notes: "Score 8/10. Locally owned boutique on Anna Maria Island (~55 miles from Fort Myers, Manatee County). Very small portfolio (Yelp: 13 photos, small team). No owner name publicly confirmed. No owner portal found. No maintenance ticketing found. Basic Wix site. Email confirmed. Strong pain-point match despite owner name gap. Suggested service: owner portal + maintenance ticketing. verification: website-only",
    value: 4500,
  },
  {
    name: "Alister Munro",
    email: "alister@naplesvacations.com",
    company: "Naples Vacations LLC",
    phone: "(239) 641-5544",
    website: "https://naplesvacations.com",
    address: "Naples, FL",
    sector: "Short-Term Rental Management",
    source: "Smart lead discovery",
    notes: "Score 7/10. Sunbiz active (DBPR license CND2102915), 13+ years in business. ~40 properties (upper edge of sweet spot). Uses Escapia owner portal + dynamic pricing tools. Pitch angle: custom branded owner reporting dashboard as upgrade to generic Escapia reports — better storytelling for property owners, custom maintenance log. Email confirmed via ZoomInfo domain pattern. Suggested service: custom owner reports + maintenance ticketing overlay. verification: sunbiz+dbpr+website",
    value: 7500,
  },
  {
    name: "Nicole Natiello",
    email: "info@onceuponabeachami.com",
    company: "Once Upon a Beach AMI",
    phone: "(941) 584-5844",
    website: "https://onceuponabeachami.com",
    address: "Anna Maria Island, FL",
    sector: "Short-Term Rental Management",
    source: "Smart lead discovery",
    notes: "Score 6/10. Owner name Nicole Natiello confirmed directly on site (also Mike & Nikki Kaleta listed). 'Bigger is NOT better' philosophy — intentionally boutique, likely 10–25 homes, ~45 miles from Fort Myers. Has basic owner portal via reservation software. No maintenance ticketing system found. Modern site. Small staff. Pitch angle: custom maintenance ticketing + owner communication upgrade. verification: website-only",
    value: 5000,
  },
  {
    name: "Peter Albert",
    email: "info@coastalvacationproperties.net",
    company: "Coastal Vacation Properties",
    phone: "(239) 314-5691",
    website: "https://coastalvacationproperties.net",
    address: "Fort Myers Beach, FL",
    sector: "Short-Term Rental Management",
    source: "Smart lead discovery",
    notes: "Score 6/10. Sunbiz confirmed LLC L21000335114, active 2021. Owner Peter Albert (CEO/Manager) confirmed. Family-owned, Fort Myers Beach focus. Uses StreamlineVRS (owner portal) + Beyond (dynamic pricing). Pitch angle: StreamlineVRS has no maintenance ticketing — pitch standalone maintenance + contractor coordination portal. 20–40 homes estimated. Modern site. verification: sunbiz+website",
    value: 5000,
  },
];

async function main() {
  console.log(`Seeding ${leads.length} leads...\n`);
  let created = 0, skipped = 0;
  for (const lead of leads) {
    const existing = await db.lead.findFirst({ where: { company: lead.company } });
    if (existing) { console.log(`  SKIP: ${lead.company}`); skipped++; continue; }
    await db.lead.create({ data: lead });
    console.log(`  ✓ ${lead.company} — ${lead.name}`);
    created++;
  }
  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
