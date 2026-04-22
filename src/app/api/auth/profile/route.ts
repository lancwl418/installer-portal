import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getInstallerFromCookie } from "@/lib/auth";

// GET: full profile for the logged-in installer
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
      specialties: true,
      status: true,
      bio: true,
      zipCode: true,
      startingPrice: true,
      supportedProducts: true,
      vehicleTypes: true,
      installTypes: true,
      tags: true,
      hasHardwire: true,
      hasMultiCamera: true,
      hasJeepExperience: true,
      offersMobile: true,
      offersShop: true,
      availableThisWeek: true,
      weekendAvailable: true,
      fastResponse: true,
      customerQuote: true,
      facts: true,
      completedInstalls: true,
    },
  });

  if (!installer) {
    return NextResponse.json({ error: "Installer not found" }, { status: 404 });
  }

  return NextResponse.json({ installer });
}

// PATCH: installer updates their own profile
export async function PATCH(req: NextRequest) {
  const session = await getInstallerFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = await req.json();

  // Fields an installer can update themselves
  const stringFields = [
    "name", "phone", "instagramUsername", "region",
    "serviceArea", "specialties", "bio", "zipCode", "customerQuote",
  ];
  const intFields = ["startingPrice", "completedInstalls"];
  const arrayFields = [
    "supportedProducts", "vehicleTypes", "installTypes", "tags", "facts",
  ];
  const boolFields = [
    "hasHardwire", "hasMultiCamera", "hasJeepExperience",
    "offersMobile", "offersShop", "availableThisWeek",
    "weekendAvailable", "fastResponse",
  ];

  const update: Record<string, unknown> = {};

  for (const key of stringFields) {
    if (key in data) {
      update[key] = data[key] || null;
    }
  }
  for (const key of intFields) {
    if (key in data) {
      update[key] = data[key] != null ? Number(data[key]) : null;
    }
  }
  for (const key of arrayFields) {
    if (key in data) {
      update[key] = Array.isArray(data[key]) ? data[key] : [];
    }
  }
  for (const key of boolFields) {
    if (key in data) {
      update[key] = Boolean(data[key]);
    }
  }

  const installer = await prisma.installer.update({
    where: { id: session.id },
    data: update,
  });

  return NextResponse.json({ ok: true, installer });
}
