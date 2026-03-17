import { NextResponse } from "next/server";
import { listBackups } from "@/lib/backup";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const backups = await listBackups();
    return NextResponse.json(backups);
  } catch (error) {
    return handleAuthError(error);
  }
}
