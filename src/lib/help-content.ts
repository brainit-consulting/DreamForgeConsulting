export interface HelpSection {
  title: string;
  content: string;
  tips?: string[];
}

export const helpContent: Record<string, HelpSection> = {
  dashboard: {
    title: "Dashboard — Command Center",
    content:
      "The Dashboard gives you a real-time snapshot of your entire consulting business. The four KPI cards at the top show Total Revenue (sum of all paid invoices), Active Projects (currently in progress), New Leads (in your pipeline), and Active Clients. The Revenue Overview chart displays monthly income over the past 6 months. The Email Activity chart shows outreach, invoice, and invite emails sent over the last 30 days. The Recent Activity feed logs every significant action. The Active Projects section shows each project's current workflow stage and progress percentage.",
    tips: [
      "KPI data updates automatically as you add leads, clients, projects, and invoices",
      "The Email Activity chart tracks outreach (amber), invoice (blue), and invite (emerald) emails with 30-day totals",
      "The activity feed shows stage transitions, client approvals, lead promotions, and invoice payments",
      "Revenue chart reflects paid invoice amounts grouped by month",
    ],
  },
  leads: {
    title: "Leads — Sales Pipeline",
    content:
      "Leads are potential clients you're tracking through your sales pipeline. Each lead has a status: New → Contacted → Qualified → Proposal → Converted (or Lost). Use 'Add Lead' to create one — only the name is required, email and other fields can be added later. Change status directly from the dropdown. When ready, click the green checkmark to promote a lead to a client record. Portal access is granted separately from the Clients page.",
    tips: [
      "Use the search bar to filter leads by name, email, company, or source",
      "Click the pencil icon to edit any lead detail (name, email, company, phone, website, address, source, value, notes)",
      "The status dropdown updates pipeline stage instantly with a toast confirmation",
      "Promoting a lead (green ✓) creates a client record — portal invite is a separate step from Clients",
      "The pipeline summary at the top shows how many leads are in each stage",
      "Leads marked as Converted or Lost no longer show the promote button",
    ],
  },
  clients: {
    title: "Clients — Your Roster",
    content:
      "Clients are businesses you work with. They can be added directly via 'Add Client' or promoted from leads. Each client has a company name, email, phone, website, and project count. The Portal column shows whether a client has portal login access (green shield icon). Portal access is granted separately — click the mail icon (Send Invite) on any client without portal access to create their login and email credentials.",
    tips: [
      "Use the search bar to filter clients by company name, email, or phone",
      "Click a client's company name to see their full detail page with projects and invoices",
      "Green shield icon in Portal column = client has portal access; dash = no access yet",
      "Mail icon sends a portal invite — creates login and emails temporary credentials",
      "Pencil icon edits client details (company, email, phone, website, address)",
      "Email is optional when adding a client, but required before sending a portal invite",
    ],
  },
  projects: {
    title: "Projects — SaaS Delivery Tracker",
    content:
      "Projects track the SaaS applications you're building for clients through a 9-stage workflow: Discovery → Design → Proposal → Client Approval → Development → Testing → Deployment → Launched → Support. Development uses a 40/30/30 payment structure (start, mid, completion). After launch, an optional support retainer can be enabled for ongoing maintenance with auto-generated monthly invoices.",
    tips: [
      "Use the search bar to filter projects by name or client company",
      "Click a project name to open its detail page with the interactive workflow tracker",
      "The status dropdown lets you change workflow stage directly from the table",
      "After Design, move to Proposal to prepare scope/pricing, then Client Approval for sign-off",
      "When a project reaches Client Approval, the client can approve from their portal (email notification is configurable in Email Preferences)",
      "Progress auto-calculates across all 9 stages: Discovery 5%, Design 15%, Proposal 22%, Approval 30%, Development 50%, Testing 70%, Deployment 85%, Launched/Support 100%",
    ],
  },
  invoices: {
    title: "Invoices — Billing & Payments",
    content:
      "Track all client invoices across your projects. There are two types of invoices: project development invoices (created manually with a 40/30/30 payment structure) and support retainer invoices (auto-generated as DRAFT on the 1st of each month for active support plans). Stat cards show Collected, Pending, Overdue, and Draft counts. Invoices integrate with Stripe — clients pay through their portal, and status updates to PAID automatically via webhook.",
    tips: [
      "Project invoices use a 40/30/30 payment structure: 40% start, 30% mid-development, 30% completion",
      "Support invoices are auto-generated as DRAFT on the 1st — review and send manually",
      "Filter buttons (All, Draft, Sent, Paid, Overdue) let you quickly find specific invoices",
      "Send icon emails the invoice to the client with a branded template",
      "Clients click 'Pay Now' in their portal to pay via Stripe Checkout",
      "After Stripe payment, invoice status updates to PAID automatically via webhook",
      "Mark as Paid (credit card icon) for offline payments",
      "Overdue invoices are highlighted in red",
    ],
  },
  settings: {
    title: "Settings — Configuration Hub",
    content:
      "The Settings page has four collapsible sections: Athena Preferences (AI assistant), Email Preferences (branding for all outgoing emails), Backups & Cron (automated database backups), and Support Plan Defaults (post-launch retainer rates). Click any section header to expand or collapse it. All changes persist to the database and survive deploys.",
    tips: [
      "Click a section header to expand/collapse — the chevron indicates open/closed state",
      "Athena: edit system prompt, temperature, max tokens, model list, and OpenAI fallback",
      "Email: set logo (with size slider), company name, sign-off, tagline, greeting toggles, and approval email toggle",
      "Backups: view snapshots, trigger manual backup, restore, and configure retention policy",
      "Support: set default monthly rate, included hours, overage rate, and annual free months",
      "All settings persist to the database — they survive Vercel deploys and cold starts",
      "Click 'Reset to Defaults' in any section to restore original configuration",
    ],
  },
  portal: {
    title: "Client Portal — Your Project Hub",
    content:
      "Welcome to your client portal. Track the real-time status of all your projects with visual workflow indicators, view and pay outstanding invoices via Stripe (including project and support invoices), and submit support tickets. When a project reaches Client Approval, click 'Review & Approve' to approve scope and begin development. Payments are processed securely through Stripe and invoice status updates automatically.",
    tips: [
      "Projects tab shows your projects with full 9-stage workflow visualization",
      "When a project is awaiting your approval, you'll see a 'Review & Approve' button with an amber banner",
      "Invoices tab lets you view all invoices and pay outstanding ones via Stripe with a single click",
      "After paying via Stripe, the invoice automatically updates to PAID — no manual steps needed",
      "Tickets tab lets you submit new support requests — select the project and priority level",
      "If you forget your password, use the 'Forgot your password?' link on the login page",
      "The Athena AI assistant (bottom-right) can answer questions about your projects and invoices",
    ],
  },
  projectDetail: {
    title: "Project Detail — Workflow & Stage Work",
    content:
      "The project detail page is your command center for managing a project's lifecycle through all 9 stages. The interactive Workflow Tracker at the top lets you advance or revert one stage at a time. Below the tracker, the Stage Work Panel shows Tasks and Notes for the current stage. The Proposal Document card appears from the Proposal stage onward. The Timeline logs every transition for a full audit trail.",
    tips: [
      "Click a workflow stage circle to advance one step or revert to any earlier step",
      "Tasks and Notes are scoped per stage — switching stages shows that stage's work items",
      "Notes autosave after a short debounce; you can also click 'Save' manually",
      "The Proposal Document shows from Proposal stage onward — editable at Proposal + Approval, read-only after",
      "The Timeline logs every stage transition and client approval with timestamps",
      "Click the ? icon on the Project Workflow card for a detailed guide on each stage",
    ],
  },
  projectWorkflow: {
    title: "Project Workflow — Complete Guide",
    content:
      "Your project moves through 9 stages. Each stage has its own Tasks checklist and Notes. Click workflow circles to advance (one step forward) or revert (any earlier step). Here's how each stage works:",
    tips: [
      "STAGE 1 — Discovery & Planning: Add tasks for requirements gathering, stakeholder interviews, and technical audits. Add notes documenting findings, pain points, and decisions. Complete tasks as you go.",
      "STAGE 2 — Design & Wireframing: Add tasks for wireframes, mockups, and architecture. Add notes for design decisions and client feedback. All Discovery + Design data feeds into the proposal.",
      "STAGE 3 — Proposal: Click 'Copy Prompt' to generate an AI prompt from Discovery + Design data → paste into Claude/ChatGPT → paste the result into Stage Work > Notes. Or click 'Generate via Athena' to do it in-app (click 'Save as Note'). The Proposal Document card appears showing your proposal — edit it freely. Click the green 'Submit for Approval' button when ready.",
      "STAGE 4 — Client Approval: Proposal Document is still editable for last-minute tweaks. Preview the approval email, then click 'Send Notification' to email the client (or enable auto-send in Settings > Email Preferences). Client clicks 'Review & Approve' in their portal to advance to Development. Admin can also advance manually.",
      "STAGE 5 — Development: Build the project. Proposal Document becomes read-only for reference. Add development tasks and notes.",
      "STAGE 6 — Testing & QA: Quality assurance and bug fixing. Track test cases as tasks.",
      "STAGE 7 — Deployment & Launch: Deploy to production. Track deployment tasks and launch checklist.",
      "STAGE 8 — Launched: Project is live. Progress shows 100%. Support Plan card appears — enable a monthly or annual retainer.",
      "STAGE 9 — Post-Launch Support: Ongoing maintenance and support. Support Plan shows hours used, overage, and billing cycle. DRAFT invoices auto-generated on the 1st of each month. Proposal Document remains visible as reference.",
      "Progress auto-calculates: Discovery 5%, Design 15%, Proposal 22%, Approval 30%, Development 50%, Testing 70%, Deployment 85%, Launched/Support 100%",
    ],
  },
  clientDetail: {
    title: "Client Detail — Overview & History",
    content:
      "Everything about a single client in one place. The portal status badge shows whether the client has portal access — 'Send Invite' grants access, 'Portal Active' shows they're already set up. Click 'Edit' to update company name, email, phone, website, or address. Below that: Projects with workflow stage, progress bar, and status; and Invoices with amounts, status badges, and due dates.",
    tips: [
      "Click a project row to navigate directly to the project detail page",
      "Invoice status badges: amber = Draft, blue = Sent, green = Paid, red = Overdue",
      "Click 'Send Invite' to create portal login and email credentials to the client",
      "Click 'Edit' to update company name, email, phone, website, or address",
    ],
  },
  tickets: {
    title: "Support Tickets — Client Requests",
    content:
      "All support requests submitted by clients through their portal. Each ticket has a subject, description, priority (Low/Medium/High/Urgent), and a status you manage: Open → In Progress → Resolved → Closed. Click any row to expand and read the full description. Use the priority and status dropdowns to update tickets directly. Stats cards show open, in-progress, resolved, and high-priority counts.",
    tips: [
      "Click a ticket row to expand and read the full description",
      "Change ticket status via the dropdown: Open → In Progress → Resolved → Closed",
      "Adjust priority if a client's issue is more or less urgent than indicated",
      "Use the Archive button to quickly close resolved tickets",
      "High/Urgent count includes both HIGH and URGENT priority tickets",
    ],
  },
  emailPreferences: {
    title: "Email Preferences — Branding & Automation",
    content:
      "Configure branding and behavior for all outgoing emails — outreach, invoices, client invites, password resets, and approval requests. Company Name sets the 'From' display name and email headers. Logo URL points to the image in email headers (use the size slider to adjust). Sign-Off sets the closing lines in outreach emails. Tagline appears in every email footer. The greeting toggles control whether outreach emails include the lead's name and/or company. The 'Auto-send approval email' toggle controls whether clients are automatically notified when a project reaches the Client Approval stage. All emails are rate-limited to stay under Resend's 5 requests/second limit.",
    tips: [
      "The logo preview updates live as you adjust the URL and size slider (30–300px)",
      "Sign-Off supports multiple lines — first line is the greeting, rest are bold (e.g., 'Kind Regards,\\nEmile du Toit')",
      "Tagline appears after the company name in the footer of every email",
      "'Use lead name' and 'Use company name' toggles control the outreach greeting (e.g., 'Hi Sarah at TechFlow' vs 'Hi there')",
      "Toggle 'Auto-send approval email' off if you prefer to manually notify clients about project approvals",
      "All email settings persist to the database — they survive deploys",
      "Click 'Reset to Defaults' to restore original DreamForge branding",
      "The 'from' email address (noreply@dreamforgeworld.com) is fixed by your Resend domain",
    ],
  },
  outreach: {
    title: "Outreach — Lead Email Campaigns",
    content:
      "Compose and send branded outreach emails to leads. Click 'New Outreach' to write a subject and body — you can optionally pick leads with email addresses, or save as a template draft with no recipients. Template drafts appear with 'no recipient' and can have leads assigned later via the mail icon. Each draft is sent individually with a confirmation dialog. Use the eye icon to preview the branded HTML email before sending.",
    tips: [
      "Save a draft with no leads selected to create a reusable email template",
      "Mail icon on template rows opens the lead picker to assign recipients",
      "Eye icon previews the full branded email with logo, header, and footer",
      "Pencil icon edits the subject and body of any draft",
      "Copy icon clones any email as a new template draft",
      "Send icon (green) on draft rows sends with confirmation; blue send on sent rows re-sends",
      "Failed emails show an amber retry button",
      "Only leads with email addresses appear in the lead picker",
      "The message body is plain text — automatically wrapped in the branded template with your logo, sign-off, and footer",
    ],
  },
  backups: {
    title: "Database Backups — Automated & Versioned",
    content:
      "Automated daily database backups stored in Vercel Blob. The daily cron runs at ~2:00 AM UTC (±59 min on Hobby). Each backup exports all tables as a JSON file. Backups follow a tiered promotion: daily, weekly (Sundays), and monthly (1st). Retention is configurable — set how many days, weeks, and months to keep in the Retention Policy section. Use 'Backup Now' for a manual snapshot. Restore from any backup by clicking the cloud icon — a safety backup is created first, and your admin account is always preserved.",
    tips: [
      "Daily backups run at ~2:00 AM UTC — Vercel Hobby plan has ±59 minute timing variance",
      "Weekly backups created every Sunday; monthly on the 1st of each month",
      "Retention is configurable: set daily (days), weekly (weeks), and monthly (months) counts and click 'Save Retention'",
      "Use 'Backup Now' before major data operations (bulk imports, migrations, etc.)",
      "Cloud icon restores from that backup — confirm dialog warns this replaces all data",
      "Restoring creates a safety backup first — your admin account is always preserved",
      "Download icon saves backup JSON for offline archiving",
      "CRON_SECRET is auto-injected by Vercel — the cron endpoint is not publicly accessible",
    ],
  },
};
