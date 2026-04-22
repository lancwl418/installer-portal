import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Public API: search installers for the Find Installer page
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const zip = params.get("zip") || "";
  const product = params.get("product") || "all";
  const vehicle = params.get("vehicle") || "all";
  const install = params.get("install") || "all";
  const sort = params.get("sort") || "recommended";

  // Filter flags
  const fHardwire = params.get("hardwire") === "1";
  const fMulti = params.get("multi") === "1";
  const fJeep = params.get("jeep") === "1";
  const fMobile = params.get("mobile") === "1";
  const fShop = params.get("shop") === "1";
  const fTopRated = params.get("topRated") === "1";
  const fManyReviews = params.get("manyReviews") === "1";
  const fFast = params.get("fast") === "1";
  const fWeek = params.get("week") === "1";
  const fWeekend = params.get("weekend") === "1";

  // Build where clause — show active and approved installers
  const where: Prisma.InstallerWhereInput = {
    status: { in: ["active", "approved"] },
  };

  if (product !== "all") {
    where.supportedProducts = { has: product };
  }
  if (vehicle !== "all") {
    where.vehicleTypes = { has: vehicle };
  }
  if (install !== "all") {
    where.installTypes = { has: install };
  }
  if (fHardwire) where.hasHardwire = true;
  if (fMulti) where.hasMultiCamera = true;
  if (fJeep) where.hasJeepExperience = true;
  if (fMobile) where.offersMobile = true;
  if (fShop) where.offersShop = true;
  if (fTopRated) where.rating = { gte: 4.5 };
  if (fManyReviews) where.reviewCount = { gte: 10 };
  if (fFast) where.fastResponse = true;
  if (fWeek) where.availableThisWeek = true;
  if (fWeekend) where.weekendAvailable = true;

  // Determine sort order
  let orderBy: Prisma.InstallerOrderByWithRelationInput;
  switch (sort) {
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "reviews":
      orderBy = { reviewCount: "desc" };
      break;
    case "price":
      orderBy = { startingPrice: "asc" };
      break;
    default:
      // "recommended" — sort by rating * reviewCount as a proxy
      orderBy = { rating: "desc" };
      break;
  }

  const rawInstallers = await prisma.installer.findMany({
    where,
    orderBy,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      zipCode: true,
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
      region: true,
      instagramUsername: true,
      uploads: {
        where: { status: "approved" },
        select: {
          id: true,
          fileUrl: true,
          fileType: true,
          caption: true,
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // For installers with Instagram usernames, fetch UGC mentions as media
  const igUsernames = rawInstallers
    .filter((i) => i.instagramUsername && i.uploads.length < 4)
    .map((i) => i.instagramUsername!);

  let mentionsByUsername: Record<string, { id: string; mediaUrl: string; mediaType: string; caption: string | null }[]> = {};
  if (igUsernames.length > 0) {
    const mentions = await prisma.mention.findMany({
      where: { username: { in: igUsernames } },
      select: {
        id: true,
        username: true,
        mediaUrl: true,
        mediaType: true,
        caption: true,
      },
      orderBy: { timestamp: "desc" },
      take: igUsernames.length * 4,
    });
    for (const m of mentions) {
      if (!mentionsByUsername[m.username]) mentionsByUsername[m.username] = [];
      if (mentionsByUsername[m.username].length < 4) {
        mentionsByUsername[m.username].push(m);
      }
    }
  }

  // Merge: use uploads first, fill remaining slots with UGC mentions
  const installers = rawInstallers.map(({ instagramUsername, ...rest }) => {
    const uploads = [...rest.uploads];
    if (uploads.length < 4 && instagramUsername && mentionsByUsername[instagramUsername]) {
      const remaining = 4 - uploads.length;
      const ugcMedia = mentionsByUsername[instagramUsername].slice(0, remaining).map((m) => ({
        id: m.id,
        fileUrl: m.mediaUrl,
        fileType: m.mediaType === "VIDEO" ? "video" : "image",
        caption: m.caption ? m.caption.slice(0, 80) : null,
      }));
      uploads.push(...ugcMedia);
    }
    return { ...rest, uploads };
  });

  // For "recommended" sort, do a secondary sort by weighted score
  if (sort === "recommended") {
    installers.sort((a, b) => {
      let sa = a.rating * 20 + Math.min(a.reviewCount, 80);
      let sb = b.rating * 20 + Math.min(b.reviewCount, 80);
      if (product !== "all") {
        if (a.supportedProducts.includes(product)) sa += 50;
        if (b.supportedProducts.includes(product)) sb += 50;
      }
      if (vehicle !== "all") {
        if (a.vehicleTypes.includes(vehicle)) sa += 36;
        if (b.vehicleTypes.includes(vehicle)) sb += 36;
      }
      if (install !== "all") {
        if (a.installTypes.includes(install)) sa += 36;
        if (b.installTypes.includes(install)) sb += 36;
      }
      return sb - sa;
    });
  }

  return NextResponse.json({ installers, zip });
}
