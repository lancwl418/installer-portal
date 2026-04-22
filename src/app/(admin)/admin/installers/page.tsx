"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Modal, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalBody, ModalFooter,
  TextField, Label, Input,
  useOverlayState,
} from "@heroui/react";

interface Installer {
  id: string;
  name: string;
  email: string;
  instagramUsername: string | null;
  avatarUrl: string | null;
  status: string;
  region: string | null;
  createdAt: string;
  _count: { uploads: number };
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "applied", label: "Applied" },
  { key: "approved", label: "Approved" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

const statusColors: Record<string, string> = {
  applied: "text-gray-500 bg-gray-100",
  approved: "text-blue-600 bg-blue-50",
  active: "text-green-600 bg-green-50",
  inactive: "text-red-500 bg-red-50",
};

export default function AdminInstallersPage() {
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const modalState = useOverlayState();
  const router = useRouter();

  function loadInstallers() {
    fetch("/api/admin/installers")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setInstallers(data.installers || []); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadInstallers(); }, []);

  const counts = {
    all: installers.length,
    applied: installers.filter((i) => i.status === "applied").length,
    approved: installers.filter((i) => i.status === "approved").length,
    active: installers.filter((i) => i.status === "active").length,
    inactive: installers.filter((i) => i.status === "inactive").length,
  };

  const filtered = installers.filter((i) => {
    if (activeTab !== "all" && i.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.instagramUsername?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Installers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage installer accounts and applications</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              setSyncing(true);
              try {
                const res = await fetch("/api/admin/installers/sync-creators", { method: "POST" });
                const data = await res.json();
                alert(`Synced ${data.synced} of ${data.total} installers`);
                loadInstallers();
              } catch { alert("Sync failed"); }
              finally { setSyncing(false); }
            }}
            disabled={syncing}
            className="px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync Creators"}
          </button>
          <button
            onClick={modalState.open}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2"
          >
            + Add Installer
          </button>
          <Link
            href="/admin/recruit"
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Recruit Installers
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 ${activeTab === tab.key ? "text-gray-300" : "text-gray-400"}`}>
              {counts[tab.key as keyof typeof counts]}
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
            placeholder="Search by name, email, or Instagram..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Installer</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instagram</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Region</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploads</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  {search ? "No results found" : "No installers yet. Click '+ Add Installer' to create one."}
                </td>
              </tr>
            ) : (
              filtered.map((inst) => (
                <tr
                  key={inst.id}
                  onClick={() => router.push(`/admin/installers/${inst.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {inst.avatarUrl ? (
                        <img src={inst.avatarUrl} alt={inst.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500 flex-shrink-0">
                          {inst.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{inst.name}</p>
                        <p className="text-xs text-gray-400">{inst.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[inst.status] || "text-gray-500 bg-gray-100"}`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {inst.instagramUsername ? `@${inst.instagramUsername}` : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {inst.region || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {inst._count.uploads}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(inst.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateInstallerModal
        state={modalState}
        onCreated={() => { modalState.close(); loadInstallers(); }}
      />
    </div>
  );
}

function CreateInstallerModal({
  state,
  onCreated,
}: {
  state: ReturnType<typeof useOverlayState>;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    instagramUsername: "", region: "", serviceArea: "",
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
      if (!res.ok) { setError(data.error || "Failed"); return; }
      onCreated();
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  const fields = [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "password", label: "Password", type: "password", required: true },
    { key: "phone", label: "Phone" },
    { key: "instagramUsername", label: "Instagram Username" },
    { key: "region", label: "Region" },
    { key: "serviceArea", label: "Service Area" },
  ] as const;

  return (
    <Modal state={state}>
      <ModalBackdrop isDismissable>
        <ModalContainer size="lg">
          <ModalDialog>
            <form onSubmit={handleSubmit}>
              <ModalHeader>Add New Installer</ModalHeader>
              <ModalBody className="gap-3">
                {fields.map((f) => (
                  <TextField key={f.key} isRequired={"required" in f && f.required}>
                    <Label>{f.label}</Label>
                    <Input
                      type={"type" in f ? f.type : "text"}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  </TextField>
                ))}
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </ModalBody>
              <ModalFooter>
                <button type="button" onClick={state.close} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Installer"}
                </button>
              </ModalFooter>
            </form>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  );
}
