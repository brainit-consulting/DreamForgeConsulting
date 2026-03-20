// Shared types for mock data and components (mirrors Prisma schema)

export type UserRole = "ADMIN" | "CLIENT";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL"
  | "CONVERTED"
  | "LOST";

export type ProjectStatus =
  | "DISCOVERY"
  | "DESIGN"
  | "PROPOSAL"
  | "APPROVAL"
  | "DEVELOPMENT"
  | "TESTING"
  | "DEPLOYMENT"
  | "LAUNCHED"
  | "SUPPORT";

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED"
  | "REFUNDED";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type OutreachStatus = "DRAFT" | "SENT" | "FAILED";

export interface Lead {
  id: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  website?: string;
  address?: string;
  sector?: string;
  cardSent?: boolean;
  status: LeadStatus;
  source?: string;
  notes?: string;
  value?: number;
  createdAt: Date;
  outreachEmails?: { status: string; sentAt?: string | null }[];
}

export interface Client {
  id: string;
  userId: string;
  company: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  projects?: Project[];
  invoices?: Invoice[];
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  deadline?: Date;
  budget?: number;
  progress: number;
  createdAt: Date;
  client?: Client;
}

export interface Invoice {
  id: string;
  projectId?: string;
  clientId: string;
  stripeInvoiceId?: string;
  amount: number;
  status: InvoiceStatus;
  description?: string;
  dueDate?: Date;
  paidAt?: Date;
  createdAt: Date;
  client?: Client;
  project?: Project;
}

export interface Ticket {
  id: string;
  clientId: string;
  projectId?: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  entityType: string;
  entityId: string;
  userId?: string;
  createdAt: Date;
}

// Workflow stage definition for the visual tracker
export const WORKFLOW_STAGES: { key: ProjectStatus; label: string }[] = [
  { key: "DISCOVERY", label: "Discovery & Planning" },
  { key: "DESIGN", label: "Design & Wireframing" },
  { key: "PROPOSAL", label: "Proposal" },
  { key: "APPROVAL", label: "Client Approval" },
  { key: "DEVELOPMENT", label: "Development" },
  { key: "TESTING", label: "Testing & QA" },
  { key: "DEPLOYMENT", label: "Deployment & Launch" },
  { key: "LAUNCHED", label: "Launched" },
  { key: "SUPPORT", label: "Post-Launch Support" },
];

// Auto-calculated progress per stage
export const STAGE_PROGRESS: Record<ProjectStatus, number> = {
  DISCOVERY: 5,
  DESIGN: 15,
  PROPOSAL: 22,
  APPROVAL: 30,
  DEVELOPMENT: 50,
  TESTING: 70,
  DEPLOYMENT: 85,
  LAUNCHED: 100,
  SUPPORT: 100,
};

export function stageIndex(status: ProjectStatus): number {
  return WORKFLOW_STAGES.findIndex((s) => s.key === status);
}

export function canTransitionTo(current: ProjectStatus, target: ProjectStatus): boolean {
  if (current === target) return false;
  const from = stageIndex(current);
  const to = stageIndex(target);
  // Can go to any previous stage or exactly 1 ahead
  return to <= from || to === from + 1;
}
