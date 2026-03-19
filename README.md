# DreamForge Consulting

CRM and project management SaaS for a consulting business that builds SaaS apps, automates business processes, and provides IT support for clients. Tracks the full lifecycle: Lead > Client > Projects > Invoicing > Support.

**Live:** [dreamforgeconsulting.vercel.app](https://dreamforgeconsulting.vercel.app)

## User Types

- **Master Admin** — full CRM: leads pipeline, client management, project workflows, invoicing, outreach, settings, backups
- **Client Portal** — read-only project status, pay invoices via Stripe, submit support tickets, change password

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** + **shadcn/ui** (base-nova style, Base UI primitives)
- **Prisma v7** + **Neon** PostgreSQL
- **better-auth** (email/password, sessions, role-based access)
- **Stripe** (checkout, webhooks for payment/refund/dispute)
- **Resend** (transactional email with branded templates)
- **Vercel AI SDK v6** + **OpenRouter** (Athena AI assistant)
- **Vercel Blob** (automated database backups)
- **Vitest** + React Testing Library

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` and create `.env.local` with your real keys:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Session encryption secret |
| `BETTER_AUTH_URL` | Yes | App URL (localhost for dev) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL (used in emails) |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (use `sk_test_` locally) |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (use `pk_test_` locally) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for Athena AI |
| `OPENAI_API_KEY` | No | OpenAI fallback for Athena |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob (production backups; local uses filesystem) |
| `CRON_SECRET` | No | Vercel cron auth (auto-injected on Vercel) |

**Important:** Use Stripe **test keys** (`sk_test_` / `pk_test_`) locally. Live keys are only set on Vercel production.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run all tests (Vitest)
npm run test:watch   # Watch mode
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma validate  # Validate schema
npx prisma migrate dev --name <name>  # Create migration
```

## Testing

```bash
npm test             # Run all 27+ tests
```

Tests include:
- **Stripe integration** — checkout session creation, webhook signature verification, API connectivity (uses test keys, never real money)
- **Component rendering** — sidebar, dashboard, leads/clients tables, invoices, portal, auth forms, help modals
- **Schema validation** — Prisma schema integrity
- **Configuration** — theme, status badges, workflow tracker

### Stripe Test Cards

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | 3D Secure required |

Use any future expiry date and any 3-digit CVC.

## Project Structure

```
src/
  app/
    (admin)/      # Admin portal — Dashboard, Leads, Clients, Projects, Invoices, Tickets, Outreach, Settings
    (portal)/     # Client portal — Dashboard, Projects, Invoices, Tickets, Settings
    (auth)/       # Login, Forgot Password, Reset Password
    api/          # API routes — auth, CRUD, Stripe, AI, cron, portal
    help/         # Standalone pop-out help page
  components/
    admin/        # Admin-specific components (dialogs, panels)
    portal/       # Portal sidebar
    shared/       # Shared components (help modal, action tooltip, confirm dialog, Athena chat)
    ui/           # shadcn/ui base components
  lib/            # Utilities — DB, auth, email, Stripe, backup, configs
  test/           # Vitest test files
  generated/      # Prisma generated client (gitignored)
prisma/
  schema.prisma   # Database schema
  migrations/     # Migration history
research/         # Market research docs
```

## Workflow Stages

Projects follow a 9-stage lifecycle:

`Discovery > Design > Proposal > Client Approval > Development > Testing > Deployment > Launched > Support`

## Key Features

- **Lead Pipeline** — New > Contacted > Qualified > Proposal > Converted/Lost, with promote-to-client flow
- **Portal Invites** — send credentials email, persistent dialog shows temp password, resend generates new password
- **Proposal Generation** — AI-powered via Copy Prompt (Claude/ChatGPT) or Generate via Athena, with Submit for Approval
- **Client Approval** — email notification (auto or manual), client approves from portal
- **Invoicing** — 40/30/30 payment structure, Stripe Checkout, webhook auto-marks PAID/REFUNDED
- **Support Plans** — monthly/annual retainers, Log Hours, auto-generated DRAFT invoices on 1st of month
- **Outreach** — compose branded emails, templates, preview, clone, send with confirmation
- **Athena AI** — role-gated (admin gets full context, clients get restricted prompt — never leaks internal pricing)
- **Backups** — daily automated to Vercel Blob (or local filesystem in dev), tiered retention, one-click restore
- **Activity Retention** — auto-prunes to 500 most recent per entity daily
- **Help System** — draggable, resizable help modals with pop-out to separate window for multi-monitor

## Design System: "Ember & Steel"

- **Theme:** oklch colors, dark/light mode
- **Primary:** amber/orange (forge fire)
- **Fonts:** Patrick Hand (headings) + DM Sans (body) + JetBrains Mono (forms)
- **Effects:** `forge-glow` box-shadow, `ember-pulse` for active workflow stages

## Deployment

Deployed on [Vercel](https://vercel.com). Push to `main` triggers automatic deploy.

```bash
vercel --prod        # Manual production deploy
vercel env ls        # List environment variables
```
