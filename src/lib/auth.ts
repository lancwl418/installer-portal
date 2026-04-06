import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "installer-portal-secret-change-me";
const COOKIE_NAME = "installer_token";
const ADMIN_COOKIE_NAME = "admin_token";

// ==================== Password ====================

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// ==================== JWT ====================

interface InstallerPayload {
  id: string;
  email: string;
  role: "installer";
}

interface AdminPayload {
  email: string;
  role: "admin";
}

type TokenPayload = InstallerPayload | AdminPayload;

export function signToken(payload: TokenPayload) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt.sign as any)(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// ==================== Cookie helpers ====================

export async function setInstallerCookie(payload: InstallerPayload) {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getInstallerFromCookie(): Promise<InstallerPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "installer") return null;
  return payload as InstallerPayload;
}

export async function setAdminCookie(payload: AdminPayload) {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getAdminFromCookie(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload as AdminPayload;
}

export async function clearCookie(name: string = COOKIE_NAME) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
