# DreamForgeConsulting CRM App - Implementation Plan

## Context
Build a full-stack CRM/project management SaaS for DreamForgeConsulting (a consultancy that builds SaaS apps for clients). The system tracks the complete lifecycle: Lead -> Client -> Projects -> Invoicing. Two user types: Master Admin (full control) and Client (portal access). Deploy to **DreamForgeConsulting.vercel.app**.

## Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **UI**: React, shadcn/ui, Tailwind CSS
- **Theme**: Dark/Light with "Ember & Steel" design (forge-inspired amber/orange accents on dark slate)
- **Fonts**: Patrick Hand for headings/accent only + DM Sans for body/data/tables/forms
- **Auth**: better-auth (username + password only)
- **AI**: Vercel AI SDK
- **Database**: Neon PostgreSQL + Prisma ORM (created via Vercel CLI)
- **Payments**: Stripe (invoicing)
- **Email**: Resend
- **Deployment**: Vercel — project name: DreamForgeConsulting, subdomain: dreamforgeconsulting.vercel.app
- **Git**: dutoit.emile@gmail.com
- **Modals**: Resizable, draggable, 80% viewport help modals — context-specific per section
- **Testing**: Vitest + React Testing Library (unit tests at each checkpoint)

## Design Direction: "Ember & Steel"
- Dark charcoal base (#0A0A0F) with warm amber (#F59E0B) and ember orange (#FF6B2B) accents
- Typography: Patrick Hand (headings/display) + DM Sans (body/data) via Google Fonts
- Industrial luxury aesthetic — premium feel, warm glow effects
- Visual workflow pipelines showing project progress as a forging process
- Help modals: resizable, draggable, 80% viewport, context-specific content per page/section

## Database Schema (Prisma/Neon)
```
User        (id, email, name, role[ADMIN/CLIENT], avatar, password hash — via better-auth)
Lead        (id, name, email, company, phone, status[NEW/CONTACTED/QUALIFIED/PROPOSAL/CONVERTED/LOST], source, notes, value, createdAt)
Client      (id, userId, company, email, phone, address, createdAt) — converted from Lead
Project     (id, clientId, name, description, status[DISCOVERY/DESIGN/DEVELOPMENT/TESTING/DEPLOYMENT/LAUNCHED/SUPPORT], startDate, deadline, budget, progress)
Invoice     (id, projectId, clientId, stripeInvoiceId, amount, status[DRAFT/SENT/PAID/OVERDUE/CANCELLED], dueDate, paidAt)
Ticket      (id, clientId, projectId, subject, description, status[OPEN/IN_PROGRESS/RESOLVED/CLOSED], priority[LOW/MEDIUM/HIGH/URGENT], createdAt)
Activity    (id, type, description, entityType, entityId, userId, createdAt) — audit trail
```

## Workflow Stages (6 stages for SaaS projects)
1. Discovery & Planning
2. Design & Wireframing
3. Development
4. Testing & QA
5. Deployment & Launch
6. Post-Launch Support

Each stage: completion %, status indicator, estimated dates. Active stage has ember glow animation.

---

## Checkpoint Plan (with commits & tests at each checkpoint)

### Checkpoint 1: Project Scaffold & Config
- **FIRST**: Copy this plan to `plans/implementation-plan.md` in the repo
- `npx create-next-app@latest` (TS, Tailwind, ESLint, App Router, src dir)
- Install deps: shadcn/ui, lucide-react, next-themes, better-auth, prisma, @prisma/client, ai, @ai-sdk/openai, stripe, @stripe/stripe-js, recharts, framer-motion, date-fns, zod, resend, vitest, @testing-library/react, @testing-library/jest-dom, react-rnd (for draggable/resizable modals)
- Initialize shadcn/ui with custom Ember & Steel theme
- Configure Vitest
- Create `.env.example`
- **Tests**: Config loads, app renders without crash
- **Commit**: "chore: scaffold Next.js project with dependencies and config"

### Checkpoint 2: Design System & Core Layout
- Custom globals.css with Ember & Steel color variables (dark + light)
- Google Fonts: Patrick Hand + DM Sans
- ThemeProvider + ThemeToggle component
- Admin sidebar layout (collapsible, icon + text navigation)
- Client portal layout (simplified sidebar)
- Shared components: StatusBadge, Logo
- **Tests**: Theme toggle works, sidebar renders, layouts render
- **Commit**: "feat: design system, theme, and core layouts"

### Checkpoint 3: Help Modal System
- Draggable, resizable modal component (react-rnd)
- 80% viewport size, context-specific content
- Help button on each page section
- HelpProvider context for managing modal state
- **Tests**: Modal opens/closes, renders content, is resizable
- **Commit**: "feat: context-specific draggable help modal system"

### Checkpoint 4: Database & Auth
- Prisma schema (all models above)
- `prisma validate`
- better-auth setup (username/password, session management)
- Login/Register pages
- Auth middleware for admin/portal route protection
- **Tests**: Prisma schema validates, auth forms render, validation works
- **Commit**: "feat: database schema and better-auth authentication"

### Checkpoint 5: Admin Dashboard
- KPI cards (revenue, active projects, leads, clients)
- Revenue chart (recharts)
- Recent activity feed
- Project status overview with mini workflow indicators
- All using mock data (ready for DB connection)
- **Tests**: Dashboard renders, KPI cards display data, chart renders
- **Commit**: "feat: admin dashboard with KPIs, charts, and activity feed"

### Checkpoint 6: Leads & Clients Pages
- Leads table with status pipeline visualization
- Lead detail view, convert-to-client action
- Clients table with search/filter
- Client detail page with linked projects & invoices
- **Tests**: Lead table renders, status filters work, client detail shows projects
- **Commit**: "feat: leads management and client pages"

### Checkpoint 7: Projects & Workflow Visualization
- Projects list with workflow status badges
- Project detail page with visual 6-stage workflow tracker
- Stage progression with ember glow animation on active stage
- Timeline view, task overview
- **Tests**: Workflow tracker renders stages, active stage highlighted, project detail renders
- **Commit**: "feat: project management with visual workflow tracker"

### Checkpoint 8: Invoices & Stripe Integration
- Invoice list (filterable by status)
- Create invoice form
- Stripe integration structure (API routes ready)
- Invoice PDF preview / send via Resend
- **Tests**: Invoice table renders, create form validates, status filters work
- **Commit**: "feat: invoice management with Stripe and Resend integration"

### Checkpoint 9: Client Portal
- Portal dashboard (project overview, pending invoices, recent tickets)
- Project status page (read-only workflow visualization)
- Invoice view & pay (Stripe checkout integration)
- Ticket submission & tracking
- **Tests**: Portal dashboard renders, ticket form validates, invoice list renders
- **Commit**: "feat: client portal with projects, invoices, and tickets"

### Checkpoint 10: Athena AI Agent & Polish
- **Athena**: In-app AI guide/assistant powered by Vercel AI SDK
  - Available to both Admin and Client portal users
  - Context-aware FAQ help, onboarding guidance, workflow explanations
  - Chat-style UI panel (draggable, resizable, consistent with help modal system)
  - Detailed design deferred to Phase 2 — Checkpoint 10 implements the scaffold and chat UI
- Final polish: animations, micro-interactions, responsive design
- Production build verification
- **Tests**: Athena chat UI renders, AI route responds, build succeeds, no lint errors
- **Commit**: "feat: Athena AI assistant and final polish"

### Checkpoint 11: Deployment & CLAUDE.md
- Create GitHub repo (DreamForgeConsulting)
- Vercel project setup (name: DreamForgeConsulting, subdomain: dreamforgeconsulting.vercel.app)
- Neon DB via Vercel integration
- CLAUDE.md documentation
- **Commit**: "docs: add CLAUDE.md and deployment config"

---

## Verification (End-to-End)
1. `npm run dev` — app starts without errors
2. Navigate admin dashboard — all widgets render with mock data
3. Navigate each admin page — tables, forms, workflow viz work
4. Toggle dark/light theme — both themes polished
5. Open help modals — draggable, resizable, context-specific
6. Navigate client portal — all portal pages render
7. `npx prisma validate` — schema is valid
8. `npm run test` — all unit tests pass
9. `npm run build` — production build succeeds
10. `npm run lint` — no lint errors

## Notes
- Ask user before starting/stopping local dev server
- Vercel project must use exact name "DreamForgeConsulting" for correct subdomain
- Each checkpoint gets its own commit with passing tests
- Plan saved locally in `plans/` folder in repo root
