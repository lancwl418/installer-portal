import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import {
  searchInstagram,
  fetchProfile,
  fetchHashtagFeed,
  resolveUserId,
} from "@/lib/instagram";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type"); // search | profile | hashtag
  const query = url.searchParams.get("q") || "";
  const cursor = url.searchParams.get("cursor") || undefined;

  if (!query) {
    return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
  }

  try {
    if (type === "profile") {
      const profile = await fetchProfile(query);
      return NextResponse.json({ profile });
    }

    if (type === "hashtag") {
      const result = await fetchHashtagFeed(query, cursor);
      return NextResponse.json(result);
    }

    if (type === "resolve-user") {
      // Resolve user ID to username
      const user = await resolveUserId(query);
      if (!user) {
        return NextResponse.json({ error: "Could not resolve user" }, { status: 404 });
      }
      return NextResponse.json({ user });
    }

    // Default: keyword search (returns users + hashtags)
    const result = await searchInstagram(query);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
