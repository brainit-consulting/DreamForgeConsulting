import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runBackup } from "@/lib/backup";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runBackup();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
