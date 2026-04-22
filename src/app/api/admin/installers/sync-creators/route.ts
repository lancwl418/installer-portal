import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

// POST: sync CreatorLink data into matching Installer records
// Matches by Installer.instagramUsername = CreatorLink.username
export async function POST() {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all installers that have an Instagram username
  const installers = await prisma.installer.findMany({
    where: { instagramUsername: { not: null } },
    select: { id: true, instagramUsername: true, avatarUrl: true, customerId: true },
  });

  if (installers.length === 0) {
    return NextResponse.json({ synced: 0, message: "No installers with Instagram usernames" });
  }

  // Get matching CreatorLinks
  const usernames = installers
    .map((i) => i.instagramUsername)
    .filter((u): u is string => u !== null);

  const creatorLinks = await prisma.creatorLink.findMany({
    where: { username: { in: usernames } },
  });

  const creatorMap = new Map(creatorLinks.map((c) => [c.username, c]));

  let synced = 0;
  const results: { id: string; name: string; updates: string[] }[] = [];

  for (const installer of installers) {
    const creator = creatorMap.get(installer.instagramUsername!);
    if (!creator) continue;

    const update: Record<string, unknown> = {};
    const updates: string[] = [];

    // Sync profile pic → avatarUrl (only if installer doesn't already have one)
    if (creator.profilePicUrl && !installer.avatarUrl) {
      update.avatarUrl = creator.profilePicUrl;
      updates.push("avatarUrl");
    }

    // Sync customerId (only if installer doesn't already have one)
    if (creator.customerId && !installer.customerId) {
      update.customerId = creator.customerId;
      updates.push("customerId");
    }

    if (Object.keys(update).length > 0) {
      await prisma.installer.update({
        where: { id: installer.id },
        data: update,
      });
      synced++;
      results.push({ id: installer.id, name: installer.instagramUsername!, updates });
    }
  }

  return NextResponse.json({ synced, total: installers.length, results });
}
