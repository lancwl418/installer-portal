import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const RAPIDAPI_HOST = "instagram-looter2.p.rapidapi.com";

async function fetchInstagram(endpoint: string, params: Record<string, string>) {
  const url = new URL(`https://${RAPIDAPI_HOST}${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": RAPIDAPI_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram API error: ${res.status} ${text}`);
  }

  return res.json();
}

// GET /api/admin/instagram?type=profile&username=xxx
// GET /api/admin/instagram?type=search&query=xxx
// GET /api/admin/instagram?type=hashtag&query=xxx
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    if (type === "profile") {
      const username = searchParams.get("username");
      if (!username) {
        return NextResponse.json({ error: "username required" }, { status: 400 });
      }
      const data = await fetchInstagram("/profile", { username });
      return NextResponse.json(data);
    }

    if (type === "search") {
      const query = searchParams.get("query");
      if (!query) {
        return NextResponse.json({ error: "query required" }, { status: 400 });
      }
      const data = await fetchInstagram("/search", { query });
      return NextResponse.json(data);
    }

    if (type === "hashtag") {
      const query = searchParams.get("query");
      if (!query) {
        return NextResponse.json({ error: "query required" }, { status: 400 });
      }
      const data = await fetchInstagram("/tag-feeds", { query });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid type. Use: profile, search, hashtag" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch Instagram data" },
      { status: 502 }
    );
  }
}
