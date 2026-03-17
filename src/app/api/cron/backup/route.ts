import { NextResponse } from "next/server";
import { runBackup } from "@/lib/backup";

// Vercel cron automatically sends Authorization: Bearer <CRON_SECRET>
// This endpoint must be a GET for Vercel cron compatibility
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Fail closed — if CRON_SECRET is not configured, deny all requests
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runBackup();

  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
