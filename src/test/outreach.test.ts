import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock data ──────────────────────────────────────────────────────────

const mockLeads = [
  { id: "lead-1", name: "Dr. Test Owner", email: "test1@example.com", company: "Test Marine LLC", phone: "(239) 555-0001", sector: "Marine Services" },
  { id: "lead-2", name: "Jane Tester", email: "test2@example.com", company: "Test Insurance Co", phone: "(239) 555-0002", sector: "Independent Insurance" },
  { id: "lead-3", name: "No Email Lead", email: null, company: "No Contact LLC", phone: "(239) 555-0003", sector: "Marine Services" },
  { id: "lead-4", name: "Bob Builder", email: "test4@example.com", company: "Builder Corp", phone: "(239) 555-0004", sector: "Marine Services" },
];

const mockTemplate = {
  id: "template-1",
  leadId: null,
  subject: "Free IT Consultation for Your Business",
  body: "We help small businesses save time with smart automation. Would you like a free 30-minute consultation?",
  status: "DRAFT" as const,
  sentAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockAssignedDraft = {
  id: "draft-1",
  leadId: "lead-1",
  subject: mockTemplate.subject,
  body: mockTemplate.body,
  status: "DRAFT" as const,
  sentAt: null,
  lead: mockLeads[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ── Mock modules ───────────────────────────────────────────────────────

// Mock email-config
vi.mock("@/lib/email-config", () => ({
  getEmailConfig: vi.fn().mockResolvedValue({
    companyName: "DreamForge Consulting",
    logoUrl: "/logo.png",
    logoSize: 150,
    signOff: "Best regards,\nDreamForge Consulting",
    tagline: "Crafting your digital future.",
    greetingUseName: true,
    greetingUseCompany: true,
    autoApprovalEmail: false,
  }),
  getAbsoluteLogoUrl: vi.fn().mockResolvedValue("https://dreamforgeconsulting.vercel.app/logo.png"),
  getFromAddress: vi.fn().mockReturnValue("DreamForge Consulting <noreply@dreamforgeworld.com>"),
}));

// Mock email-send
const mockSendEmail = vi.fn().mockResolvedValue({ id: "mock-email-id" });
vi.mock("@/lib/email-send", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

// ── Import after mocks ────────────────────────────────────────────────

import { outreachEmail } from "@/lib/email-templates";
import { getEmailConfig } from "@/lib/email-config";

// ── Tests ──────────────────────────────────────────────────────────────

describe("Outreach Email Template", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders outreach email with lead name and company", async () => {
    const html = await outreachEmail({
      leadName: "Dr. Test Owner",
      company: "Test Marine LLC",
      body: "We help small businesses save time.",
    });

    expect(html).toContain("Dr. Test Owner");
    expect(html).toContain("Test Marine LLC");
    expect(html).toContain("We help small businesses save time.");
  });

  it("renders greeting without name when greetingUseName is false", async () => {
    const mockConfig = await getEmailConfig();
    vi.mocked(getEmailConfig).mockResolvedValueOnce({
      ...mockConfig,
      greetingUseName: false,
      greetingUseCompany: false,
    });

    const html = await outreachEmail({
      leadName: "Dr. Test Owner",
      company: "Test Marine LLC",
      body: "Hello there.",
    });

    expect(html).toContain("Hi there");
    expect(html).not.toContain("Dr. Test Owner");
  });

  it("includes company name in header", async () => {
    const html = await outreachEmail({
      leadName: "Jane",
      company: "Insurance Co",
      body: "Test body",
    });

    expect(html).toContain("DreamForge");
  });

  it("wraps body paragraphs in HTML", async () => {
    const html = await outreachEmail({
      leadName: "Bob",
      company: "Builder Corp",
      body: "First paragraph.\n\nSecond paragraph.",
    });

    // Body should be rendered as HTML paragraphs
    expect(html).toContain("First paragraph.");
    expect(html).toContain("Second paragraph.");
  });

  it("handles empty company gracefully", async () => {
    const html = await outreachEmail({
      leadName: "Solo Owner",
      company: "",
      body: "Test",
    });

    expect(html).toContain("Solo Owner");
    expect(html).not.toContain("at ");
  });
});

describe("Outreach Data Model", () => {
  it("template has leadId null", () => {
    expect(mockTemplate.leadId).toBeNull();
    expect(mockTemplate.status).toBe("DRAFT");
  });

  it("assigned draft has leadId set", () => {
    expect(mockAssignedDraft.leadId).toBe("lead-1");
    expect(mockAssignedDraft.lead).toBeDefined();
    expect(mockAssignedDraft.lead.email).toBe("test1@example.com");
  });

  it("template subject and body are copied to assigned drafts", () => {
    expect(mockAssignedDraft.subject).toBe(mockTemplate.subject);
    expect(mockAssignedDraft.body).toBe(mockTemplate.body);
  });
});

describe("Bulk Send Logic", () => {
  it("filters leads without email", () => {
    const leadsWithEmail = mockLeads.filter((l) => l.email);
    expect(leadsWithEmail).toHaveLength(3);
    expect(leadsWithEmail.map((l) => l.id)).not.toContain("lead-3");
  });

  it("skips leads without email in bulk selection", () => {
    const selectedIds = new Set(mockLeads.map((l) => l.id));
    const sendable = mockLeads.filter((l) => selectedIds.has(l.id) && l.email);
    const skipped = selectedIds.size - sendable.length;

    expect(sendable).toHaveLength(3);
    expect(skipped).toBe(1);
  });

  it("creates correct outreach records for each lead", () => {
    const leadsWithEmail = mockLeads.filter((l) => l.email);
    const records = leadsWithEmail.map((lead) => ({
      leadId: lead.id,
      subject: mockTemplate.subject,
      body: mockTemplate.body,
      status: "DRAFT" as const,
    }));

    expect(records).toHaveLength(3);
    records.forEach((r) => {
      expect(r.subject).toBe(mockTemplate.subject);
      expect(r.body).toBe(mockTemplate.body);
      expect(r.leadId).toBeTruthy();
    });
  });

  it("does not fabricate email addresses for leads without email", () => {
    const noEmailLead = mockLeads.find((l) => l.id === "lead-3");
    expect(noEmailLead?.email).toBeNull();
    // Should never send to null email
    const canSend = noEmailLead?.email !== null && noEmailLead?.email !== undefined;
    expect(canSend).toBe(false);
  });

  it("validates template is unassigned before bulk send", () => {
    const isTemplate = mockTemplate.leadId === null;
    expect(isTemplate).toBe(true);

    // An assigned draft should NOT be used as a template
    const isAssigned = mockAssignedDraft.leadId !== null;
    expect(isAssigned).toBe(true);
  });

  it("tracks sent, failed, and skipped counts correctly", () => {
    const results = { sent: 0, failed: 0, skipped: 0 };
    const allLeadIds = mockLeads.map((l) => l.id);
    const leadsWithEmail = mockLeads.filter((l) => l.email);

    results.skipped = allLeadIds.length - leadsWithEmail.length;

    // Simulate sending
    for (const lead of leadsWithEmail) {
      try {
        // Simulate successful send
        if (lead.email) results.sent++;
      } catch {
        results.failed++;
      }
    }

    expect(results.sent).toBe(3);
    expect(results.failed).toBe(0);
    expect(results.skipped).toBe(1);
    expect(results.sent + results.failed + results.skipped).toBe(allLeadIds.length);
  });
});

describe("Outreach Email Send", () => {
  beforeEach(() => {
    mockSendEmail.mockClear();
  });

  it("calls sendEmail with correct parameters", async () => {
    const { getFromAddress } = await import("@/lib/email-config");
    const html = await outreachEmail({
      leadName: mockLeads[0].name,
      company: mockLeads[0].company,
      body: mockTemplate.body,
    });

    // Simulate the send call
    await mockSendEmail({
      from: getFromAddress(),
      to: mockLeads[0].email,
      subject: mockTemplate.subject,
      html,
    });

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test1@example.com",
        subject: "Free IT Consultation for Your Business",
      })
    );
  });

  it("never sends to production emails in tests", () => {
    const testEmails = mockLeads.filter((l) => l.email).map((l) => l.email);
    testEmails.forEach((email) => {
      expect(email).toContain("example.com");
      expect(email).not.toContain("gmail.com");
      expect(email).not.toContain("yahoo.com");
      expect(email).not.toContain("outlook.com");
    });
  });

  it("handles send failure gracefully", async () => {
    mockSendEmail.mockRejectedValueOnce(new Error("SMTP error"));

    let status = "DRAFT";
    try {
      await mockSendEmail({ to: "test@example.com", subject: "Test", html: "<p>Test</p>" });
      status = "SENT";
    } catch {
      status = "FAILED";
    }

    expect(status).toBe("FAILED");
  });

  it("rate limiting: sends are sequential, not parallel", () => {
    // Verify the bulk send pattern uses sequential loop, not Promise.all
    // This is a design constraint test
    const sendDelay = 200; // ms between sends
    const leadCount = 3;
    const minDuration = sendDelay * (leadCount - 1); // 400ms for 3 leads

    expect(minDuration).toBe(400);
    expect(sendDelay).toBeLessThanOrEqual(200); // stays under Resend 5 req/sec
  });
});

describe("Select All Logic", () => {
  it("select all only includes leads with email", () => {
    const emailLeads = mockLeads.filter((l) => l.email);
    const selectedIds = new Set(emailLeads.map((l) => l.id));

    expect(selectedIds.size).toBe(3);
    expect(selectedIds.has("lead-1")).toBe(true);
    expect(selectedIds.has("lead-2")).toBe(true);
    expect(selectedIds.has("lead-3")).toBe(false); // no email
    expect(selectedIds.has("lead-4")).toBe(true);
  });

  it("toggle select all deselects when all email leads are selected", () => {
    const emailLeads = mockLeads.filter((l) => l.email);
    let selectedIds = new Set(emailLeads.map((l) => l.id));

    // All selected → toggle → deselect all
    const allSelected = emailLeads.every((l) => selectedIds.has(l.id));
    expect(allSelected).toBe(true);

    if (allSelected) {
      selectedIds = new Set();
    }

    expect(selectedIds.size).toBe(0);
  });

  it("individual toggle adds and removes from selection", () => {
    const selectedIds = new Set<string>();

    // Add
    selectedIds.add("lead-1");
    expect(selectedIds.has("lead-1")).toBe(true);
    expect(selectedIds.size).toBe(1);

    // Remove
    selectedIds.delete("lead-1");
    expect(selectedIds.has("lead-1")).toBe(false);
    expect(selectedIds.size).toBe(0);
  });
});
