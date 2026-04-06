import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getInstallerFromCookie } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

// GET: list uploads for current installer
export async function GET() {
  const session = await getInstallerFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const uploads = await prisma.installerUpload.findMany({
    where: { installerId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ uploads });
}

// POST: upload a file
export async function POST(req: NextRequest) {
  const session = await getInstallerFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  const ext = file.name.split(".").pop() || "bin";
  const fileType = contentType.startsWith("video/") ? "video" : "image";

  // Upload to R2
  const key = `installer-uploads/${session.id}/${Date.now()}.${ext}`;
  const fileUrl = await uploadToR2(key, buffer, contentType);

  // Save to DB
  const upload = await prisma.installerUpload.create({
    data: {
      installerId: session.id,
      fileUrl,
      fileType,
      caption,
    },
  });

  return NextResponse.json({ ok: true, upload });
}
