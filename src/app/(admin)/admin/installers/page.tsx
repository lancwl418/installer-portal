"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Installer {
  id: string;
  name: string;
  email: string;
  instagramUsername: string | null;
  status: string;
  region: string | null;
  createdAt: string;
  _count: { uploads: number };
}

export default function AdminInstallersPage() {
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  function loadInstallers() {
    fetch("/api/admin/installers")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setInstallers(data.installers || []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadInstallers();
  }, []);

  const statusColor: Record<string, string> = {
    applied: "bg-gray-100 text-gray-700",
    approved: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Installer Management</h1>
          <div className="flex gap-3">
            <Link
              href="/admin/recruit"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Recruit
            </Link>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              + Add Installer
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-3xl font-bold">{installers.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-3xl font-bold text-green-600">
              {installers.filter((i) => i.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-3xl font-bold text-blue-600">
              {installers.filter((i) => i.status === "approved").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border">
            <p className="text-sm text-gray-500">Applied</p>
            <p className="text-3xl font-bold text-gray-600">
              {installers.filter((i) => i.status === "applied").length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Instagram</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Region</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Uploads</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {installers.map((inst) => (
                <tr key={inst.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{inst.name}</td>
                  <td className="px-4 py-3 text-gray-600">{inst.email}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {inst.instagramUsername ? `@${inst.instagramUsername}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{inst.region || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[inst.status] || "bg-gray-100"}`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{inst._count.uploads}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/installers/${inst.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {installers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No installers yet. Click &quot;+ Add Installer&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create modal */}
      {showCreate && (
        <CreateInstallerModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadInstallers();
          }}
        />
      )}
    </div>
  );
}

function CreateInstallerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    instagramUsername: "",
    region: "",
    serviceArea: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/installers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create");
        return;
      }
      onCreated();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Add New Installer</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {(["name", "email", "password", "phone", "instagramUsername", "region", "serviceArea"] as const).map(
            (field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field === "instagramUsername" ? "Instagram Username" : field === "serviceArea" ? "Service Area" : field}
                  {["name", "email", "password"].includes(field) && " *"}
                </label>
                <input
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  required={["name", "email", "password"].includes(field)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>
            )
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 text-sm transition"
            >
              {loading ? "Creating..." : "Create Installer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
