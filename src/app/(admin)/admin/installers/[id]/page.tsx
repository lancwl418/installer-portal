"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Upload {
  id: string;
  fileUrl: string;
  fileType: string;
  caption: string | null;
  status: string;
  reviewNote: string | null;
  createdAt: string;
}

interface Mention {
  id: string;
  username: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: string;
  caption: string | null;
  permalink: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
}

interface InstallerDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  instagramUsername: string | null;
  region: string | null;
  serviceArea: string | null;
  specialties: string | null;
  status: string;
  contractDate: string | null;
  notes: string | null;
  customerId: string | null;
  createdAt: string;
  uploads: Upload[];
}

const STATUSES = ["applied", "approved", "active", "inactive"];

export default function InstallerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [installer, setInstaller] = useState<InstallerDetail | null>(null);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"uploads" | "ugc">("uploads");

  function loadData() {
    fetch(`/api/admin/installers/${id}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setInstaller(data.installer);
          setMentions(data.mentions || []);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function updateStatus(status: string) {
    await fetch(`/api/admin/installers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadData();
  }

  async function reviewUpload(uploadId: string, status: string) {
    await fetch(`/api/admin/installers/${id}/uploads`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, status }),
    });
    loadData();
  }

  if (loading || !installer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    applied: "bg-gray-100 text-gray-700",
    approved: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/installers" className="text-gray-400 hover:text-gray-600">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">{installer.name}</h1>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[installer.status]}`}>
              {installer.status}
            </span>
          </div>
          <div className="flex gap-2">
            {STATUSES.filter((s) => s !== installer.status).map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50 capitalize transition"
              >
                Set {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Info card */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{installer.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{installer.phone || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Instagram</p>
              <p className="font-medium">
                {installer.instagramUsername ? `@${installer.instagramUsername}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Region</p>
              <p className="font-medium">{installer.region || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Service Area</p>
              <p className="font-medium">{installer.serviceArea || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Contract Date</p>
              <p className="font-medium">
                {installer.contractDate
                  ? new Date(installer.contractDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Shopify Customer ID</p>
              <p className="font-medium">{installer.customerId || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Joined</p>
              <p className="font-medium">{new Date(installer.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {installer.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-500 text-sm">Notes</p>
              <p className="text-sm mt-1">{installer.notes}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b">
          <button
            onClick={() => setTab("uploads")}
            className={`pb-2 text-sm font-medium border-b-2 transition ${
              tab === "uploads" ? "border-black text-black" : "border-transparent text-gray-500"
            }`}
          >
            Uploads ({installer.uploads.length})
          </button>
          <button
            onClick={() => setTab("ugc")}
            className={`pb-2 text-sm font-medium border-b-2 transition ${
              tab === "ugc" ? "border-black text-black" : "border-transparent text-gray-500"
            }`}
          >
            Instagram UGC ({mentions.length})
          </button>
        </div>

        {/* Uploads tab */}
        {tab === "uploads" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {installer.uploads.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-8">No uploads yet.</p>
            )}
            {installer.uploads.map((u) => (
              <div key={u.id} className="bg-white rounded-xl border overflow-hidden">
                <div className="h-48 bg-gray-100">
                  {u.fileType === "video" ? (
                    <video src={u.fileUrl} className="w-full h-full object-cover" muted playsInline controls preload="metadata" />
                  ) : (
                    <img src={u.fileUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      u.status === "approved" ? "bg-green-100 text-green-700"
                        : u.status === "rejected" ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {u.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {u.caption && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{u.caption}</p>}
                  {u.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => reviewUpload(u.id, "approved")}
                        className="flex-1 text-xs py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reviewUpload(u.id, "rejected")}
                        className="flex-1 text-xs py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* UGC tab */}
        {tab === "ugc" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mentions.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-8">
                {installer.instagramUsername
                  ? "No UGC posts found for this Instagram account."
                  : "No Instagram username linked."}
              </p>
            )}
            {mentions.map((m) => (
              <a
                key={m.id}
                href={m.permalink}
                target="_blank"
                rel="noreferrer"
                className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition"
              >
                <div className="h-48 bg-gray-100">
                  {m.mediaType === "VIDEO" ? (
                    <video src={m.mediaUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <img src={m.thumbnailUrl || m.mediaUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600 line-clamp-2">{m.caption || ""}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span>♥ {m.likeCount}</span>
                    <span>💬 {m.commentsCount}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
