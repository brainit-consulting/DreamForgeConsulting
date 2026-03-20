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
      "Leads are potential clients you're tracking through your sales pipeline. Each lead has a status: New → Contacted → Qualified → Proposal → Converted (or Lost). Use 'Add Lead' to create one — only the name is required, email and other fields can be added later. Change status directly from the dropdown. When ready, click the green person-check icon to promote a lead to a client record. Portal access is granted separately from the Clients page.",
    tips: [
      "Use the search bar to filter leads by name, email, company, or sector",
      "Use the sector dropdown filter (top-right) to view leads by industry (e.g., Veterinary, Elder Care, Boutique Fitness)",
      "Click the pencil icon to edit any lead detail (name, email, company, phone, website, address, sector, source, value, notes)",
      "The status dropdown updates pipeline stage instantly with a toast confirmation",
      "Promoting a lead (green person-check icon) creates a client record — portal invite is a separate step from Clients",
      "The subtitle shows total lead count, how many are New, and how many are Qualified",
      "Leads marked as Converted or Lost no longer show the promote button",
      "The Card checkbox (first column) tracks whether you've sent a handwritten postcard to this lead — check it to mark as sent",
    ],
  },
  clients: {
    title: "Clients — Your Roster",
    content:
      "Clients are businesses you work with. They can be added directly via 'Add Client' or promoted from leads. Each client has a company name, email, phone, and project count. The Portal column shows whether a client has portal login access (green shield icon). Portal access is granted separately — click the mail icon (Send Invite) on any client without portal access to create their login and email credentials. After sending, a dialog shows the login email and temp password — keep it on screen until you're done.",
    tips: [
      "Use the search bar to filter clients by company name, email, or phone",
      "Click a client's company name to see their full detail page with projects and invoices",
      "Green shield icon in Portal column = client has portal access; dash = no access yet",
      "Mail icon (blue) sends a portal invite — creates login and emails temporary credentials; a dialog shows the credentials on screen",
      "Refresh icon (circular arrow) on clients with portal access resends the invite with a new temp password — old password stops working immediately",
      "Pencil icon edits client details (company, contact name, email, phone, website, address, sector, notes)",
      "Trash icon permanently deletes the client and all their projects, invoices, and tickets",
      "Email is optional when adding a client, but required before sending a portal invite",
      "The Card checkbox (first column) tracks whether you've sent a handwritten postcard to this client — check it to mark as sent",
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
      "Projects tab shows your projects with full 9-stage workflow visualization — launched projects with a support plan show your hours used this month",
      "When a project is awaiting your approval, you'll see a 'Review & Approve' button with an amber banner",
      "Invoices tab lets you view all invoices and pay outstanding ones via Stripe with a single click",
      "After paying via Stripe, the invoice automatically updates to PAID — no manual steps needed",
      "Tickets tab lets you submit new support requests — select the project and priority level",
      "Request a Project lets you submit a new project idea with name, description, budget range, timeline, and additional details — we'll review it and get back to you with a proposal",
      "Book a Call — use the 'Book a Call' link in the sidebar or on the Request a Project page to schedule a free 30-minute discovery call",
      "Your Ownership & Licensing terms are on the Projects page — expand the 'Ownership & Licensing Terms' section on any active project to review the full agreement including IP ownership, your use license, and buyout options",
      "Change your password anytime from Settings in the sidebar — enter your current (or temp) password and choose a new one",
      "If you forget your password, use the 'Forgot your password?' link on the login page to get a reset email",
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
      "STAGE 9 — Post-Launch Support: Ongoing maintenance. Use 'Log Hours' to record work (hours + description — creates a task entry and updates the plan). Support Plan shows hours used, overage, and billing cycle. DRAFT invoices auto-generated on the 1st. Proposal Document remains visible.",
      "Progress auto-calculates: Discovery 5%, Design 15%, Proposal 22%, Approval 30%, Development 50%, Testing 70%, Deployment 85%, Launched/Support 100%",
    ],
  },
  clientDetail: {
    title: "Client Detail — Overview & History",
    content:
      "Everything about a single client in one place. The portal status badge shows whether the client has portal access — 'Send Invite' grants access, 'Portal Active' shows they're already set up. Click 'Edit' to update company name, contact name, email, phone, website, address, sector, and notes. Below that: Projects with workflow stage, progress bar, and status; and Invoices with amounts, status badges, and due dates.",
    tips: [
      "Click a project row to navigate directly to the project detail page",
      "Invoice status badges: amber = Draft, blue = Sent, green = Paid, red = Overdue",
      "Click 'Send Invite' to create portal login and email credentials to the client",
      "Click 'Edit' to update company, contact name, email, phone, website, address, sector, and notes",
    ],
  },
  tickets: {
    title: "Support Tickets — Client Requests",
    content:
      "All support requests submitted by clients through their portal. Each ticket has a subject, description, priority (Low/Medium/High/Urgent), and a status you manage: Open → In Progress → Resolved → Closed. Click any row to expand and read the full description. Use the priority and status dropdowns to update tickets directly. Stats cards show open, in-progress, resolved, and high-priority counts.",
    tips: [
      "Use the search bar to filter tickets by subject, client name, email, or project",
      "Use the status filter tabs (All / Open / In Progress / Resolved / Closed) to narrow the list",
      "Click a ticket row to expand and read the full description",
      "Change ticket status via the dropdown: Open → In Progress → Resolved → Closed",
      "Adjust priority if a client's issue is more or less urgent than indicated",
      "Use the Archive button (close icon) to quickly close any open ticket without going through each status",
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
  adminGuide: {
    title: "Admin Guide — Internal Operations",
    content:
      "This is your internal reference for how to handle key business operations in DreamForge Consulting. Not visible to clients.",
    tips: [
      "HOW TO ADD A LEAD: Go to Leads → '+ Add Lead' → only name is required, all other fields (email, company, phone, website, address, sector, source, value, notes) are optional. Lead starts as NEW status.",
      "HOW TO WORK A LEAD: Use the status dropdown to move through the pipeline: New → Contacted → Qualified → Proposal → Converted (or Lost). Search bar filters by name, email, company, or sector. Sector dropdown filters by industry. The Card checkbox tracks if you've sent a handwritten postcard.",
      "HOW TO PROMOTE A LEAD: Click the green person-check icon on any lead that isn't Converted or Lost. Confirm dialog explains a client record will be created. All fields are copied including sector, notes, and card status. Portal invite is a separate step from the Clients page. Lead status auto-sets to CONVERTED.",
      "HOW TO ONBOARD A CLIENT: After promoting a lead (or adding directly via '+ Add Client'), go to Clients → click the blue mail icon to Send Portal Invite. This creates a portal account and emails the client their login email + temp password. A persistent dialog shows the credentials on screen — save these in case the email doesn't arrive.",
      "HOW TO RESEND AN INVITE: On the Clients page, clients with portal access show a green shield icon. Click the refresh icon (circular arrow) next to them → confirms → generates a new temp password, emails it, and shows credentials. The old password stops working immediately. This doubles as an admin password reset.",
      "HOW TO MANAGE CLIENTS: Pencil icon edits company, contact name, email, phone, website, address, sector, and notes. Trash icon deletes client and all their projects, invoices, and tickets (confirm dialog warns). Click the company name to open the client detail page with projects and invoices. The Card checkbox tracks postcards sent.",
      "HOW TO START A PROJECT: Go to Projects → '+ Add Project' → select client, set name/description/budget/dates → project starts at Discovery stage (5% progress). Add tasks and notes at each stage as you work through the 9-stage workflow.",
      "HOW TO USE THE WORKFLOW TRACKER: On project detail, click the next stage circle to advance one step, or click any earlier stage to revert. Each transition is logged in the Timeline. Progress auto-calculates: Discovery 5%, Design 15%, Proposal 22%, Approval 30%, Development 50%, Testing 70%, Deployment 85%, Launched/Support 100%.",
      "HOW TO GENERATE A PROPOSAL: At Proposal stage, an amber banner appears with two options. 'Copy Prompt' copies an AI prompt built from Discovery + Design data to your clipboard — paste into Claude or ChatGPT. 'Generate via Athena' does it in-app with streaming — click 'Save as Note' when done. Edit freely in the Proposal Document card.",
      "HOW TO SUBMIT FOR APPROVAL: On the Proposal Document card, click the green 'Submit for Approval' button. Confirm dialog warns the proposal becomes read-only. Project moves to Client Approval stage. The proposal is still editable at Approval for last-minute tweaks, then read-only from Development onward.",
      "HOW TO SEND FOR CLIENT APPROVAL: At Client Approval stage, if auto-send is ON (Settings > Email Preferences), the client gets an email automatically. If OFF, an amber banner shows 'Preview' (eye icon) to review the HTML email, and 'Send Notification' to email the client manually.",
      "HOW TO HANDLE CLIENT APPROVAL: Client clicks 'Review & Approve' in their portal → project moves to Development automatically. Or you can advance manually via the workflow tracker circles.",
      "HOW TO CREATE AN INVOICE: Go to Invoices → '+ Create Invoice' → select client + project + amount + due date → creates as DRAFT. Stat cards show Collected, Pending, Overdue, and Draft totals. Filter tabs: All, Draft, Sent, Paid, Overdue.",
      "HOW TO SEND AN INVOICE: Click the blue mail icon on any DRAFT invoice → sends branded email to client with amount, due date, and 'View & Pay Invoice' button. Invoice status changes to SENT. Payment structure: 40% at start, 30% mid-development, 30% at completion.",
      "HOW TO HANDLE A PAYMENT: Client clicks 'Pay Now' in their portal → Stripe Checkout → payment completes → invoice auto-marked PAID via webhook. You don't need to do anything. The credit card icon can manually mark as PAID for offline payments.",
      "HOW TO ISSUE A REFUND: Click the amber undo icon on a PAID invoice, or go to dashboard.stripe.com → Payments → find the payment → click 'Refund' (full or partial). Our system automatically marks the invoice as REFUNDED via webhook + logs activity. Client sees REFUNDED status in portal. Money returns to their card in 2-10 business days.",
      "HOW TO HANDLE A DISPUTE: If a client disputes a charge via their bank, Stripe notifies us automatically. A warning activity is logged with the dispute reason. Go to Stripe Dashboard → Disputes to respond with evidence.",
      "HOW TO SET UP SUPPORT PLAN: When project reaches Launched or Support → click 'Enable Support Plan' on project detail → choose plan type from dropdown (Monthly/Annual/None). Rates, included hours, and overage rate come from Settings > Support Plan Defaults. Plan card shows hours used this month, overage calculation, and billing cycle info. DRAFT invoices auto-generate on the 1st of each month.",
      "HOW TO LOG SUPPORT HOURS: On project detail at Launched or Support stage, with a support plan enabled → click 'Log Hours' (clock icon) → enter hours (min 0.25, step 0.25) + description. Creates a task entry at the SUPPORT stage + updates hoursUsed on the plan. Overage is calculated automatically: (hoursUsed - includedHours) × overageRate.",
      "HOW TO COMPOSE OUTREACH: Go to Outreach → '+ New Outreach' → write subject + body → optionally select leads with email addresses (checkboxes with search). Save with no leads selected to create a reusable template. Each lead gets its own draft. Stat cards show Total, Drafts, Sent, Failed counts.",
      "HOW TO BULK SEND FROM LEADS: Go to Leads → filter by sector or search → check the leads you want (leads without email are greyed out). A floating bar appears at the bottom: '[N] leads selected [Clear] [Continue]'. Click Continue → a dialog shows your selected leads (you can remove any with the X button) + a template picker. Select a template → click 'Send to N leads' → confirm → emails are sent sequentially with rate limiting. Toast shows sent/skipped/failed counts. This is the leads-first workflow — use it when you're already working the leads table.",
      "HOW TO MANAGE OUTREACH: Eye icon previews the branded HTML email. Pencil icon edits subject + body. Copy icon clones as a new template draft. Mail icon (blue) assigns leads to a template. Green send icon sends with confirmation. Blue send resends a sent email. Amber send retries a failed email. Filter tabs: All, Draft, Sent, Failed.",
      "HOW TO USE SECTORS: Sector tags (e.g., 'Veterinary / Pet Care', 'Marine Services', 'Independent Insurance') help you organize leads and clients by industry. Set sector when adding or editing a lead/client. Use the sector dropdown filter on the Leads table to view one industry at a time. Sector is copied automatically when promoting a lead to a client. The /research-leads skill auto-assigns sectors during import.",
      "HOW TO MANAGE TICKETS: Tickets are created by clients through their portal — there's no admin create button. Search by subject, client, project. Filter by: All, Open, In Progress, Resolved, Closed. Click any row to expand and read the full description. Use the priority dropdown (Low/Medium/High/Urgent) and status dropdown to update directly. Archive icon (close) sets any non-closed ticket to CLOSED. Trash icon deletes permanently.",
      "HOW TO CONFIGURE SETTINGS: Settings has 4 collapsible sections — click headers to expand. Athena: system prompt, temperature, max tokens, model list, OpenAI fallback toggle. Email: logo (with size slider), company name, sign-off, tagline, booking URL (for outreach CTA button), greeting toggles, auto-approval email toggle. Backups: manual backup, restore, retention policy (daily/weekly/monthly counts), backup list with download/restore. Support Plan Defaults: monthly rate, included hours, overage rate, annual free months.",
      "HOW TO BACK UP / RESTORE: Settings > Backups → 'Backup Now' for manual backup. Backups run daily at ~2:00 AM UTC via cron. Three tiers: daily, weekly (Sundays), monthly (1st). Click cloud icon on any backup to restore (safety backup created first, admin account preserved). Download icon saves JSON for offline archiving. Retention is configurable per tier.",
      "HOW TO RESET A PASSWORD (SELF-SERVICE): Client uses 'Forgot your password?' on login page → gets reset email → sets new password. Or they can change it from Settings in their portal sidebar. No admin action needed.",
      "HOW TO RESET A PASSWORD (ADMIN): On Clients page → find the client with portal access (green shield) → click the refresh icon (Resend Invite) → confirms → generates new temp password, emails it, and shows credentials on screen. Old password stops working immediately.",
      "BILLING DEFAULTS: Monthly support rates, included hours, overage rate, and annual free months are all configurable in Settings > Support Plan Defaults. Email branding in Settings > Email Preferences. All settings persist to the database across deploys and cold starts.",
      "OWNERSHIP & LICENSING: DreamForge retains full ownership of all source code, architecture, and IP. Clients receive a perpetual, non-exclusive use license maintained through an active support retainer. If the retainer lapses beyond 60 days, we reserve the right to suspend/disable the software. Clients may NOT resell, redistribute, reverse-engineer, or clone the product. Clients may submit a written buyout offer at any time. Custom assets (logos, content) remain client property.",
      "LICENSING FLOW — Proposal: Admin generates proposal via Copy Prompt or Athena | Proposal includes Ownership & Licensing section automatically",
      "LICENSING FLOW — Submit for Approval: Admin clicks Submit for Approval | Project moves to Approval stage",
      "LICENSING FLOW — Approval Email: Client receives notification email | Footer states: by approving you agree to the Ownership & Licensing terms",
      "LICENSING FLOW — Client Approves: Client clicks Review & Approve in portal | Confirm dialog references licensing terms explicitly",
      "LICENSING FLOW — Admin View: Admin views project detail from Development onward | Agreements & Licensing card shows approval date + terms + license status",
      "LICENSING FLOW — Client Portal: Client views their project from Development onward | Collapsible Ownership & Licensing Terms section visible",
      "LICENSING FLOW — Support Retainer: Monthly retainer maintains the license | Active while paid — suspendable after 60-day lapse",
      "HOW TO HANDLE PROJECT REQUESTS: Clients submit requests via 'Request a Project' in their portal. A green alert card appears on your Dashboard with the project name and PENDING badge. Click to open the full request — see client name, description, budget range, timeline, and additional info. Click 'Acknowledge & Review' to set status to REVIEWED (client sees this update), or 'Decline' to reject. To convert a request into an actual project, go to Projects → '+ Add Project' and reference the request details.",
      "HOW TO USE CAL.COM BOOKING: Discovery call booking is integrated via cal.com/emile-du-toit-lhb4qv/discovery-call. Clients see a 'Book a Call' link in their portal sidebar and on the Request a Project page. The public landing page also has a 'Book a Free Discovery Call' CTA. Calendar syncs with your Google Calendar — availability updates automatically.",
      "HOW TO RUN TESTS: Run 'npm test' from the project root to execute all unit and integration tests via Vitest. Run 'npm run test:watch' for watch mode during development. Tests include Stripe integration (uses test keys — never touches real money), component rendering, schema validation, and more.",
      "HOW TO TEST STRIPE PAYMENTS: Local dev uses Stripe test mode keys (sk_test_ / pk_test_) automatically. Use test card 4242 4242 4242 4242 with any future expiry and any 3-digit CVC for successful payments. Use 4000 0000 0000 0002 to simulate a decline. Use 4000 0025 0000 3155 to test 3D Secure. Never use live keys locally — they're only on Vercel production.",
      "PRICE GUIDANCE — Shopify & E-commerce: $800–1.5k (boutique store, <2k products, theme + setup + AI agent + automations)",
      "PRICE GUIDANCE — Website / Digital Presence: $1.5–3k (redesign, SEO, branding — foot-in-the-door for bigger projects)",
      "PRICE GUIDANCE — Training & Consulting: $1–2.5k (tech training, workflow audits, digital transformation strategy)",
      "PRICE GUIDANCE — Process Automation: $2.5–6k (replacing manual workflows, paper forms, spreadsheets with automated systems)",
      "PRICE GUIDANCE — IT Support Retainer: $400–1.2k/month (managed IT, cloud, maintenance, security, backups)",
      "PRICE GUIDANCE — Custom SaaS: $4–12k (client portals, booking systems, inventory, CRM, payment integrations)",
      "PRICE GUIDANCE — Development billing uses 40/30/30 structure: 40% at start, 30% mid-development, 30% at completion",
      "PRICE GUIDANCE — These are below-market rates. Market mid-range: Shopify $2–5k, Website $3–8k, Automation $1.5–5k, SaaS $10–30k, IT $500–2k/mo. Our positioning is affordable/accessible.",
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
