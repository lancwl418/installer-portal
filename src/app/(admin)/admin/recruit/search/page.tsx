"use client";

import { useState } from "react";
import Link from "next/link";

interface SearchUser {
  username: string;
  full_name: string;
  profile_pic_url: string;
  pk: string;
  is_verified: boolean;
}

interface SearchHashtag {
  name: string;
  media_count: number;
}

interface UserProfile {
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

interface UserPost {
  id: string;
  image_url: string;
  caption: string;
  like_count: number;
  comment_count: number;
  media_type: number;
  timestamp: number;
}

interface HashtagPost {
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

function igProxy(url: string) {
  if (!url || (!url.includes("cdninstagram.com") && !url.includes("fbcdn.net"))) return url;
  return `/api/admin/instagram/proxy?url=${encodeURIComponent(url)}`;
}

export default function RecruitSearchPage() {
  const [searchType, setSearchType] = useState<"search" | "profile" | "hashtag">("search");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState<SearchUser[]>([]);
  const [hashtags, setHashtags] = useState<SearchHashtag[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsCursor, setPostsCursor] = useState<string | null>(null);
  const [postsMore, setPostsMore] = useState(false);
  const [hashtagPosts, setHashtagPosts] = useState<HashtagPost[]>([]);
  const [hashCursor, setHashCursor] = useState<string | null>(null);
  const [hashMore, setHashMore] = useState(false);
  const [addingCandidate, setAddingCandidate] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setProfile(null);
    setUserPosts([]);
    setHashtagPosts([]);

    try {
      const res = await fetch(`/api/admin/recruit?type=${searchType}&q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (searchType === "search") {
        setUsers(data.users || []);
        setHashtags(data.hashtags || []);
      } else if (searchType === "profile") {
        setProfile(data.profile);
        loadUserPosts(data.profile.pk, undefined, true);
      } else if (searchType === "hashtag") {
        setHashtagPosts(data.posts || []);
        setHashCursor(data.next_cursor);
        setHashMore(data.more);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function viewProfile(username: string) {
    setLoading(true);
    setError("");
    setUsers([]);
    setHashtags([]);
    setHashtagPosts([]);

    try {
      const res = await fetch(`/api/admin/recruit?type=profile&q=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data.profile);
      loadUserPosts(data.profile.pk, undefined, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function loadUserPosts(userId: string, cursor?: string, reset = false) {
    setPostsLoading(true);
    try {
      let url = `/api/admin/recruit/user-posts?id=${userId}`;
      if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]));
      setPostsCursor(data.next_cursor);
      setPostsMore(data.more);
    } catch { /* silent */ }
    finally { setPostsLoading(false); }
  }

  async function loadMoreHashtag() {
    if (!hashCursor) return;
    setPostsLoading(true);
    try {
      const res = await fetch(`/api/admin/recruit?type=hashtag&q=${encodeURIComponent(query)}&cursor=${encodeURIComponent(hashCursor)}`);
      const data = await res.json();
      setHashtagPosts((prev) => [...prev, ...(data.posts || [])]);
      setHashCursor(data.next_cursor);
      setHashMore(data.more);
    } catch { /* silent */ }
    finally { setPostsLoading(false); }
  }

  async function addAsCandidate(p: UserProfile) {
    setAddingCandidate(true);
    try {
      const res = await fetch("/api/admin/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramUsername: p.username,
          fullName: p.full_name,
          profilePicUrl: p.hd_profile_pic_url || p.profile_pic_url,
          biography: p.biography,
          followerCount: p.follower_count,
          followingCount: p.following_count,
          mediaCount: p.media_count,
          isVerified: p.is_verified,
          category: p.category,
          externalUrl: p.external_url,
          source: `search:${query}`,
        }),
      });
      const data = await res.json();
      if (res.status === 409) alert(`@${p.username} is already in candidates`);
      else if (!res.ok) alert(data.error || "Failed");
      else alert(`@${p.username} added as candidate!`);
    } catch { alert("Network error"); }
    finally { setAddingCandidate(false); }
  }

  function clearResults() {
    setProfile(null);
    setUsers([]);
    setHashtags([]);
    setUserPosts([]);
    setHashtagPosts([]);
    setError("");
  }

  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/recruit" className="text-gray-400 hover:text-gray-600 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Instagram</h1>
          <p className="text-sm text-gray-500 mt-1">Find potential installers by username, keyword, or hashtag</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex gap-3">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-sm">
            {(["search", "profile", "hashtag"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setSearchType(t); clearResults(); }}
                className={`px-4 py-2.5 capitalize transition font-medium ${
                  searchType === t ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t === "search" ? "Keyword" : t === "profile" ? "Username" : "Hashtag"}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchType === "profile" ? "Enter Instagram username..."
                : searchType === "hashtag" ? "Enter hashtag (without #)..."
                : "Search users, hashtags..."
            }
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl border border-red-200 p-4 mb-6 text-sm">{error}</div>
      )}

      {/* Profile view */}
      {profile && (
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-6">
              <img
                src={igProxy(profile.hd_profile_pic_url || profile.profile_pic_url)}
                alt={profile.username}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">@{profile.username}</h2>
                  {profile.is_verified && <span className="text-blue-500 text-lg">✓</span>}
                  {profile.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{profile.category}</span>}
                </div>
                <p className="text-gray-700 font-medium">{profile.full_name}</p>
                <p className="text-sm text-gray-500 mt-2 whitespace-pre-line line-clamp-3">{profile.biography}</p>
                {profile.external_url && (
                  <a href={profile.external_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline mt-1 inline-block">{profile.external_url}</a>
                )}
                <div className="flex gap-6 mt-4">
                  <div><p className="text-lg font-bold text-gray-900">{fmt(profile.media_count)}</p><p className="text-xs text-gray-500">Posts</p></div>
                  <div><p className="text-lg font-bold text-gray-900">{fmt(profile.follower_count)}</p><p className="text-xs text-gray-500">Followers</p></div>
                  <div><p className="text-lg font-bold text-gray-900">{fmt(profile.following_count)}</p><p className="text-xs text-gray-500">Following</p></div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => addAsCandidate(profile)} disabled={addingCandidate} className="px-4 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition font-medium">
                  {addingCandidate ? "Adding..." : "+ Add Candidate"}
                </button>
                <button onClick={clearResults} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600">← Back</button>
                <a href={`https://instagram.com/${profile.username}`} target="_blank" rel="noreferrer" className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition text-center text-gray-600">Open IG ↗</a>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-900">Recent Posts</h3>
          <PostsGrid posts={userPosts.map((p) => ({ id: p.id, image_url: p.image_url, caption: p.caption, like_count: p.like_count, comment_count: p.comment_count, is_video: p.media_type === 2, timestamp: p.timestamp }))} />
          {postsMore && (
            <div className="text-center mt-4">
              <button onClick={() => loadUserPosts(profile.pk, postsCursor || undefined)} disabled={postsLoading} className="px-6 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition">{postsLoading ? "Loading..." : "Load More"}</button>
            </div>
          )}
        </div>
      )}

      {/* Keyword search results */}
      {users.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Users ({users.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {users.map((u) => (
              <button key={u.pk} onClick={() => viewProfile(u.username)} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition text-left w-full">
                <img src={igProxy(u.profile_pic_url)} alt={u.username} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">@{u.username}{u.is_verified && <span className="ml-1 text-blue-500">✓</span>}</p>
                  <p className="text-xs text-gray-500 truncate">{u.full_name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {hashtags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Hashtags ({hashtags.length})</h3>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((h) => (
              <button key={h.name} onClick={() => { setSearchType("hashtag"); setQuery(h.name); clearResults(); fetch(`/api/admin/recruit?type=hashtag&q=${encodeURIComponent(h.name)}`).then((r) => r.json()).then((data) => { setHashtagPosts(data.posts || []); setHashCursor(data.next_cursor); setHashMore(data.more); }); }} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50 transition text-gray-700">
                #{h.name}<span className="text-gray-400 ml-1">{h.media_count > 1000000 ? `${(h.media_count / 1000000).toFixed(1)}M` : h.media_count > 1000 ? `${(h.media_count / 1000).toFixed(0)}K` : h.media_count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hashtag feed */}
      {hashtagPosts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">#{query} Posts</h3>
          <PostsGrid posts={hashtagPosts} onViewProfile={viewProfile} />
          {hashMore && (
            <div className="text-center mt-4">
              <button onClick={loadMoreHashtag} disabled={postsLoading} className="px-6 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition">{postsLoading ? "Loading..." : "Load More"}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== PostsGrid ====================

function PostsGrid({ posts, onViewProfile }: {
  posts: { id: string; image_url: string; caption: string; like_count: number; comment_count: number; is_video?: boolean; timestamp: number; shortcode?: string; owner_id?: string }[];
  onViewProfile?: (username: string) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [resolvedOwner, setResolvedOwner] = useState<{ username: string; full_name: string; profile_pic_url: string } | null>(null);
  const [resolving, setResolving] = useState(false);

  function handleSelect(idx: number) {
    setSelected(idx);
    setResolvedOwner(null);
    const post = posts[idx];
    if (post.owner_id) {
      setResolving(true);
      fetch(`/api/admin/recruit?type=resolve-user&q=${post.owner_id}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data?.user) setResolvedOwner(data.user); })
        .catch(() => {})
        .finally(() => setResolving(false));
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {posts.map((post, idx) => (
          <div key={post.id} onClick={() => handleSelect(idx)} className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition group relative">
            <div className="aspect-square bg-gray-100 relative">
              {post.image_url ? <img src={igProxy(post.image_url)} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : null}
              <div className="absolute inset-0 flex items-end p-2 pointer-events-none">
                <div className="flex gap-2 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                  <span>♥ {post.like_count}</span><span>💬 {post.comment_count}</span>
                </div>
              </div>
            </div>
            {post.is_video && <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">Video</span>}
            {post.shortcode && <a href={`https://instagram.com/p/${post.shortcode}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded hover:bg-black/80">IG ↗</a>}
          </div>
        ))}
      </div>

      {selected !== null && posts[selected] && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 bg-black flex items-center justify-center min-w-0">
              {posts[selected].image_url && <img src={igProxy(posts[selected].image_url)} alt="" className="max-w-full max-h-[90vh] object-contain" />}
            </div>
            <div className="w-80 flex-shrink-0 p-5 overflow-y-auto">
              <button onClick={() => setSelected(null)} className="float-right text-2xl text-gray-400 hover:text-gray-600 leading-none">&times;</button>
              <div className="mb-3 pb-3 border-b border-gray-100">
                {resolving ? <p className="text-xs text-gray-400">Loading author...</p> : resolvedOwner ? (
                  <div className="flex items-center gap-3">
                    <img src={igProxy(resolvedOwner.profile_pic_url)} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <button onClick={() => { setSelected(null); onViewProfile?.(resolvedOwner.username); }} className="text-sm font-semibold text-indigo-600 hover:underline">@{resolvedOwner.username}</button>
                      <p className="text-xs text-gray-400 truncate">{resolvedOwner.full_name}</p>
                    </div>
                  </div>
                ) : posts[selected].shortcode ? <a href={`https://instagram.com/p/${posts[selected].shortcode}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">View on Instagram ↗</a> : null}
              </div>
              <div className="flex gap-4 text-sm text-gray-500 mb-3"><span>♥ {posts[selected].like_count} likes</span><span>💬 {posts[selected].comment_count}</span></div>
              <p className="text-sm text-gray-700 whitespace-pre-line">{posts[selected].caption || "No caption"}</p>
              <div className="flex items-center gap-3 mt-3">
                <p className="text-xs text-gray-400">{posts[selected].timestamp ? new Date(posts[selected].timestamp * 1000).toLocaleDateString() : ""}</p>
                {posts[selected].shortcode && <a href={`https://instagram.com/p/${posts[selected].shortcode}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline" onClick={(e) => e.stopPropagation()}>Open in Instagram</a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
