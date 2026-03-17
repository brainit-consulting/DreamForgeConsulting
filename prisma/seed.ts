import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const adapter = new PrismaNeon({ connectionString: url });
  const db = new PrismaClient({ adapter });

  const email = "dutoit.emile@gmail.com";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD not set in .env");

  // ── Admin user ──
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") {
      await db.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`Updated ${email} role to ADMIN`);
    } else {
      console.log(`Admin ${email} already exists`);
    }
  } else {
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: baseUrl },
      body: JSON.stringify({ email, password, name: "Emile du Toit" }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Sign-up failed (${res.status}): ${body}`);
    }
    await db.user.update({
      where: { email },
      data: { role: "ADMIN", emailVerified: true },
    });
    console.log(`Admin account created: ${email}`);
  }

  // ── Seed mock data (skip if leads already exist) ──
  const leadCount = await db.lead.count();
  if (leadCount > 0) {
    console.log(`Mock data already seeded (${leadCount} leads found). Skipping.`);
    await db.$disconnect();
    return;
  }

  console.log("Seeding mock data...");

  // Leads
  await db.lead.createMany({
    data: [
      { name: "Sarah Chen", email: "sarah@techflow.io", company: "TechFlow Inc", phone: "+1 555-0101", status: "NEW", source: "Website", value: 15000 },
      { name: "Marcus Rivera", email: "marcus@greenleaf.co", company: "GreenLeaf Co", phone: "+1 555-0102", status: "CONTACTED", source: "Referral", value: 28000 },
      { name: "Aisha Patel", email: "aisha@brightpath.org", company: "BrightPath Learning", phone: "+1 555-0103", status: "QUALIFIED", source: "LinkedIn", value: 42000 },
      { name: "James Morrison", email: "james@cloudnest.dev", company: "CloudNest", phone: "+1 555-0104", status: "PROPOSAL", source: "Conference", value: 55000 },
      { name: "Tom Williams", email: "tom@oldschool.biz", company: "OldSchool Biz", status: "LOST", source: "Cold outreach", notes: "Budget too low", value: 8000 },
    ],
  });
  console.log("  ✓ 5 leads");

  // Clients (create users first, then client records)
  const clientData = [
    { name: "Elena Volkov", email: "elena@datastream.ai", company: "DataStream AI", phone: "+1 555-0201" },
    { name: "David Park", email: "contact@novapay.com", company: "NovaPay Solutions", phone: "+1 555-0202" },
    { name: "Lisa Zhang", email: "team@urbanpulse.app", company: "UrbanPulse", phone: "+1 555-0203" },
    { name: "Robert Hayes", email: "dev@meditrack.io", company: "MediTrack Health", phone: "+1 555-0204" },
  ];

  const clientIds: string[] = [];
  for (const c of clientData) {
    const user = await db.user.create({
      data: { email: c.email, name: c.name, role: "CLIENT", emailVerified: true },
    });
    const client = await db.client.create({
      data: { userId: user.id, company: c.company, email: c.email, phone: c.phone },
    });
    clientIds.push(client.id);
  }
  console.log("  ✓ 4 clients");

  // Projects
  const projects = await Promise.all([
    db.project.create({
      data: {
        clientId: clientIds[0], name: "DataStream Dashboard",
        description: "Analytics dashboard SaaS for real-time data monitoring",
        status: "DEVELOPMENT", startDate: new Date("2026-02-25"), deadline: new Date("2026-05-15"),
        budget: 35000, progress: 45,
      },
    }),
    db.project.create({
      data: {
        clientId: clientIds[1], name: "NovaPay Merchant Portal",
        description: "Payment processing portal for small business merchants",
        status: "DESIGN", startDate: new Date("2026-03-01"), deadline: new Date("2026-06-30"),
        budget: 48000, progress: 20,
      },
    }),
    db.project.create({
      data: {
        clientId: clientIds[2], name: "UrbanPulse Mobile App",
        description: "City events and nightlife discovery platform",
        status: "TESTING", startDate: new Date("2025-12-01"), deadline: new Date("2026-03-30"),
        budget: 32000, progress: 78,
      },
    }),
    db.project.create({
      data: {
        clientId: clientIds[3], name: "MediTrack Patient Portal",
        description: "HIPAA-compliant patient management system",
        status: "LAUNCHED", startDate: new Date("2025-06-15"), deadline: new Date("2025-12-15"),
        budget: 65000, progress: 100,
      },
    }),
    db.project.create({
      data: {
        clientId: clientIds[3], name: "MediTrack Scheduling v2",
        description: "AI-powered appointment scheduling add-on",
        status: "DISCOVERY", startDate: new Date("2026-03-10"), deadline: new Date("2026-07-31"),
        budget: 28000, progress: 8,
      },
    }),
  ]);
  console.log("  ✓ 5 projects");

  // Invoices
  await db.invoice.createMany({
    data: [
      { projectId: projects[0].id, clientId: clientIds[0], amount: 17500, status: "SENT", description: "DataStream Dashboard - Phase 1 (50% upfront)", dueDate: new Date("2026-03-25") },
      { projectId: projects[1].id, clientId: clientIds[1], amount: 16000, status: "PAID", description: "NovaPay Merchant Portal - Discovery & Design deposit", dueDate: new Date("2026-03-15"), paidAt: new Date("2026-03-10") },
      { projectId: projects[2].id, clientId: clientIds[2], amount: 24000, status: "PAID", description: "UrbanPulse Mobile App - Development milestone", dueDate: new Date("2026-02-28"), paidAt: new Date("2026-02-26") },
      { projectId: projects[3].id, clientId: clientIds[3], amount: 65000, status: "PAID", description: "MediTrack Patient Portal - Final payment", dueDate: new Date("2025-12-30"), paidAt: new Date("2025-12-28") },
      { projectId: projects[2].id, clientId: clientIds[2], amount: 8000, status: "OVERDUE", description: "UrbanPulse Mobile App - Testing & QA phase", dueDate: new Date("2026-03-10") },
      { projectId: projects[4].id, clientId: clientIds[3], amount: 14000, status: "DRAFT", description: "MediTrack Scheduling v2 - Discovery deposit" },
    ],
  });
  console.log("  ✓ 6 invoices");

  // Tickets
  await db.ticket.createMany({
    data: [
      { clientId: clientIds[2], projectId: projects[2].id, subject: "Map markers not loading on iOS Safari", description: "When using Safari on iPhone 15, the map markers in the events view don't appear. Works fine on Chrome.", status: "OPEN", priority: "HIGH" },
      { clientId: clientIds[3], projectId: projects[3].id, subject: "Need to add two new user roles", description: "We need to add Nurse and Pharmacist roles to the system with specific permissions.", status: "IN_PROGRESS", priority: "MEDIUM" },
      { clientId: clientIds[0], projectId: projects[0].id, subject: "Dashboard export to PDF", description: "Can we add the ability to export dashboard charts as a PDF report?", status: "OPEN", priority: "LOW" },
    ],
  });
  console.log("  ✓ 3 tickets");

  // Activities
  await db.activity.createMany({
    data: [
      { type: "project_update", description: "DataStream Dashboard moved to Development phase", entityType: "project", entityId: projects[0].id },
      { type: "invoice_paid", description: "NovaPay paid invoice ($16,000)", entityType: "invoice", entityId: "inv-mock" },
      { type: "ticket_created", description: "New ticket: Map markers not loading on iOS Safari", entityType: "ticket", entityId: "ticket-mock" },
      { type: "lead_created", description: "New lead: Sarah Chen from TechFlow Inc", entityType: "lead", entityId: "lead-mock" },
      { type: "client_converted", description: "Elena Volkov (DataStream AI) converted to client", entityType: "client", entityId: clientIds[0] },
    ],
  });
  console.log("  ✓ 5 activities");

  console.log("Done! Mock data seeded successfully.");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
