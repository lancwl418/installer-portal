import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/auth";

// Simple admin auth — check against env variable
// For production, replace with a proper admin user table
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@acumen-camera.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setAdminCookie({ email, role: "admin" });

  return NextResponse.json({ ok: true });
}
