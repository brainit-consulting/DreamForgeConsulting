import { NextResponse } from "next/server";
import {
  getSupportConfig,
  updateSupportConfig,
  resetSupportConfig,
} from "@/lib/support-config";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getSupportConfig());
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const config = await updateSupportConfig(body);
    return NextResponse.json(config);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE() {
  try {
    await requireAdmin();
    const config = await resetSupportConfig();
    return NextResponse.json(config);
  } catch (error) {
    return handleAuthError(error);
  }
}
