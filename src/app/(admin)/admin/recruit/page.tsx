"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Candidate {
  id: string;
  instagramUsername: string;
  fullName: string | null;
  profilePicUrl: string | null;
  biography: string | null;
  followerCount: number;
  followingCount: number;
  mediaCount: number;
  isVerified: boolean;
  category: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  createdAt: string;
}

const CANDIDATE_STATUSES = ["discovered", "contacted", "pending", "approved", "rejected"];
const statusColors: Record<string, string> = {
  discovered: "text-blue-500 bg-blue-50",
  contacted: "text-yellow-600 bg-yellow-50",
  pending: "text-orange-500 bg-orange-50",
  approved: "text-green-600 bg-green-50",
  rejected: "text-red-500 bg-red-50",
};

function igProxy(url: string) {
  if (!url || (!url.includes("cdninstagram.com") && !url.includes("fbcdn.net"))) return url;
  return `/api/admin/instagram/proxy?url=${encodeURIComponent(url)}`;
}

export default function RecruitPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  function loadCandidates() {
    setLoading(true);
    const url = filterStatus === "all"
      ? "/api/admin/candidates"
      : `/api/admin/candidates?status=${filterStatus}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setCandidates(data.candidates || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadCandidates(); }, [filterStatus]);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/candidates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadCandidates();
  }

  async function deleteCandidate(id: string) {
    if (!confirm("Remove this candidate?")) return;
    await fetch(`/api/admin/candidates?id=${id}`, { method: "DELETE" });
    loadCandidates();
  }

  const counts: Record<string, number> = { all: 0 };
  CANDIDATE_STATUSES.forEach((s) => { counts[s] = 0; });
  candidates.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; counts.all++; });
  // If filtering server-side, all count is just the current list length
  if (filterStatus === "all") {
    counts.all = candidates.length;
  }

  const filtered = candidates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.instagramUsername.toLowerCase().includes(q) ||
      (c.fullName?.toLowerCase().includes(q) ?? false) ||
      (c.biography?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-sm text-gray-500 mt-1">Manage recruitment candidates from Instagram</p>
        </div>
        <Link
          href="/admin/recruit/search"
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Search Instagram
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6">
        {["all", ...CANDIDATE_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              filterStatus === s
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {s}
            <span className={`ml-1.5 ${filterStatus === s ? "text-gray-300" : "text-gray-400"}`}>
              {counts[s] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter candidates..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
          <p className="text-gray-400 mb-4">{search ? "No results found" : "No candidates yet"}</p>
          <Link
            href="/admin/recruit/search"
            className="inline-flex px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search Instagram to find candidates
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Followers</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Posts</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Added</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.profilePicUrl ? (
                        <img
                          src={igProxy(c.profilePicUrl)}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">@</div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://instagram.com/${c.instagramUsername}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition"
                          >
                            @{c.instagramUsername}
                          </a>
                          {c.isVerified && <span className="text-blue-500 text-xs">✓</span>}
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                          {c.fullName || c.biography || ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={c.status}
                      onChange={(e) => updateStatus(c.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer capitalize ${statusColors[c.status] || "text-gray-500 bg-gray-100"}`}
                    >
                      {CANDIDATE_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {c.followerCount > 0 ? c.followerCount.toLocaleString() : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {c.mediaCount > 0 ? c.mediaCount.toLocaleString() : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {c.source || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://instagram.com/${c.instagramUsername}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gray-400 hover:text-indigo-500 transition"
                      >
                        IG ↗
                      </a>
                      <button
                        onClick={() => deleteCandidate(c.id)}
                        className="text-xs text-gray-300 hover:text-red-500 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
