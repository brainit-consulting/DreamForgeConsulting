import { NextResponse } from "next/server";
import {
  getEmailConfig,
  updateEmailConfig,
  resetEmailConfig,
} from "@/lib/email-config";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getEmailConfig());
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const config = await updateEmailConfig(body);
    return NextResponse.json(config);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE() {
  try {
    await requireAdmin();
    const config = await resetEmailConfig();
    return NextResponse.json(config);
  } catch (error) {
    return handleAuthError(error);
  }
}
