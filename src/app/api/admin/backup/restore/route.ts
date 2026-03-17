import { NextResponse } from "next/server";
import { restoreDatabase } from "@/lib/backup";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Backup URL is required" }, { status: 400 });
    }

    // Fetch backup JSON from Vercel Blob
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch backup file" }, { status: 400 });
    }

    const data = await res.json();

    // Restore with admin user preserved
    const result = await restoreDatabase(data, session.user.id);

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    return handleAuthError(error);
  }
}
