import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getInstallerFromCookie } from "@/lib/auth";

export async function GET() {
  const session = await getInstallerFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const installer = await prisma.installer.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      instagramUsername: true,
      region: true,
      serviceArea: true,
      status: true,
      avatarUrl: true,
    },
  });

  if (!installer) {
    return NextResponse.json({ error: "Installer not found" }, { status: 404 });
  }

  return NextResponse.json({ installer });
}
