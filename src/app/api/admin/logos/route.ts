import { NextResponse } from "next/server";
import { put, del, list } from "@vercel/blob";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const { blobs } = await list({ prefix: "logos/" });
    const logos = blobs.map((b) => ({
      url: b.url,
      name: b.pathname.replace("logos/", ""),
      size: b.size,
      uploadedAt: b.uploadedAt,
    }));
    return NextResponse.json(logos);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured — upload only works on production" }, { status: 503 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 2MB" }, { status: 400 });
    }

    const blob = await put(`logos/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
      name: file.name,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }
    await del(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
