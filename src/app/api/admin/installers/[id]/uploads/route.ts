import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

// PATCH: approve or reject an upload
export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { uploadId, status, reviewNote } = await req.json();

  if (!uploadId || !["approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "uploadId and status (approved/rejected) required" },
      { status: 400 }
    );
  }

  const upload = await prisma.installerUpload.update({
    where: { id: uploadId },
    data: { status, reviewNote: reviewNote || null },
  });

  return NextResponse.json({ ok: true, upload });
}
