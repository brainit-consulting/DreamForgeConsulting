# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DreamForgeConsulting is a CRM/project management SaaS for a consulting business that builds SaaS apps for clients. It tracks the full lifecycle: Lead → Client → Projects → Invoicing. Two user types: **Master Admin** (full CRM) and **Client Portal** (read-only project status, payments, tickets).

**Deployment**: dreamforgeconsulting.vercel.app

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

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** + **shadcn/ui** (base-nova style, Base UI primitives — NOT Radix)
- **Prisma v7** + **Neon** PostgreSQL (`@prisma/adapter-neon`)
- **better-auth** (email/password, sessions)
- **Stripe** (invoicing/payments via `getStripe()` lazy init)
- **Resend** (transactional email)
- **Vercel AI SDK v6** (`ai` + `@ai-sdk/react`, `TextStreamChatTransport`)
- **Vitest** + React Testing Library

## Architecture

### Route Groups

- `(admin)/` — Master Admin portal with sidebar: Dashboard, Leads, Clients, Projects, Invoices, Settings
- `(portal)/` — Client portal with simplified sidebar: Dashboard, Projects, Invoices, Tickets
- `(auth)/` — Login and Register pages (no sidebar)
- `api/auth/[...all]` — better-auth handler
- `api/ai/chat` — Athena AI streaming endpoint
- `api/stripe/create-checkout` — Stripe checkout session creation

### Design System: "Ember & Steel"

Custom theme in `globals.css` using oklch colors. Two themes (dark/light) with CSS variables. Key tokens:
- `--primary` / `--forge` — amber/orange (forge fire)
- `--ember` — deep orange accent
- Fonts: `Patrick Hand` (headings via `font-display`) + `DM Sans` (body via `font-sans`)
- `forge-glow` class for box-shadow glow, `ember-pulse` for active workflow stages

### Key Patterns

- **Prisma v7**: Client generated to `src/generated/prisma/`. Import from `@/generated/prisma/client`. Uses `PrismaNeon` adapter — no `datasourceUrl` on client constructor.
- **shadcn base-nova**: Uses Base UI (NOT Radix). No `asChild` on tooltips — use `render` prop instead. `Select.onValueChange` can pass `null`.
- **Vercel AI SDK v6**: `useChat` takes `transport` (not `api`), uses `sendMessage` (not `handleSubmit`), `status` (not `isLoading`), messages have `.parts` (not `.content`).
- **Stripe**: Lazy-initialized via `getStripe()` to avoid build-time errors when key is missing.
- **Mock Data**: `src/lib/mock-data.ts` provides realistic mock data for all entities until DB is connected.
- **Help System**: `HelpProvider` + `HelpButton` provide draggable, resizable help modals. Content defined in `src/lib/help-content.ts`.
- **Athena AI**: Floating chat panel available in both admin and portal layouts.

### Workflow Stages (for SaaS projects)

`DISCOVERY → DESIGN → DEVELOPMENT → TESTING → DEPLOYMENT → LAUNCHED → SUPPORT`

Defined in `src/types/index.ts` as `WORKFLOW_STAGES`. Visual component: `WorkflowTracker`.

## Git

- Email: dutoit.emile@gmail.com
- Commit with tests passing at each checkpoint
- Generated Prisma client (`src/generated/prisma/`) is gitignored — run `npx prisma generate` after clone

## Testing

Tests are in `src/test/`. Mock patterns:
- `vi.mock("next/navigation")` for `usePathname`/`useRouter`
- `vi.mock("react-rnd")` for modals in jsdom
- `vi.mock("@ai-sdk/react")` for chat
- `vi.mock("recharts")` for charts
- Wrap components needing help context in `<HelpProvider>`
