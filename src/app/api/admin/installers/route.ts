import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie, hashPassword } from "@/lib/auth";

// GET: list all installers
export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const installers = await prisma.installer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { uploads: true } } },
  });

  return NextResponse.json({ installers });
}

// POST: create a new installer (admin creates account for them)
export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, password, name, phone, instagramUsername, region, serviceArea } =
    await req.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "email, password, and name are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.installer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const installer = await prisma.installer.create({
    data: {
      email,
      passwordHash,
      name,
      phone: phone || null,
      instagramUsername: instagramUsername || null,
      region: region || null,
      serviceArea: serviceArea || null,
      status: "approved",
    },
  });

  return NextResponse.json({ ok: true, installer }, { status: 201 });
}
