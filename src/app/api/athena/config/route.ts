import { NextResponse } from "next/server";
import {
  getAthenaConfig,
  updateAthenaConfig,
  resetAthenaConfig,
} from "@/lib/athena-config";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getAthenaConfig());
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const config = await updateAthenaConfig(body);
    return NextResponse.json(config);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE() {
  try {
    await requireAdmin();
    const config = await resetAthenaConfig();
    return NextResponse.json(config);
  } catch (error) {
    return handleAuthError(error);
  }
}
