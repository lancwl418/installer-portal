import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

// GET: single installer detail with uploads + UGC mentions
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const installer = await prisma.installer.findUnique({
    where: { id },
    include: {
      uploads: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!installer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch Instagram data if username is linked
  let mentions: unknown[] = [];
  let creatorLink = null;
  if (installer.instagramUsername) {
    [mentions, creatorLink] = await Promise.all([
      prisma.mention.findMany({
        where: { username: installer.instagramUsername },
        orderBy: { timestamp: "desc" },
        take: 20,
      }),
      prisma.creatorLink.findUnique({
        where: { username: installer.instagramUsername },
      }),
    ]);
  }

  return NextResponse.json({ installer, mentions, creatorLink });
}

// PATCH: update installer info / status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();

  // Only allow updating specific fields
  const allowed = [
    "name", "phone", "instagramUsername", "region",
    "serviceArea", "specialties", "status", "contractDate",
    "notes", "customerId",
  ];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in data) {
      update[key] = key === "contractDate" && data[key]
        ? new Date(data[key])
        : data[key];
    }
  }

  const installer = await prisma.installer.update({
    where: { id },
    data: update,
  });

  return NextResponse.json({ ok: true, installer });
}

// DELETE: remove installer
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.installer.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
