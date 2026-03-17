export interface HelpSection {
  title: string;
  content: string;
  tips?: string[];
}

export const helpContent: Record<string, HelpSection> = {
  dashboard: {
    title: "Dashboard Overview",
    content:
      "Your command center for tracking all business activity. KPI cards show real-time metrics, the revenue chart tracks monthly income, and the activity feed shows recent actions across all projects.",
    tips: [
      "Click any KPI card to drill into detailed reports",
      "The workflow overview shows all active projects at a glance",
      "Revenue chart can be toggled between monthly and quarterly views",
    ],
  },
  leads: {
    title: "Lead Management",
    content:
      "Track potential clients through your sales pipeline. Leads progress through stages: New, Contacted, Qualified, Proposal, and finally Converted (or Lost). Convert qualified leads into clients with one click.",
    tips: [
      "Use the pipeline view to drag leads between stages",
      "Set follow-up reminders to never miss an opportunity",
      "Converting a lead automatically creates a client record",
    ],
  },
  clients: {
    title: "Client Management",
    content:
      "View and manage your active client relationships. Each client can have multiple projects and invoices. Access their full history, project status, and billing from one place.",
    tips: [
      "Click a client name to see all their projects and invoices",
      "Use the search bar to quickly find clients by name or company",
      "Client activity feeds show all interactions chronologically",
    ],
  },
  projects: {
    title: "Project Management",
    content:
      "Track SaaS projects through the 6-stage workflow: Discovery, Design, Development, Testing, Deployment, and Post-Launch Support. Each stage shows completion percentage and estimated dates.",
    tips: [
      "The workflow tracker visually shows project progress",
      "Click a stage to update its status and completion %",
      "Budget tracking helps you stay within the project scope",
    ],
  },
  invoices: {
    title: "Invoice Management",
    content:
      "Create, send, and track invoices for client projects. Integrates with Stripe for payment processing. Invoices can be sent via email using Resend.",
    tips: [
      "Draft invoices can be reviewed before sending",
      "Overdue invoices are highlighted automatically",
      "Clients can pay directly through their portal",
    ],
  },
  settings: {
    title: "Settings & Configuration",
    content:
      "Manage your profile, integrations (Stripe, Resend), and application preferences. Configure notification settings and customize your workspace.",
    tips: [
      "Connect your Stripe account to enable invoice payments",
      "Set up Resend for automated email notifications",
      "Customize your dashboard layout and default views",
    ],
  },
  portal: {
    title: "Client Portal",
    content:
      "This is your project hub. View the real-time status of your projects, pay outstanding invoices, and submit support tickets. All your project information is available in one place.",
    tips: [
      "Check the Projects tab for detailed workflow status",
      "Pay invoices directly through the Invoices tab",
      "Submit support tickets for any questions or issues",
    ],
  },
};
