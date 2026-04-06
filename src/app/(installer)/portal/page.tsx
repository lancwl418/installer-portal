"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Button, Chip } from "@heroui/react";
import Image from "next/image";

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
        if (!meData.installer) { router.push("/login"); return; }
        setInstaller(meData.installer);
        setUploads(uploadData.uploads || []);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !installer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-default-500">Loading...</p>
      </div>
    );
  }

  const pending = uploads.filter((u) => u.status === "pending").length;
  const approved = uploads.filter((u) => u.status === "approved").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Welcome, {installer.name}</h1>
            <p className="text-sm text-default-400">{installer.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/portal/upload">
              <Button variant="solid" size="sm">Upload Media</Button>
            </Link>
            <Link href="/portal/profile">
              <Button variant="bordered" size="sm">Profile</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Uploads", value: uploads.length },
            { label: "Pending Review", value: pending, color: "warning" as const },
            { label: "Approved", value: approved, color: "success" as const },
          ].map((s) => (
            <Card key={s.label} shadow="sm">
              <CardContent className="text-center py-5">
                <p className="text-sm text-default-500">{s.label}</p>
                <p className="text-3xl font-bold mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-4">Your Uploads</h2>
        {uploads.length === 0 ? (
          <Card shadow="sm">
            <CardContent className="text-center py-8">
              <p className="text-default-400">No uploads yet.</p>
              <Link href="/portal/upload">
                <Button variant="flat" className="mt-3">Upload your first media</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploads.map((u) => (
              <Card key={u.id} shadow="sm">
                <div className="h-48 bg-gray-100">
                  {u.fileType === "video" ? (
                    <video src={u.fileUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <Image src={u.fileUrl} alt="" className="w-full h-48 object-cover" width={400} height={300} />
                  )}
                </div>
                <CardContent className="p-3 gap-2">
                  <div className="flex items-center justify-between">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={u.status === "approved" ? "success" : u.status === "rejected" ? "danger" : "warning"}
                    >
                      {u.status}
                    </Chip>
                    <span className="text-xs text-default-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {u.caption && <p className="text-sm text-default-500 line-clamp-2">{u.caption}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
