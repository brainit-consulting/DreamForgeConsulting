export interface HelpSection {
  title: string;
  content: string;
  tips?: string[];
}

export const helpContent: Record<string, HelpSection> = {
  dashboard: {
    title: "Dashboard — Command Center",
    content:
      "The Dashboard gives you a real-time snapshot of your entire consulting business. The four KPI cards at the top show Total Revenue (sum of all paid invoices), Active Projects (currently in progress), New Leads (in your pipeline), and Active Clients. The Revenue Overview chart displays monthly income over the past 6 months. The Recent Activity feed logs every significant action — project stage changes, invoice payments, new leads, and client conversions. The Active Projects section shows each project's current workflow stage and progress percentage.",
    tips: [
      "KPI data updates automatically as you add leads, clients, projects, and invoices",
      "The activity feed is populated from real actions — stage transitions, lead promotions, and invoice payments all appear here",
      "Revenue chart reflects paid invoice amounts grouped by month",
    ],
  },
  leads: {
    title: "Leads — Sales Pipeline",
    content:
      "Leads are potential clients you're tracking through your sales pipeline. Each lead has a status that progresses through: New → Contacted → Qualified → Proposal → Converted (or Lost). Use the 'Add Lead' button to create a new lead with their name, email, company, phone, source, estimated value, and notes. You can change a lead's status directly from the dropdown in the table. When a lead is ready to become a client, click the green checkmark icon to promote them — this creates a user account, a client record, and sends them a portal invite email via Resend from noreply@dreamforgeworld.com.",
    tips: [
      "The status dropdown in each row lets you update pipeline stage instantly",
      "Promoting a lead (green ✓ icon) creates their portal login and sends credentials via email",
      "The pipeline summary at the top shows how many leads are in each stage",
      "Leads marked as Converted or Lost no longer show the promote button",
    ],
  },
  clients: {
    title: "Clients — Your Roster",
    content:
      "Clients are converted leads who have active portal accounts. Each client has a company name, email, phone, and a count of their projects. Click a client's name to view their detail page showing all their projects (with progress bars and workflow status) and invoices (with amounts and payment status). Use the 'Invite Client' button to manually create a new client without going through the lead pipeline — this creates their account and sends a portal invite email with temporary login credentials.",
    tips: [
      "Click a client's company name to see their full detail page with projects and invoices",
      "The 'Invite Client' dialog creates the user account, client record, and sends the email in one step",
      "The temporary password is shown after invite in case the email doesn't arrive",
      "Project count column shows how many projects each client has",
    ],
  },
  projects: {
    title: "Projects — SaaS Delivery Tracker",
    content:
      "Projects represent the SaaS applications you're building for clients. Each project tracks through a 7-stage workflow: Discovery & Planning → Design & Wireframing → Development → Testing & QA → Deployment & Launch → Launched → Support. Use 'New Project' to create one (select a client, set name, description, dates, and budget). The status dropdown in each row lets you change the workflow stage directly. Progress percentage auto-calculates based on the current stage.",
    tips: [
      "Click a project name to open its detail page with the interactive workflow tracker",
      "On the detail page, click workflow stage circles to advance or revert the project",
      "Each stage has its own Tasks checklist and Notes — use them to track work details",
      "Stage transitions are logged in the Timeline section on the project detail page",
      "Progress auto-calculates: Discovery 8%, Design 22%, Development 45%, Testing 68%, Deployment 85%, Launched/Support 100%",
    ],
  },
  invoices: {
    title: "Invoices — Billing & Payments",
    content:
      "Track all client invoices across your projects. The stat cards at the top show Collected (paid), Pending (sent but unpaid), Overdue, and Draft counts. Use the filter buttons to view invoices by status. Each invoice shows the description, client, project, status, amount, and due date. Invoices integrate with Stripe — clients can pay directly through their portal via Stripe Checkout. Invoice notifications are sent via Resend email.",
    tips: [
      "Filter buttons (All, Draft, Sent, Paid, Overdue) let you quickly find specific invoices",
      "The Collected stat shows total revenue from paid invoices",
      "Clients see their invoices in the portal and can click 'Pay Now' to pay via Stripe",
      "Overdue invoices are automatically highlighted in red",
    ],
  },
  settings: {
    title: "Settings — Athena & Configuration",
    content:
      "The Settings page currently houses Athena Preferences — the configuration panel for the AI assistant. You can edit Athena's system prompt to change her personality and response style, adjust the max output tokens (controls response length — 350 ≈ 2-3 sentences), set the temperature (0 = focused, 2 = creative), manage the list of free OpenRouter models she cycles through, and toggle the OpenAI fallback. Changes take effect immediately after saving.",
    tips: [
      "Edit the system prompt to customize how Athena responds to you and your clients",
      "Lower temperature (0.3-0.5) gives more consistent answers; higher (0.8-1.2) is more creative",
      "Athena cycles through free models in round-robin — if one fails, she tries the next",
      "The OpenAI fallback (GPT-4o-mini) activates only when all free models are unavailable",
      "Click 'Reset to Defaults' to restore the original Athena configuration",
    ],
  },
  portal: {
    title: "Client Portal — Your Project Hub",
    content:
      "Welcome to your DreamForge Consulting client portal. Here you can track the real-time status of all your projects with visual workflow indicators, view and pay outstanding invoices directly via Stripe, and submit support tickets for any questions or issues. The dashboard shows a summary of your active projects, pending invoices, and open tickets.",
    tips: [
      "The Projects tab shows your projects with full workflow visualization",
      "The Invoices tab lets you view all invoices and pay outstanding ones with a single click",
      "Use the Tickets tab to submit new support requests — select the project and priority level",
      "The Athena AI assistant (bottom-right) can answer questions about your projects and invoices",
    ],
  },
  projectDetail: {
    title: "Project Detail — Workflow & Stage Work",
    content:
      "The project detail page is your command center for managing a single project's lifecycle. The interactive Workflow Tracker at the top visualizes all 7 stages as connected nodes — click any adjacent stage to advance or revert the project (you can only move one stage at a time, no skipping). Below the tracker, the Stage Work Panel shows Tasks and Notes specific to the currently active stage. Tasks are a checklist you can add to, check off, edit inline, or delete. Notes are freeform text entries that autosave after a short pause — use them to capture decisions, meeting notes, or blockers. The Timeline section at the bottom shows every stage transition logged as an activity, so you always have a history of when the project moved through each phase.",
    tips: [
      "Click a workflow stage circle to transition — you can advance one step or revert one step",
      "Tasks and Notes are scoped per stage — switching stages shows that stage's work items",
      "Notes autosave after a short debounce; you can also click 'Save' manually",
      "Progress auto-calculates: Discovery 8%, Design 22%, Development 45%, Testing 68%, Deployment 85%, Launched/Support 100%",
      "The Timeline logs every stage transition with timestamps for full audit trail",
    ],
  },
  clientDetail: {
    title: "Client Detail — Overview & History",
    content:
      "The client detail page shows everything about a single client in one place. At the top you'll find the client's company name, email, phone, and address — click 'Edit' to update any of these fields inline. Below that, the Projects section lists all projects assigned to this client with their current workflow stage, progress bar, and status. Click any project name to jump to its detail page. The Invoices section shows all invoices for this client with amounts, status badges (Draft, Sent, Paid, Overdue), and due dates. Use this page to get a quick snapshot of your relationship with any client.",
    tips: [
      "Click a project row to navigate directly to the project detail page",
      "Invoice status badges are color-coded: amber for Draft, blue for Sent, green for Paid, red for Overdue",
      "Edit client details (company, email, phone, address) directly from this page",
    ],
  },
  tickets: {
    title: "Support Tickets — Client Requests",
    content:
      "The Tickets page shows all support requests submitted by clients through their portal. Each ticket has a subject, description, priority level (Low/Medium/High/Urgent), and a status that you manage: Open → In Progress → Resolved → Closed. Click any row to expand and read the full ticket description. Use the priority and status dropdowns to update tickets directly from the table. The stats cards at the top give you a quick count of open, in-progress, resolved, and high-priority tickets. Use the filter buttons to focus on specific statuses. The Archive button quickly closes a ticket without deleting it.",
    tips: [
      "Click a ticket row to expand and read the full description",
      "Change ticket status via the dropdown: Open → In Progress → Resolved → Closed",
      "Adjust priority if a client's issue is more or less urgent than they indicated",
      "Use the Archive button to quickly close resolved tickets",
      "High/Urgent count includes both HIGH and URGENT priority tickets",
    ],
  },
  backups: {
    title: "Database Backups — Automated & Versioned",
    content:
      "DreamForge automatically backs up your entire database every day at approximately 2:00 AM UTC (±59 min on Vercel Hobby) using a scheduled cron job. Each backup exports all tables — Leads, Clients, Projects, Invoices, Tickets, Activities, and more — as a single JSON file stored in Vercel Blob private storage. Backups follow a tiered promotion cycle: every daily backup is kept for 7 days; on Sundays, the latest daily is promoted to a weekly backup (kept for 4 weeks); on the 1st of each month, a monthly snapshot is created (kept for 6 months). You can also trigger a manual backup instantly using the 'Backup Now' button. To restore from a backup, download the JSON file and re-import the data using Prisma seed scripts or a database client. Total maximum storage is around 85MB across 17 backup files — well within Vercel Blob Hobby limits.",
    tips: [
      "Daily backups run at ~2:00 AM UTC — Vercel Hobby plan has ±59 minute timing variance",
      "Weekly backups are created every Sunday; monthly backups on the 1st of each month",
      "Retention: 7 daily, 4 weekly, 6 monthly — older backups are deleted automatically",
      "Use 'Backup Now' before major data operations (bulk imports, migrations, etc.)",
      "Download any backup as JSON for offline archiving or manual restore",
      "The cron secret (CRON_SECRET) is auto-injected by Vercel — the endpoint is not publicly accessible",
      "If Blob storage is exhausted on Hobby, the account locks for 30 days — monitor usage in Vercel dashboard",
    ],
  },
};
