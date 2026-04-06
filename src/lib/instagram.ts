// Instagram RapidAPI wrapper for recruitment discovery

const RAPIDAPI_HOST = "instagram-looter2.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "bb64496e28msh404e742bb7f1073p1b3d4cjsnaa39242a4d5e";

const headers = {
  "Content-Type": "application/json",
  "x-rapidapi-host": RAPIDAPI_HOST,
  "x-rapidapi-key": RAPIDAPI_KEY,
};

// ==================== Search (users + hashtags) ====================

export interface SearchUser {
  username: string;
  full_name: string;
  profile_pic_url: string;
  pk: string;
  is_verified: boolean;
}

export interface SearchHashtag {
  name: string;
  media_count: number;
  id: number;
}

export interface SearchResult {
  users: SearchUser[];
  hashtags: SearchHashtag[];
}

export async function searchInstagram(query: string): Promise<SearchResult> {
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(query)}`,
    { headers }
  );
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();

  return {
    users: (data.users || []).map((u: any) => ({
      username: u.user?.username || "",
      full_name: u.user?.full_name || "",
      profile_pic_url: u.user?.profile_pic_url || "",
      pk: String(u.user?.pk || ""),
      is_verified: u.user?.is_verified || false,
    })),
    hashtags: (data.hashtags || []).map((h: any) => ({
      name: h.hashtag?.name || "",
      media_count: h.hashtag?.media_count || 0,
      id: h.hashtag?.id || 0,
    })),
  };
}

// ==================== Profile lookup ====================

export interface UserProfile {
  username: string;
  full_name: string;
  biography: string;
  profile_pic_url: string;
  hd_profile_pic_url: string | null;
  follower_count: number;
  following_count: number;
  media_count: number;
  is_verified: boolean;
  is_business: boolean;
  category: string | null;
  external_url: string | null;
  pk: string;
}

export async function fetchProfile(username: string): Promise<UserProfile> {
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/profile2?username=${encodeURIComponent(username)}`,
    { headers }
  );
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  const d = await res.json();
  if (!d.status) throw new Error(`Profile not found: @${username}`);

  return {
    username: d.username || "",
    full_name: d.full_name || "",
    biography: d.biography || "",
    profile_pic_url: d.profile_pic_url || "",
    hd_profile_pic_url: d.hd_profile_pic_url_info?.url || null,
    follower_count: d.follower_count || 0,
    following_count: d.following_count || 0,
    media_count: d.media_count || 0,
    is_verified: d.is_verified || false,
    is_business: d.is_business || false,
    category: d.category || null,
    external_url: d.external_url || null,
    pk: String(d.pk || ""),
  };
}

// ==================== User posts ====================

export interface UserPost {
  id: string;
  image_url: string;
  caption: string;
  like_count: number;
  comment_count: number;
  media_type: number; // 1=image, 2=video, 8=carousel
  timestamp: number;
}

export async function fetchUserPosts(
  userId: string,
  endCursor?: string
): Promise<{ posts: UserPost[]; next_cursor: string | null; more: boolean }> {
  let url = `https://${RAPIDAPI_HOST}/user-feeds?id=${userId}`;
  if (endCursor) url += `&end_cursor=${encodeURIComponent(endCursor)}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`User posts fetch failed: ${res.status}`);
  const data = await res.json();

  const posts: UserPost[] = (data.items || []).map((item: any) => {
    let image_url = "";
    if (item.image_versions2?.candidates?.[0]) {
      image_url = item.image_versions2.candidates[0].url;
    } else if (item.carousel_media?.[0]?.image_versions2?.candidates?.[0]) {
      image_url = item.carousel_media[0].image_versions2.candidates[0].url;
    }

    return {
      id: String(item.pk || item.id || ""),
      image_url,
      caption: item.caption?.text || "",
      like_count: item.like_count || 0,
      comment_count: item.comment_count || 0,
      media_type: item.media_type || 1,
      timestamp: item.taken_at || 0,
    };
  });

  return {
    posts,
    next_cursor: data.next_max_id || null,
    more: data.more_available || false,
  };
}

// ==================== Resolve user ID to username ====================

export interface ResolvedUser {
  username: string;
  full_name: string;
  profile_pic_url: string;
  pk: string;
}

export async function resolveUserId(userId: string): Promise<ResolvedUser | null> {
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/user-feeds?id=${userId}`,
    { headers }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const user = data.items?.[0]?.user;
  if (!user?.username) return null;
  return {
    username: user.username,
    full_name: user.full_name || "",
    profile_pic_url: user.profile_pic_url || "",
    pk: String(user.pk || userId),
  };
}

// ==================== Hashtag feed ====================

export interface HashtagPost {
  id: string;
  shortcode: string;
  image_url: string;
  caption: string;
  like_count: number;
  comment_count: number;
  owner_id: string;
  owner_username: string;
  timestamp: number;
  is_video: boolean;
}

export async function fetchHashtagFeed(
  hashtag: string,
  endCursor?: string
): Promise<{ posts: HashtagPost[]; next_cursor: string | null; more: boolean }> {
  let url = `https://${RAPIDAPI_HOST}/tag-feeds?query=${encodeURIComponent(hashtag)}`;
  if (endCursor) url += `&end_cursor=${encodeURIComponent(endCursor)}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Hashtag feed failed: ${res.status}`);
  const data = await res.json();

  const edges =
    data.data?.hashtag?.edge_hashtag_to_media?.edges || [];
  const pageInfo =
    data.data?.hashtag?.edge_hashtag_to_media?.page_info || {};

  const posts: HashtagPost[] = edges.map((e: any) => {
    const n = e.node || {};
    return {
      id: String(n.id || ""),
      shortcode: n.shortcode || "",
      image_url: n.display_url || n.thumbnail_src || "",
      caption:
        n.edge_media_to_caption?.edges?.[0]?.node?.text || "",
      like_count: n.edge_liked_by?.count || n.edge_media_preview_like?.count || 0,
      comment_count: n.edge_media_to_comment?.count || 0,
      owner_id: String(n.owner?.id || ""),
      owner_username: "",
      timestamp: n.taken_at_timestamp || 0,
      is_video: n.is_video || false,
    };
  });

  return {
    posts,
    next_cursor: pageInfo.has_next_page ? pageInfo.end_cursor : null,
    more: pageInfo.has_next_page || false,
  };
}
