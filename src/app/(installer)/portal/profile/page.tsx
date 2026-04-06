"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Installer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  instagramUsername: string | null;
  region: string | null;
  serviceArea: string | null;
  status: string;
}

export default function ProfilePage() {
  const [installer, setInstaller] = useState<Installer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.installer) {
          router.push("/login");
          return;
        }
        setInstaller(data.installer);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

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
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">My Profile</h1>
          <Link
            href="/portal"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Portal
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{installer.name}</h2>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[installer.status] || "bg-gray-100"}`}>
              {installer.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
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
            <div className="col-span-2">
              <p className="text-gray-500">Service Area</p>
              <p className="font-medium">{installer.serviceArea || "—"}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
