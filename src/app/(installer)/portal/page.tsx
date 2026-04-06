"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Upload {
  id: string;
  fileUrl: string;
  fileType: string;
  caption: string;
  status: string;
  createdAt: string;
}

interface Installer {
  id: string;
  name: string;
  email: string;
  status: string;
  instagramUsername: string | null;
}

export default function PortalPage() {
  const [installer, setInstaller] = useState<Installer | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/uploads").then((r) => r.json()),
    ])
      .then(([meData, uploadData]) => {
        if (!meData.installer) {
          router.push("/login");
          return;
        }
        setInstaller(meData.installer);
        setUploads(uploadData.uploads || []);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!installer) return null;

  const pending = uploads.filter((u) => u.status === "pending").length;
  const approved = uploads.filter((u) => u.status === "approved").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Welcome, {installer.name}</h1>
            <p className="text-sm text-gray-500">{installer.email}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/portal/upload"
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Upload Media
            </Link>
            <Link
              href="/portal/profile"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border">
            <p className="text-sm text-gray-500">Total Uploads</p>
            <p className="text-3xl font-bold">{uploads.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border">
            <p className="text-sm text-gray-500">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600">{pending}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-3xl font-bold text-green-600">{approved}</p>
          </div>
        </div>

        {/* Recent uploads */}
        <h2 className="text-lg font-semibold mb-4">Your Uploads</h2>
        {uploads.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
            <p>No uploads yet.</p>
            <Link href="/portal/upload" className="text-blue-600 underline mt-2 inline-block">
              Upload your first media
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploads.map((u) => (
              <div key={u.id} className="bg-white rounded-xl border overflow-hidden">
                <div className="h-48 bg-gray-100">
                  {u.fileType === "video" ? (
                    <video
                      src={u.fileUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={u.fileUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      u.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : u.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {u.status}
                  </span>
                  {u.caption && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{u.caption}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
