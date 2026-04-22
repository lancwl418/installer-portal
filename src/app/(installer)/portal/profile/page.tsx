"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Button, Chip } from "@heroui/react";
import { PRODUCTS, VEHICLES, INSTALL_TYPES } from "@/lib/network";

interface InstallerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  instagramUsername: string | null;
  avatarUrl: string | null;
  region: string | null;
  serviceArea: string | null;
  specialties: string | null;
  status: string;
  bio: string | null;
  zipCode: string | null;
  startingPrice: number | null;
  supportedProducts: string[];
  vehicleTypes: string[];
  installTypes: string[];
  tags: string[];
  hasHardwire: boolean;
  hasMultiCamera: boolean;
  hasJeepExperience: boolean;
  offersMobile: boolean;
  offersShop: boolean;
  availableThisWeek: boolean;
  weekendAvailable: boolean;
  fastResponse: boolean;
  customerQuote: string | null;
  facts: string[];
  completedInstalls: number;
}

const statusColorMap: Record<string, "default" | "accent" | "success" | "danger"> = {
  applied: "default",
  approved: "accent",
  active: "success",
  inactive: "danger",
};

const BOOL_OPTIONS: { key: keyof InstallerProfile; label: string }[] = [
  { key: "hasHardwire", label: "Hardwire experience" },
  { key: "hasMultiCamera", label: "Multi-camera setup" },
  { key: "hasJeepExperience", label: "Jeep / Off-road experience" },
  { key: "offersMobile", label: "Mobile installation" },
  { key: "offersShop", label: "Shop installation" },
  { key: "availableThisWeek", label: "Available this week" },
  { key: "weekendAvailable", label: "Weekend appointments" },
  { key: "fastResponse", label: "Fast response (< 2 hours)" },
];

export default function ProfilePage() {
  const [installer, setInstaller] = useState<InstallerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  function loadProfile() {
    fetch("/api/auth/profile")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data?.installer) setInstaller(data.installer);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadProfile(); }, []);

  function startEdit() {
    if (!installer) return;
    setForm({
      name: installer.name || "",
      phone: installer.phone || "",
      instagramUsername: installer.instagramUsername || "",
      region: installer.region || "",
      serviceArea: installer.serviceArea || "",
      specialties: installer.specialties || "",
      bio: installer.bio || "",
      zipCode: installer.zipCode || "",
      startingPrice: installer.startingPrice ?? "",
      supportedProducts: [...installer.supportedProducts],
      vehicleTypes: [...installer.vehicleTypes],
      installTypes: [...installer.installTypes],
      hasHardwire: installer.hasHardwire,
      hasMultiCamera: installer.hasMultiCamera,
      hasJeepExperience: installer.hasJeepExperience,
      offersMobile: installer.offersMobile,
      offersShop: installer.offersShop,
      availableThisWeek: installer.availableThisWeek,
      weekendAvailable: installer.weekendAvailable,
      fastResponse: installer.fastResponse,
      customerQuote: installer.customerQuote || "",
    });
    setEditing(true);
    setMessage("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setMessage(d.error || "Save failed");
        return;
      }
      setEditing(false);
      setMessage("Profile updated!");
      loadProfile();
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  }

  function toggleArray(key: string, value: string) {
    const arr = (form[key] as string[]) || [];
    setForm({
      ...form,
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  }

  if (loading || !installer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-default-500">Loading...</p>
      </div>
    );
  }

  const infoFields = [
    { label: "Email", value: installer.email },
    { label: "Phone", value: installer.phone },
    { label: "Instagram", value: installer.instagramUsername ? `@${installer.instagramUsername}` : null },
    { label: "Region", value: installer.region },
    { label: "Service Area", value: installer.serviceArea },
    { label: "ZIP Code", value: installer.zipCode },
    { label: "Starting Price", value: installer.startingPrice != null ? `$${installer.startingPrice}` : null },
    { label: "Specialties", value: installer.specialties },
  ];

  const productLabels = Object.fromEntries(PRODUCTS.filter((p) => p.value !== "all").map((p) => [p.value, p.label]));
  const vehicleLabels = Object.fromEntries(VEHICLES.filter((v) => v.value !== "all").map((v) => [v.value, v.label]));
  const installLabels = Object.fromEntries(INSTALL_TYPES.filter((t) => t.value !== "all").map((t) => [t.value, t.label]));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">My Profile</h1>
          <Link href="/portal"><Button variant="ghost" size="sm">← Back to Portal</Button></Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.includes("error") || message.includes("fail") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
            {message}
          </div>
        )}

        {!editing ? (
          <>
            {/* View mode */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {installer.avatarUrl ? (
                      <img src={installer.avatarUrl} alt={installer.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-400">
                        {installer.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    <h2 className="text-lg font-semibold">{installer.name}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <Chip color={statusColorMap[installer.status]} variant="soft" size="sm">
                      {installer.status}
                    </Chip>
                    <Button size="sm" variant="outline" onPress={startEdit}>Edit Profile</Button>
                  </div>
                </div>

                {/* Basic info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {infoFields.map((f) => (
                    <div key={f.label}>
                      <p className="text-sm text-default-400">{f.label}</p>
                      <p className="font-medium text-sm">{f.value || "—"}</p>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                {installer.bio && (
                  <div className="mb-6">
                    <p className="text-sm text-default-400 mb-1">Bio</p>
                    <p className="text-sm">{installer.bio}</p>
                  </div>
                )}

                {/* Supported Products */}
                {installer.supportedProducts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-default-400 mb-2">Supported Products</p>
                    <div className="flex flex-wrap gap-2">
                      {installer.supportedProducts.map((p) => (
                        <Chip key={p} size="sm" variant="soft">{productLabels[p] || p}</Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicle Types */}
                {installer.vehicleTypes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-default-400 mb-2">Vehicle Types</p>
                    <div className="flex flex-wrap gap-2">
                      {installer.vehicleTypes.map((v) => (
                        <Chip key={v} size="sm" variant="soft">{vehicleLabels[v] || v}</Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Install Types */}
                {installer.installTypes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-default-400 mb-2">Install Types</p>
                    <div className="flex flex-wrap gap-2">
                      {installer.installTypes.map((t) => (
                        <Chip key={t} size="sm" variant="soft">{installLabels[t] || t}</Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capabilities */}
                <div className="mb-4">
                  <p className="text-sm text-default-400 mb-2">Capabilities & Service</p>
                  <div className="flex flex-wrap gap-2">
                    {BOOL_OPTIONS.filter((o) => installer[o.key]).map((o) => (
                      <Chip key={o.key} size="sm" variant="soft" color="success">{o.label}</Chip>
                    ))}
                    {BOOL_OPTIONS.every((o) => !installer[o.key]) && (
                      <span className="text-sm text-default-400">Not set</span>
                    )}
                  </div>
                </div>

                {/* Customer Quote */}
                {installer.customerQuote && (
                  <div className="mb-4">
                    <p className="text-sm text-default-400 mb-1">Customer Quote</p>
                    <p className="text-sm italic border-l-2 border-orange-400 pl-3">&ldquo;{installer.customerQuote}&rdquo;</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          /* Edit mode */
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <h2 className="text-lg font-semibold">Edit Profile</h2>

                {/* Basic fields */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Name", type: "text" },
                    { key: "phone", label: "Phone", type: "tel" },
                    { key: "instagramUsername", label: "Instagram Username", type: "text" },
                    { key: "region", label: "Region", type: "text" },
                    { key: "serviceArea", label: "Service Area", type: "text" },
                    { key: "zipCode", label: "ZIP Code", type: "text" },
                    { key: "startingPrice", label: "Starting Price ($)", type: "number" },
                    { key: "specialties", label: "Specialties", type: "text" },
                  ].map((f) => (
                    <div key={f.key} className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-default-600">{f.label}</label>
                      <input
                        type={f.type}
                        value={(form[f.key] as string) ?? ""}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="border border-default-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-default-600">Bio</label>
                  <textarea
                    value={(form.bio as string) ?? ""}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className="border border-default-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Describe your installation expertise..."
                  />
                </div>

                {/* Supported Products */}
                <div>
                  <label className="text-sm font-medium text-default-600 block mb-2">Supported Products</label>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCTS.filter((p) => p.value !== "all").map((p) => {
                      const selected = ((form.supportedProducts as string[]) || []).includes(p.value);
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => toggleArray("supportedProducts", p.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                            selected
                              ? "bg-orange-50 border-orange-300 text-orange-700"
                              : "bg-white border-default-200 text-default-500 hover:border-default-300"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vehicle Types */}
                <div>
                  <label className="text-sm font-medium text-default-600 block mb-2">Vehicle Types</label>
                  <div className="flex flex-wrap gap-2">
                    {VEHICLES.filter((v) => v.value !== "all").map((v) => {
                      const selected = ((form.vehicleTypes as string[]) || []).includes(v.value);
                      return (
                        <button
                          key={v.value}
                          type="button"
                          onClick={() => toggleArray("vehicleTypes", v.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                            selected
                              ? "bg-orange-50 border-orange-300 text-orange-700"
                              : "bg-white border-default-200 text-default-500 hover:border-default-300"
                          }`}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Install Types */}
                <div>
                  <label className="text-sm font-medium text-default-600 block mb-2">Install Types</label>
                  <div className="flex flex-wrap gap-2">
                    {INSTALL_TYPES.filter((t) => t.value !== "all").map((t) => {
                      const selected = ((form.installTypes as string[]) || []).includes(t.value);
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => toggleArray("installTypes", t.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                            selected
                              ? "bg-orange-50 border-orange-300 text-orange-700"
                              : "bg-white border-default-200 text-default-500 hover:border-default-300"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Capability toggles */}
                <div>
                  <label className="text-sm font-medium text-default-600 block mb-2">Capabilities & Availability</label>
                  <div className="grid grid-cols-2 gap-3">
                    {BOOL_OPTIONS.map((o) => (
                      <label key={o.key} className="flex items-center gap-2.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form[o.key] as boolean || false}
                          onChange={(e) => setForm({ ...form, [o.key]: e.target.checked })}
                          className="accent-orange-500 w-4 h-4"
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Customer Quote */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-default-600">Customer Quote</label>
                  <textarea
                    value={(form.customerQuote as string) ?? ""}
                    onChange={(e) => setForm({ ...form, customerQuote: e.target.value })}
                    rows={2}
                    className="border border-default-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="A testimonial from a past customer..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" variant="primary" isDisabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="ghost" onPress={() => setEditing(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
