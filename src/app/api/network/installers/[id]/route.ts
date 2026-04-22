import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public API: single installer detail for the detail page
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const installer = await prisma.installer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      zipCode: true,
      region: true,
      serviceArea: true,
      specialties: true,
      rating: true,
      reviewCount: true,
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
      instagramUsername: true,
      phone: true,
      status: true,
      uploads: {
        where: { status: "approved" },
        select: {
          id: true,
          fileUrl: true,
          fileType: true,
          caption: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!installer || !["active", "approved"].includes(installer.status)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch UGC mentions if installer has Instagram username
  let mentions: { id: string; mediaUrl: string; mediaType: string; caption: string | null; permalink: string; timestamp: Date; likeCount: number }[] = [];
  if (installer.instagramUsername) {
    mentions = await prisma.mention.findMany({
      where: { username: installer.instagramUsername },
      select: {
        id: true,
        mediaUrl: true,
        mediaType: true,
        caption: true,
        permalink: true,
        timestamp: true,
        likeCount: true,
      },
      orderBy: { timestamp: "desc" },
      take: 12,
    });
  }

  // Build media list: uploads + UGC
  const media = [
    ...installer.uploads.map((u) => ({
      id: u.id,
      url: u.fileUrl,
      type: u.fileType.startsWith("video") ? "video" as const : "photo" as const,
      caption: u.caption,
      source: "upload" as const,
    })),
    ...mentions.map((m) => ({
      id: m.id,
      url: m.mediaUrl,
      type: m.mediaType === "VIDEO" ? "video" as const : "photo" as const,
      caption: m.caption ? m.caption.slice(0, 120) : null,
      source: "ugc" as const,
    })),
  ];

  // Fetch related installers (other active/approved ones, up to 3)
  const related = await prisma.installer.findMany({
    where: {
      status: { in: ["active", "approved"] },
      id: { not: id },
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      rating: true,
      reviewCount: true,
      region: true,
      offersMobile: true,
      offersShop: true,
      tags: true,
    },
    take: 3,
    orderBy: { rating: "desc" },
  });

  // Remove internal fields before sending
  const { instagramUsername, status, uploads, ...detail } = installer;

  return NextResponse.json({
    installer: detail,
    media,
    related,
  });
}
