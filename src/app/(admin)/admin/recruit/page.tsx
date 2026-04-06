"use client";

import { useState } from "react";
import Link from "next/link";

// ==================== Types ====================

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
  timestamp: number;
  is_video: boolean;
}

// ==================== Component ====================

export default function RecruitPage() {
  const [searchType, setSearchType] = useState<"search" | "profile" | "hashtag">("search");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search results
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [hashtags, setHashtags] = useState<SearchHashtag[]>([]);

  // Profile view
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsCursor, setPostsCursor] = useState<string | null>(null);
  const [postsMore, setPostsMore] = useState(false);

  // Hashtag feed
  const [hashtagPosts, setHashtagPosts] = useState<HashtagPost[]>([]);
  const [hashCursor, setHashCursor] = useState<string | null>(null);
  const [hashMore, setHashMore] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setProfile(null);
    setUserPosts([]);
    setHashtagPosts([]);

    try {
      const res = await fetch(
        `/api/admin/recruit?type=${searchType}&q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (searchType === "search") {
        setUsers(data.users || []);
        setHashtags(data.hashtags || []);
      } else if (searchType === "profile") {
        setProfile(data.profile);
        // Auto-fetch posts
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
      const res = await fetch(
        `/api/admin/recruit?type=profile&q=${encodeURIComponent(username)}`
      );
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
    } catch {
      // silent fail for posts
    } finally {
      setPostsLoading(false);
    }
  }

  async function loadMoreHashtag() {
    if (!hashCursor) return;
    setPostsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/recruit?type=hashtag&q=${encodeURIComponent(query)}&cursor=${encodeURIComponent(hashCursor)}`
      );
      const data = await res.json();
      setHashtagPosts((prev) => [...prev, ...(data.posts || [])]);
      setHashCursor(data.next_cursor);
      setHashMore(data.more);
    } catch {
      // silent
    } finally {
      setPostsLoading(false);
    }
  }

  function clearResults() {
    setProfile(null);
    setUsers([]);
    setHashtags([]);
    setUserPosts([]);
    setHashtagPosts([]);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/installers" className="text-gray-400 hover:text-gray-600">
              ← Installers
            </Link>
            <h1 className="text-xl font-bold">Recruit</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl border p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex border rounded-lg overflow-hidden text-sm">
              {(["search", "profile", "hashtag"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setSearchType(t); clearResults(); }}
                  className={`px-4 py-2 capitalize transition ${
                    searchType === t ? "bg-black text-white" : "bg-white text-gray-600 hover:bg-gray-50"
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
                searchType === "profile"
                  ? "Enter Instagram username..."
                  : searchType === "hashtag"
                  ? "Enter hashtag (without #)..."
                  : "Search users, hashtags..."
              }
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl border border-red-200 p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Profile view */}
        {profile && (
          <div className="mb-6">
            <ProfileCard
              profile={profile}
              onBack={clearResults}
            />
            <h3 className="text-lg font-semibold mt-6 mb-4">Recent Posts</h3>
            <PostsGrid
              posts={userPosts.map((p) => ({
                id: p.id,
                image_url: p.image_url,
                caption: p.caption,
                like_count: p.like_count,
                comment_count: p.comment_count,
                is_video: p.media_type === 2,
                timestamp: p.timestamp,
              }))}
            />
            {postsMore && (
              <div className="text-center mt-4">
                <button
                  onClick={() => loadUserPosts(profile.pk, postsCursor || undefined)}
                  disabled={postsLoading}
                  className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  {postsLoading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Keyword search results */}
        {users.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Users ({users.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {users.map((u) => (
                <button
                  key={u.pk}
                  onClick={() => viewProfile(u.username)}
                  className="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-md transition text-left w-full"
                >
                  <img
                    src={u.profile_pic_url}
                    alt={u.username}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      @{u.username}
                      {u.is_verified && <span className="ml-1 text-blue-500">✓</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.full_name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {hashtags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Hashtags ({hashtags.length})</h3>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((h) => (
                <button
                  key={h.name}
                  onClick={() => {
                    setSearchType("hashtag");
                    setQuery(h.name);
                    clearResults();
                    // Trigger search
                    fetch(`/api/admin/recruit?type=hashtag&q=${encodeURIComponent(h.name)}`)
                      .then((r) => r.json())
                      .then((data) => {
                        setHashtagPosts(data.posts || []);
                        setHashCursor(data.next_cursor);
                        setHashMore(data.more);
                      });
                  }}
                  className="px-4 py-2 bg-white border rounded-full text-sm hover:bg-gray-50 transition"
                >
                  #{h.name}
                  <span className="text-gray-400 ml-1">
                    {h.media_count > 1000000
                      ? `${(h.media_count / 1000000).toFixed(1)}M`
                      : h.media_count > 1000
                      ? `${(h.media_count / 1000).toFixed(0)}K`
                      : h.media_count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hashtag feed */}
        {hashtagPosts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">#{query} Posts</h3>
            <PostsGrid posts={hashtagPosts} />
            {hashMore && (
              <div className="text-center mt-4">
                <button
                  onClick={loadMoreHashtag}
                  disabled={postsLoading}
                  className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  {postsLoading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ==================== Sub-components ====================

function ProfileCard({
  profile,
  onBack,
}: {
  profile: UserProfile;
  onBack: () => void;
}) {
  const fmt = (n: number) =>
    n >= 1000000
      ? `${(n / 1000000).toFixed(1)}M`
      : n >= 1000
      ? `${(n / 1000).toFixed(1)}K`
      : String(n);

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-start gap-6">
        <img
          src={profile.hd_profile_pic_url || profile.profile_pic_url}
          alt={profile.username}
          className="w-24 h-24 rounded-full object-cover flex-shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold">@{profile.username}</h2>
            {profile.is_verified && <span className="text-blue-500 text-lg">✓</span>}
            {profile.category && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {profile.category}
              </span>
            )}
          </div>
          <p className="text-gray-700 font-medium">{profile.full_name}</p>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{profile.biography}</p>
          {profile.external_url && (
            <a
              href={profile.external_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              {profile.external_url}
            </a>
          )}

          <div className="flex gap-6 mt-4">
            <div>
              <p className="text-lg font-bold">{fmt(profile.media_count)}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div>
              <p className="text-lg font-bold">{fmt(profile.follower_count)}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold">{fmt(profile.following_count)}</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          <a
            href={`https://instagram.com/${profile.username}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition text-center"
          >
            Open IG
          </a>
        </div>
      </div>
    </div>
  );
}

function PostsGrid({
  posts,
}: {
  posts: {
    id: string;
    image_url: string;
    caption: string;
    like_count: number;
    comment_count: number;
    is_video?: boolean;
    timestamp: number;
  }[];
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {posts.map((post, idx) => (
          <div
            key={post.id}
            onClick={() => setSelected(idx)}
            className="bg-white rounded-xl border overflow-hidden cursor-pointer hover:shadow-md transition group relative"
          >
            <div className="aspect-square bg-gray-100">
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            {post.is_video && (
              <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                Video
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-4 text-white text-sm font-medium">
                <span>♥ {post.like_count}</span>
                <span>💬 {post.comment_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post detail modal */}
      {selected !== null && posts[selected] && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 bg-black flex items-center justify-center min-w-0">
              {posts[selected].image_url && (
                <img
                  src={posts[selected].image_url}
                  alt=""
                  className="max-w-full max-h-[90vh] object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="w-80 flex-shrink-0 p-5 overflow-y-auto">
              <button
                onClick={() => setSelected(null)}
                className="float-right text-2xl text-gray-400 hover:text-gray-600 leading-none"
              >
                &times;
              </button>
              <div className="flex gap-4 text-sm text-gray-500 mb-3">
                <span>♥ {posts[selected].like_count} likes</span>
                <span>💬 {posts[selected].comment_count}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {posts[selected].caption || "No caption"}
              </p>
              <p className="text-xs text-gray-400 mt-3">
                {posts[selected].timestamp
                  ? new Date(posts[selected].timestamp * 1000).toLocaleDateString()
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
