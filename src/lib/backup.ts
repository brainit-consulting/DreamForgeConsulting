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
      addRandomSuffix: false,
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
        addRandomSuffix: false,
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
        addRandomSuffix: false,
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

// List backups grouped by tier
export async function listBackups(): Promise<{
  daily: BackupEntry[];
  weekly: BackupEntry[];
  monthly: BackupEntry[];
}> {
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
