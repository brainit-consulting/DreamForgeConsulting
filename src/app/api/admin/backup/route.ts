import { NextResponse } from "next/server";
import { runBackup } from "@/lib/backup";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function POST() {
  try {
    await requireAdmin();
    const result = await runBackup();
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    return handleAuthError(error);
  }
}
