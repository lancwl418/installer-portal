import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

// GET: list all candidates
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where = status ? { status } : {};
  const candidates = await prisma.recruitCandidate.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ candidates });
}

// POST: add a new candidate
export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { instagramUsername, fullName, profilePicUrl, biography, followerCount, followingCount, mediaCount, isVerified, category, externalUrl, source, notes } = body;

  if (!instagramUsername) {
    return NextResponse.json({ error: "instagramUsername is required" }, { status: 400 });
  }

  // Check if already exists
  const existing = await prisma.recruitCandidate.findUnique({
    where: { instagramUsername },
  });
  if (existing) {
    return NextResponse.json({ error: "Candidate already exists", candidate: existing }, { status: 409 });
  }

  const candidate = await prisma.recruitCandidate.create({
    data: {
      instagramUsername,
      fullName: fullName || null,
      profilePicUrl: profilePicUrl || null,
      biography: biography || null,
      followerCount: followerCount || 0,
      followingCount: followingCount || 0,
      mediaCount: mediaCount || 0,
      isVerified: isVerified || false,
      category: category || null,
      externalUrl: externalUrl || null,
      source: source || null,
      notes: notes || null,
    },
  });

  return NextResponse.json({ candidate }, { status: 201 });
}

// PATCH: update candidate status or notes
export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status, notes } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (status) update.status = status;
  if (notes !== undefined) update.notes = notes;

  const candidate = await prisma.recruitCandidate.update({
    where: { id },
    data: update,
  });

  return NextResponse.json({ candidate });
}

// DELETE: remove candidate
export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.recruitCandidate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
