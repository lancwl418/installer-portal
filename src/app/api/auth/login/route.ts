import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, setInstallerCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const installer = await prisma.installer.findUnique({ where: { email } });
  if (!installer) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, installer.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setInstallerCookie({ id: installer.id, email: installer.email, role: "installer" });

  return NextResponse.json({
    ok: true,
    installer: {
      id: installer.id,
      name: installer.name,
      email: installer.email,
      status: installer.status,
    },
  });
}
