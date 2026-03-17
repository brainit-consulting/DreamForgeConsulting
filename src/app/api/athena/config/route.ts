import { NextResponse } from "next/server";
import {
  getAthenaConfig,
  updateAthenaConfig,
  resetAthenaConfig,
  athenaConfigSchema,
} from "@/lib/athena-config";

export async function GET() {
  return NextResponse.json(getAthenaConfig());
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const config = updateAthenaConfig(body);
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid config" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const config = resetAthenaConfig();
  return NextResponse.json(config);
}
