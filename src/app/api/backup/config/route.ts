import { NextResponse } from "next/server";
import {
  getBackupConfig,
  updateBackupConfig,
  resetBackupConfig,
} from "@/lib/backup-config";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getBackupConfig());
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const config = await updateBackupConfig(body);
    return NextResponse.json(config);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE() {
  try {
    await requireAdmin();
    const config = await resetBackupConfig();
    return NextResponse.json(config);
  } catch (error) {
    return handleAuthError(error);
  }
}
