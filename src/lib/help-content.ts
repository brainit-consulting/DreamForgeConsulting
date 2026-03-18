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
      "Leads are potential clients you're tracking through your sales pipeline. Each lead has a status that progresses through: New → Contacted → Qualified → Proposal → Converted (or Lost). Use the 'Add Lead' button to create a new lead — only the name is required, email and other fields can be added later. You can change a lead's status directly from the dropdown in the table. When a lead is ready to become a client, click the green checkmark icon to promote them — this creates a client record. You can then send a portal invite from the Clients page when you're ready to give them access.",
    tips: [
      "Use the search bar to filter leads by name, email, company, or source",
      "Click the pencil icon to edit a lead's details (name, email, company, phone, website, address, source, value, notes)",
      "The status dropdown in each row lets you update pipeline stage instantly",
      "Promoting a lead (green ✓ icon) converts them to a client — portal invite is sent separately from Clients",
      "The pipeline summary at the top shows how many leads are in each stage",
      "Leads marked as Converted or Lost no longer show the promote button",
    ],
  },
  clients: {
    title: "Clients — Your Roster",
    content:
      "Clients are businesses you work with. They can be added directly or promoted from leads. Each client has a company name, email, phone, website, and a count of their projects. The Portal column shows whether a client has portal access (green shield). Click a client's name to view their detail page with projects and invoices. Use 'Add Client' to create a new client record — portal access is granted separately by clicking the mail icon (Send Invite) when you're ready.",
    tips: [
      "Use the search bar to filter clients by company name, email, or phone",
      "Click a client's company name to see their full detail page with projects and invoices",
      "The shield icon in the Portal column means the client has portal login access",
      "Click the mail icon to send a portal invite — this creates their login and emails credentials",
      "Click the pencil icon to edit client details (company, email, phone, website, address)",
      "Email is optional when adding a client, but required before sending a portal invite",
    ],
  },
  projects: {
    title: "Projects — SaaS Delivery Tracker",
    content:
      "Projects represent the SaaS applications you're building for clients. Each project tracks through a 9-stage workflow: Discovery & Planning → Design & Wireframing → Proposal → Client Approval → Development → Testing & QA → Deployment & Launch → Launched → Support. Use 'New Project' to create one (select a client, set name, description, dates, and budget). The status dropdown in each row lets you change the workflow stage directly. Progress percentage auto-calculates based on the current stage.",
    tips: [
      "Use the search bar to filter projects by name or client company",
      "Click a project name to open its detail page with the interactive workflow tracker",
      "On the detail page, click workflow stage circles to advance or revert the project",
      "Each stage has its own Tasks checklist and Notes — use them to track work details",
      "Stage transitions are logged in the Timeline section on the project detail page",
      "Progress auto-calculates across all 9 stages from Discovery (5%) to Launched/Support (100%)",
    ],
  },
  invoices: {
    title: "Invoices — Billing & Payments",
    content:
      "Track all client invoices across your projects. The stat cards at the top show Collected (paid), Pending (sent but unpaid), Overdue, and Draft counts. Use the filter buttons to view invoices by status. Each invoice shows the description, client, project, status, amount, and due date. Invoices integrate with Stripe — clients pay through their portal via Stripe Checkout, and the invoice is automatically marked as PAID via webhook when the payment completes. Invoice notifications are sent via Resend email.",
    tips: [
      "Filter buttons (All, Draft, Sent, Paid, Overdue) let you quickly find specific invoices",
      "The Collected stat shows total revenue from paid invoices",
      "Clients see their invoices in the portal and can click 'Pay Now' to pay via Stripe",
      "After Stripe payment completes, the invoice status updates to PAID automatically via webhook",
      "Overdue invoices are automatically highlighted in red",
    ],
  },
  settings: {
    title: "Settings — Athena & Configuration",
    content:
      "The Settings page has two sections: Athena Preferences and Backups & Cron. In Athena Preferences, you can edit the AI assistant's system prompt, adjust max output tokens (controls response length — 350 ≈ 2-3 sentences), set the temperature (0 = focused, 2 = creative), manage the list of free OpenRouter models she cycles through, and toggle the OpenAI fallback. The Backups section shows your automated daily database backups with stats, a manual trigger, and downloadable backup files. Changes take effect immediately after saving.",
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
      "Welcome to your DreamForge Consulting client portal. Here you can track the real-time status of all your projects with visual workflow indicators, view and pay outstanding invoices directly via Stripe, and submit support tickets for any questions or issues. The dashboard shows a summary of your active projects, pending invoices, and open tickets. Payments are processed securely through Stripe and your invoice status updates automatically.",
    tips: [
      "The Projects tab shows your projects with full workflow visualization — when a project is awaiting your approval, you'll see a 'Review & Approve' button",
      "The Invoices tab lets you view all invoices and pay outstanding ones with a single click",
      "After paying via Stripe, the invoice automatically updates to PAID — no manual steps needed",
      "Use the Tickets tab to submit new support requests — select the project and priority level",
      "If you forget your password, use the 'Forgot your password?' link on the login page",
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
      "Progress auto-calculates across all 9 stages from Discovery (5%) to Launched/Support (100%)",
      "The Timeline logs every stage transition with timestamps for full audit trail",
    ],
  },
  clientDetail: {
    title: "Client Detail — Overview & History",
    content:
      "The client detail page shows everything about a single client in one place. The portal status badge shows whether the client has portal access — click 'Send Invite' to grant access, or it shows 'Portal Active' if already invited. Click 'Edit' to update company name, email, phone, website, or address. Below that, the Projects section lists all projects with workflow stage, progress bar, and status. The Invoices section shows all invoices with amounts, status badges, and due dates.",
    tips: [
      "Click a project row to navigate directly to the project detail page",
      "Invoice status badges are color-coded: amber for Draft, blue for Sent, green for Paid, red for Overdue",
      "Click 'Send Invite' to create portal login and email credentials to the client",
      "Click 'Edit' to update company name, email, phone, website, or address",
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
  emailPreferences: {
    title: "Email Preferences — Logo & Branding",
    content:
      "Configure the logo and company name used in all outgoing emails — outreach, invoices, client invites, and password resets. The Company Name appears in the 'From' field and email headers. The Logo URL points to an image displayed at the top of every email. Use a path like /DreamForgeConsultingLogo.png for images in your public folder, or a full https:// URL for externally hosted logos.",
    tips: [
      "The logo preview shows how it will look — if it's blank, the URL may be incorrect",
      "Changes apply immediately to all future emails after saving",
      "Use 'Reset to Defaults' to restore the original DreamForge branding",
      "The email 'from' address (noreply@dreamforgeworld.com) is fixed by your Resend domain",
    ],
  },
  outreach: {
    title: "Outreach — Lead Email Campaigns",
    content:
      "The Outreach page lets you compose short emails and send them to selected leads. Click 'New Outreach' to compose a message — write a subject and body, then pick leads from a searchable list (only leads with email addresses appear). This creates one draft per selected lead. Each draft appears in the table where you can review it, then manually send it with a confirmation dialog. Sent emails use the DreamForge branded template and are delivered via Resend.",
    tips: [
      "Only leads with email addresses appear in the lead picker",
      "Each draft is sent individually — you confirm before every send",
      "Failed emails can be retried with the send button",
      "Use the filter buttons to quickly find drafts, sent, or failed emails",
      "The message body is plain text — it's automatically wrapped in the branded email template",
    ],
  },
  backups: {
    title: "Database Backups — Automated & Versioned",
    content:
      "DreamForge automatically backs up your entire database every day at approximately 2:00 AM UTC (±59 min on Vercel Hobby) using a scheduled cron job. Each backup exports all tables — Leads, Clients, Projects, Invoices, Tickets, Activities, and more — as a single JSON file stored in Vercel Blob private storage. Backups follow a tiered promotion cycle: every daily backup is kept for 7 days; on Sundays, the latest daily is promoted to a weekly backup (kept for 4 weeks); on the 1st of each month, a monthly snapshot is created (kept for 6 months). You can also trigger a manual backup instantly using the 'Backup Now' button. To restore from any backup, click the restore icon next to it — this replaces all current data with the backup snapshot (a safety backup is created first, and your admin account is always preserved). Total maximum storage is around 85MB across 17 backup files — well within Vercel Blob Hobby limits.",
    tips: [
      "Daily backups run at ~2:00 AM UTC — Vercel Hobby plan has ±59 minute timing variance",
      "Weekly backups are created every Sunday; monthly backups on the 1st of each month",
      "Retention: 7 daily, 4 weekly, 6 monthly — older backups are deleted automatically",
      "Use 'Backup Now' before major data operations (bulk imports, migrations, etc.)",
      "Click the restore icon (cloud arrow) on any backup to replace all current data with that snapshot",
      "Restoring creates a safety backup first — your admin account is always preserved",
      "Download any backup as JSON for offline archiving",
      "The cron secret (CRON_SECRET) is auto-injected by Vercel — the endpoint is not publicly accessible",
      "If Blob storage is exhausted on Hobby, the account locks for 30 days — monitor usage in Vercel dashboard",
    ],
  },
};
