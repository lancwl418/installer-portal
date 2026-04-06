"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Installer {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  _count: { uploads: number };
}

interface Candidate {
  id: string;
  instagramUsername: string;
  fullName: string | null;
  profilePicUrl: string | null;
  followerCount: number;
  status: string;
  createdAt: string;
}

interface Upload {
  id: string;
  fileType: string;
  status: string;
  createdAt: string;
  installer: { name: string };
}

function igProxy(url: string) {
  if (!url || (!url.includes("cdninstagram.com") && !url.includes("fbcdn.net"))) return url;
  return `/api/admin/instagram/proxy?url=${encodeURIComponent(url)}`;
}

const statusColors: Record<string, string> = {
  applied: "text-gray-500 bg-gray-100",
  approved: "text-blue-600 bg-blue-50",
  active: "text-green-600 bg-green-50",
  inactive: "text-red-500 bg-red-50",
  discovered: "text-blue-500 bg-blue-50",
  contacted: "text-yellow-600 bg-yellow-50",
  pending: "text-orange-500 bg-orange-50",
  rejected: "text-red-500 bg-red-50",
};

export default function DashboardPage() {
  const router = useRouter();
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/installers").then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      }),
      fetch("/api/admin/candidates").then((r) => r.ok ? r.json() : { candidates: [] }),
    ])
      .then(([instData, candData]) => {
        if (instData) setInstallers(instData.installers || []);
        setCandidates(candData.candidates || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const installerStats = {
    total: installers.length,
    active: installers.filter((i) => i.status === "active").length,
    approved: installers.filter((i) => i.status === "approved").length,
    applied: installers.filter((i) => i.status === "applied").length,
  };

  const candidateStats = {
    total: candidates.length,
    discovered: candidates.filter((c) => c.status === "discovered").length,
    contacted: candidates.filter((c) => c.status === "contacted").length,
    pending: candidates.filter((c) => c.status === "pending").length,
    approved: candidates.filter((c) => c.status === "approved").length,
  };

  const pendingUploads = installers.reduce((sum, i) => sum + i._count.uploads, 0);

  const recentInstallers = [...installers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentCandidates = [...candidates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of installer management</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Installers" value={installerStats.total} href="/admin/installers" />
        <StatCard label="Active Installers" value={installerStats.active} color="text-green-600" href="/admin/installers" />
        <StatCard label="Total Candidates" value={candidateStats.total} href="/admin/recruit" />
        <StatCard label="Pending Candidates" value={candidateStats.pending + candidateStats.discovered} color="text-orange-500" href="/admin/recruit" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Installers */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Installers</h2>
            <Link href="/admin/installers" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentInstallers.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No installers yet</p>
            ) : (
              recentInstallers.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/admin/installers/${inst.id}`}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0">
                    {inst.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{inst.name}</p>
                    <p className="text-xs text-gray-400">{inst.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[inst.status] || "text-gray-500 bg-gray-100"}`}>
                    {inst.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(inst.createdAt).toLocaleDateString()}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Candidates</h2>
            <Link href="/admin/recruit" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentCandidates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm mb-2">No candidates yet</p>
                <Link href="/admin/recruit" className="text-xs text-indigo-600 hover:underline">
                  Search Instagram to find candidates
                </Link>
              </div>
            ) : (
              recentCandidates.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-6 py-3">
                  {c.profilePicUrl ? (
                    <img
                      src={igProxy(c.profilePicUrl)}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                      @
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">@{c.instagramUsername}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {c.fullName || ""}
                      {c.followerCount > 0 && ` · ${c.followerCount.toLocaleString()} followers`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[c.status] || "text-gray-500 bg-gray-100"}`}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Installer status breakdown + Candidate pipeline */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Installer Pipeline</h2>
          <div className="space-y-3">
            {[
              { label: "Applied", count: installerStats.applied, color: "bg-gray-400" },
              { label: "Approved", count: installerStats.approved, color: "bg-blue-500" },
              { label: "Active", count: installerStats.active, color: "bg-green-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-20">{s.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${s.color}`}
                    style={{ width: installerStats.total ? `${(s.count / installerStats.total) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Candidate Pipeline</h2>
          <div className="space-y-3">
            {[
              { label: "Discovered", count: candidateStats.discovered, color: "bg-blue-400" },
              { label: "Contacted", count: candidateStats.contacted, color: "bg-yellow-500" },
              { label: "Pending", count: candidateStats.pending, color: "bg-orange-500" },
              { label: "Approved", count: candidateStats.approved, color: "bg-green-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-20">{s.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${s.color}`}
                    style={{ width: candidateStats.total ? `${(s.count / candidateStats.total) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, href }: { label: string; value: number; color?: string; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color || "text-gray-900"}`}>{value}</p>
    </Link>
  );
}
