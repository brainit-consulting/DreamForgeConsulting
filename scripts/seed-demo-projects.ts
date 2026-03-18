/**
 * Seed realistic demo data for existing mock clients' projects.
 * Adds stage tasks + notes for Discovery and Design stages.
 *
 * Run with: npx tsx scripts/seed-demo-projects.ts
 */

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL not set"); process.exit(1); }

const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

const projectData: Record<string, {
  discoveryTasks: string[];
  discoveryNotes: string[];
  designTasks: string[];
  designNotes: string[];
}> = {
  "DataStream AI": {
    discoveryTasks: [
      "Interview stakeholders on data pipeline requirements",
      "Audit existing data sources (PostgreSQL, S3, third-party APIs)",
      "Define KPI dashboard metrics and alert thresholds",
      "Map user roles: Admin, Analyst, Viewer",
      "Document API integration requirements for Salesforce + HubSpot",
    ],
    discoveryNotes: [
      "Client needs real-time data ingestion from 3 sources: PostgreSQL warehouse, S3 event logs, and Salesforce CRM. Current process is manual CSV exports — causes 48hr data lag.",
      "Key pain point: marketing team can't see campaign ROI until end of month. Need daily automated reports with drill-down by channel.",
      "Security requirement: SOC 2 compliance. All data must be encrypted at rest and in transit. Role-based access mandatory.",
    ],
    designTasks: [
      "Wireframe main dashboard with KPI cards + charts",
      "Design data pipeline architecture diagram",
      "Create interactive prototype for report builder",
      "Design alert configuration UI",
      "Mockup mobile-responsive layouts",
    ],
    designNotes: [
      "Dashboard design: 4 KPI cards at top (Revenue, Active Users, Conversion Rate, Churn), followed by time-series charts with date range picker. Dark theme preferred.",
      "Report builder: drag-and-drop columns, filter by date/segment/channel, export to PDF/CSV. Similar to Metabase but branded.",
      "Client approved the wireframes on Mar 15. Requested adding a 'Favorites' feature for saved report configurations.",
    ],
  },
  "NovaPay Solutions": {
    discoveryTasks: [
      "Map payment flow: merchant onboarding → checkout → settlement",
      "Research PCI DSS compliance requirements",
      "Define merchant dashboard features",
      "Interview 5 beta merchants about pain points",
      "Evaluate Stripe Connect vs custom payment processing",
    ],
    discoveryNotes: [
      "NovaPay wants a white-label payment portal for their merchants. Each merchant gets a branded checkout page, transaction dashboard, and settlement reports.",
      "Beta merchant feedback: #1 request is faster settlement (currently T+3, want T+1). #2 is better dispute management UI. #3 is multi-currency support.",
      "Decision: Use Stripe Connect for payment processing (handles PCI compliance), build custom merchant dashboard on top.",
    ],
    designTasks: [
      "Design merchant onboarding flow (5-step wizard)",
      "Wireframe transaction dashboard with search + filters",
      "Create checkout page template system (customizable branding)",
      "Design settlement report views (daily, weekly, monthly)",
      "Mockup dispute management interface",
    ],
    designNotes: [
      "Merchant onboarding: 5 steps — Business Info, Bank Details, Branding (logo + colors), Checkout Config, Review & Submit. Progress bar at top.",
      "Checkout page supports merchant branding: custom logo, accent color, and thank-you message. Preview in real-time as they configure.",
      "Client wants the dashboard to feel like Stripe's dashboard but simpler. Focus on clarity over features.",
    ],
  },
  "MediTrack Health": {
    discoveryTasks: [
      "Interview clinical staff on workflow pain points",
      "Map patient journey from intake to discharge",
      "Review HIPAA compliance requirements for SaaS",
      "Define user roles: Doctor, Nurse, Admin, Patient",
      "Audit current EHR system limitations",
    ],
    discoveryNotes: [
      "MediTrack is a health clinic management platform. Primary users: front desk (scheduling), nurses (vitals + triage), doctors (notes + prescriptions), patients (portal).",
      "Biggest pain point: appointment scheduling is done on paper. Double-bookings happen weekly. Need a calendar view with drag-and-drop rescheduling.",
      "HIPAA: all PHI must be encrypted, audit logs for every access, auto-logout after 15 min inactivity, BAA required with hosting provider.",
    ],
    designTasks: [
      "Design appointment calendar with drag-and-drop",
      "Wireframe patient intake form (digital)",
      "Create doctor's note-taking interface mockup",
      "Design patient portal (appointments, lab results, messaging)",
      "Mockup admin dashboard with clinic analytics",
    ],
    designNotes: [
      "Calendar design: week view default, color-coded by appointment type (checkup=blue, follow-up=green, urgent=red). Click to book, drag to reschedule.",
      "Patient portal: clean, accessible design. Large text option for elderly patients. View upcoming appointments, download lab results, send secure messages to provider.",
      "Doctor's note interface: template-based with auto-fill from vitals. ICD-10 code search with autocomplete. E-prescribing integration planned for v2.",
    ],
  },
  "UrbanPulse": {
    discoveryTasks: [
      "Define smart city data sources (IoT sensors, traffic, weather)",
      "Interview city planning department on dashboard needs",
      "Research real-time data streaming requirements",
      "Map integration points with existing city systems",
      "Define alert system for threshold breaches",
    ],
    discoveryNotes: [
      "UrbanPulse is a smart city analytics dashboard. Pulls data from IoT sensors (air quality, noise, traffic flow), weather APIs, and public transit systems.",
      "City planners need: real-time map view of sensor data, historical trend analysis, and automated alerts when pollution or noise exceeds thresholds.",
      "Technical requirement: handle 10,000+ sensor readings per minute. WebSocket for real-time updates. 90-day data retention with archiving to cold storage.",
    ],
    designTasks: [
      "Design interactive city map with sensor overlay",
      "Wireframe real-time data dashboard with charts",
      "Create alert configuration and notification UI",
      "Design historical analysis view with comparison tools",
      "Mockup mobile app for field inspectors",
    ],
    designNotes: [
      "Map view: Mapbox integration with color-coded sensor pins (green=normal, yellow=warning, red=alert). Click pin for detail popup with live readings + 24hr trend.",
      "Dashboard: 6 metric cards at top, filterable by district. Main area shows time-series charts for selected metrics. Comparison mode: overlay two time periods.",
      "Mobile app for field inspectors: simplified view, offline capability, ability to add manual readings when sensors are down.",
    ],
  },
  "Morgan Veterinary Practice": {
    discoveryTasks: [
      "Interview practice manager about current workflow",
      "Map patient (pet) lifecycle from registration to treatment",
      "Define appointment types and scheduling rules",
      "Review current paper-based record system",
      "Identify integration needs (lab systems, pharmacy)",
    ],
    discoveryNotes: [
      "Morgan Vet needs a practice management system. Currently using paper files and a shared Google Calendar. Lost a patient file last month — urgent need for digital records.",
      "Key features needed: pet profiles with medical history, appointment scheduling with reminders, invoicing, and inventory tracking for medications.",
      "Practice has 3 vets, 2 technicians, 1 front desk. About 30 appointments per day. Open 6 days, half day Saturday.",
    ],
    designTasks: [
      "Design pet profile page with medical history timeline",
      "Wireframe appointment scheduler with vet availability",
      "Create invoicing flow mockup",
      "Design medication inventory dashboard",
      "Mockup client-facing booking portal",
    ],
    designNotes: [
      "Pet profile: photo, species/breed, DOB, weight chart over time, vaccination schedule, medical history as a timeline. Owner info linked.",
      "Scheduler: day/week view per vet. 15/30/60 min slots depending on appointment type. Color coded: wellness=green, sick visit=orange, surgery=red, grooming=blue.",
      "Client loved the pet profile mockup. Wants to add a 'Pet Parent Portal' where owners can see upcoming vaccinations and book appointments online.",
    ],
  },
};

async function main() {
  const projects = await db.project.findMany({
    include: { client: true },
  });

  console.log(`Found ${projects.length} projects\n`);

  let updated = 0;

  for (const project of projects) {
    const clientName = project.client?.company;
    if (!clientName) continue;

    const data = projectData[clientName];
    if (!data) {
      console.log(`  SKIP: ${project.name} (${clientName}) — no demo data defined`);
      continue;
    }

    // Check if already seeded (has discovery tasks)
    const existingTasks = await db.stageTask.count({
      where: { projectId: project.id, stage: "DISCOVERY" },
    });
    if (existingTasks > 0) {
      console.log(`  SKIP: ${project.name} — already has stage data`);
      continue;
    }

    // Seed Discovery tasks
    for (let i = 0; i < data.discoveryTasks.length; i++) {
      await db.stageTask.create({
        data: {
          projectId: project.id,
          stage: "DISCOVERY",
          title: data.discoveryTasks[i],
          completed: true, // Discovery is done
          sortOrder: i,
        },
      });
    }

    // Seed Discovery notes
    for (const note of data.discoveryNotes) {
      await db.stageNote.create({
        data: {
          projectId: project.id,
          stage: "DISCOVERY",
          content: note,
        },
      });
    }

    // Seed Design tasks
    for (let i = 0; i < data.designTasks.length; i++) {
      await db.stageTask.create({
        data: {
          projectId: project.id,
          stage: "DESIGN",
          title: data.designTasks[i],
          completed: true, // Design is done
          sortOrder: i,
        },
      });
    }

    // Seed Design notes
    for (const note of data.designNotes) {
      await db.stageNote.create({
        data: {
          projectId: project.id,
          stage: "DESIGN",
          content: note,
        },
      });
    }

    // Move project to PROPOSAL stage if it's at DISCOVERY or DESIGN
    if (project.status === "DISCOVERY" || project.status === "DESIGN") {
      await db.project.update({
        where: { id: project.id },
        data: { status: "PROPOSAL", progress: 22 },
      });
      console.log(`  ✓ ${project.name} (${clientName}) — seeded + moved to PROPOSAL`);
    } else {
      console.log(`  ✓ ${project.name} (${clientName}) — seeded (kept at ${project.status})`);
    }

    updated++;
  }

  console.log(`\nDone: ${updated} projects seeded with demo data.`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
