import { put, del, list } from "@vercel/blob";
import { db } from "@/lib/db";

export interface BackupEntry {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  tier: "daily" | "weekly" | "monthly";
  label: string;
}

export interface BackupResult {
  success: boolean;
  dailyKey?: string;
  promoted?: { weekly?: string; monthly?: string };
  deleted?: string[];
  error?: string;
  durationMs?: number;
  sizeBytes?: number;
}

// Export every table as JSON
async function exportDatabase(): Promise<Record<string, unknown[]>> {
  const [
    users,
    leads,
    clients,
    projects,
    stageTasks,
    stageNotes,
    invoices,
    tickets,
    activities,
    outreachEmails,
    appSettings,
  ] = await Promise.all([
    db.user.findMany(),
    db.lead.findMany(),
    db.client.findMany(),
    db.project.findMany(),
    db.stageTask.findMany(),
    db.stageNote.findMany(),
    db.invoice.findMany(),
    db.ticket.findMany(),
    db.activity.findMany(),
    db.outreachEmail.findMany(),
    db.appSettings.findMany(),
  ]);

  return {
    users,
    leads,
    clients,
    projects,
    stageTasks,
    stageNotes,
    invoices,
    tickets,
    activities,
    outreachEmails,
    appSettings,
    exportedAt: [new Date().toISOString()],
  };
}

// ISO week number (1-53)
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Main backup function — call from cron or manual trigger
export async function runBackup(): Promise<BackupResult> {
  const start = Date.now();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { success: false, error: "BLOB_READ_WRITE_TOKEN not configured", durationMs: 0 };
  }

  const deleted: string[] = [];

  try {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");
    const todayKey = `${yyyy}-${mm}-${dd}`;

    // 1. Export DB
    const data = await exportDatabase();
    const json = JSON.stringify(data, null, 2);
    const bytes = Buffer.byteLength(json, "utf8");

    // 2. Upload daily backup
    const dailyPath = `backups/daily/${todayKey}.json`;
    const { url: dailyUrl } = await put(dailyPath, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
    });

    const promoted: { weekly?: string; monthly?: string } = {};

    // 3. Promote to weekly on Sunday (0)
    const dayOfWeek = now.getUTCDay();
    if (dayOfWeek === 0) {
      const week = String(getISOWeekNumber(now)).padStart(2, "0");
      const weeklyPath = `backups/weekly/${yyyy}-W${week}.json`;
      await put(weeklyPath, json, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: true,
      });
      promoted.weekly = weeklyPath;
    }

    // 4. Promote to monthly on 1st of month
    const dayOfMonth = now.getUTCDate();
    if (dayOfMonth === 1) {
      const monthlyPath = `backups/monthly/${yyyy}-${mm}.json`;
      await put(monthlyPath, json, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: true,
      });
      promoted.monthly = monthlyPath;
    }

    // 5. Cleanup old backups
    const allBlobs = await list({ prefix: "backups/" });

    const cutoffs = {
      daily: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      weekly: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      monthly: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
    };

    for (const blob of allBlobs.blobs) {
      const p = blob.pathname;
      let shouldDelete = false;

      if (p.startsWith("backups/daily/") && blob.uploadedAt < cutoffs.daily) {
        shouldDelete = true;
      } else if (p.startsWith("backups/weekly/") && blob.uploadedAt < cutoffs.weekly) {
        shouldDelete = true;
      } else if (p.startsWith("backups/monthly/") && blob.uploadedAt < cutoffs.monthly) {
        shouldDelete = true;
      }

      if (shouldDelete) {
        await del(blob.url);
        deleted.push(p);
      }
    }

    return {
      success: true,
      dailyKey: dailyUrl,
      promoted,
      deleted,
      durationMs: Date.now() - start,
      sizeBytes: bytes,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}

export interface RestoreResult {
  success: boolean;
  counts?: Record<string, number>;
  error?: string;
  durationMs?: number;
}

// Restore database from backup JSON — preserves the admin user to prevent lockout
export async function restoreDatabase(
  data: Record<string, unknown[]>,
  adminUserId: string
): Promise<RestoreResult> {
  const start = Date.now();

  // Validate structure
  const required = ["users", "leads", "clients", "projects", "invoices", "tickets", "activities"];
  for (const key of required) {
    if (!Array.isArray(data[key])) {
      return { success: false, error: `Missing or invalid "${key}" in backup`, durationMs: Date.now() - start };
    }
  }

  try {
    // Pre-restore safety backup
    await runBackup();

    const counts: Record<string, number> = {};

    await db.$transaction(async (tx) => {
      // Delete children first (reverse FK order), skip admin user
      await tx.appSettings.deleteMany();
      await tx.outreachEmail.deleteMany();
      await tx.activity.deleteMany();
      await tx.ticket.deleteMany();
      await tx.invoice.deleteMany();
      await tx.stageNote.deleteMany();
      await tx.stageTask.deleteMany();
      await tx.project.deleteMany();
      await tx.client.deleteMany();
      await tx.lead.deleteMany();
      // Delete all users EXCEPT the current admin
      await tx.user.deleteMany({ where: { id: { not: adminUserId } } });

      // Insert parents first (FK order)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const any = (v: unknown) => v as any;

      const users = (data.users as Array<Record<string, unknown>>).filter(
        (u) => u.id !== adminUserId
      );
      if (users.length > 0) {
        await tx.user.createMany({ data: any(users), skipDuplicates: true });
      }
      counts.users = users.length;

      if (data.leads.length > 0) {
        await tx.lead.createMany({ data: any(data.leads) });
      }
      counts.leads = data.leads.length;

      if (data.clients.length > 0) {
        await tx.client.createMany({ data: any(data.clients) });
      }
      counts.clients = data.clients.length;

      if (data.projects.length > 0) {
        await tx.project.createMany({ data: any(data.projects) });
      }
      counts.projects = data.projects.length;

      const stageTasks = data.stageTasks ?? [];
      if (stageTasks.length > 0) {
        await tx.stageTask.createMany({ data: any(stageTasks) });
      }
      counts.stageTasks = stageTasks.length;

      const stageNotes = data.stageNotes ?? [];
      if (stageNotes.length > 0) {
        await tx.stageNote.createMany({ data: any(stageNotes) });
      }
      counts.stageNotes = stageNotes.length;

      if (data.invoices.length > 0) {
        await tx.invoice.createMany({ data: any(data.invoices) });
      }
      counts.invoices = data.invoices.length;

      if (data.tickets.length > 0) {
        await tx.ticket.createMany({ data: any(data.tickets) });
      }
      counts.tickets = data.tickets.length;

      if (data.activities.length > 0) {
        await tx.activity.createMany({ data: any(data.activities) });
      }
      counts.activities = data.activities.length;

      const outreachEmails = data.outreachEmails ?? [];
      if (outreachEmails.length > 0) {
        await tx.outreachEmail.createMany({ data: any(outreachEmails) });
      }
      counts.outreachEmails = outreachEmails.length;

      const appSettings = data.appSettings ?? [];
      if (appSettings.length > 0) {
        await tx.appSettings.createMany({ data: any(appSettings) });
      }
      counts.appSettings = appSettings.length;
    });

    return { success: true, counts, durationMs: Date.now() - start };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}

// List backups grouped by tier
export async function listBackups(): Promise<{
  daily: BackupEntry[];
  weekly: BackupEntry[];
  monthly: BackupEntry[];
}> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { daily: [], weekly: [], monthly: [] };
  }
  const all = await list({ prefix: "backups/" });

  function mapEntry(tier: BackupEntry["tier"]) {
    return (blob: (typeof all.blobs)[number]): BackupEntry => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      tier,
      label: blob.pathname.split("/").pop()?.replace(".json", "") ?? blob.pathname,
    });
  }

  return {
    daily: all.blobs
      .filter((b) => b.pathname.startsWith("backups/daily/"))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .map(mapEntry("daily")),
    weekly: all.blobs
      .filter((b) => b.pathname.startsWith("backups/weekly/"))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .map(mapEntry("weekly")),
    monthly: all.blobs
      .filter((b) => b.pathname.startsWith("backups/monthly/"))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .map(mapEntry("monthly")),
  };
}
