"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Button, Chip } from "@heroui/react";

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

const statusColorMap: Record<string, "default" | "accent" | "success" | "danger"> = {
  applied: "default",
  approved: "accent",
  active: "success",
  inactive: "danger",
};

export default function ProfilePage() {
  const [installer, setInstaller] = useState<Installer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.installer) { router.push("/login"); return; }
        setInstaller(data.installer);
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

  const fields = [
    { label: "Email", value: installer.email },
    { label: "Phone", value: installer.phone },
    { label: "Instagram", value: installer.instagramUsername ? `@${installer.instagramUsername}` : null },
    { label: "Region", value: installer.region },
    { label: "Service Area", value: installer.serviceArea },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">My Profile</h1>
          <Link href="/portal"><Button variant="ghost" size="sm">← Back to Portal</Button></Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{installer.name}</h2>
              <Chip color={statusColorMap[installer.status]} variant="soft" size="sm">
                {installer.status}
              </Chip>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.label}>
                  <p className="text-sm text-default-400">{f.label}</p>
                  <p className="font-medium text-sm">{f.value || "—"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
