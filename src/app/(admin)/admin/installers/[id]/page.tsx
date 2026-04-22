"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card, CardContent, CardHeader, Button, Chip,
  TextField, Label, Input, TextArea,
  Modal, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalBody, ModalFooter,
  useOverlayState,
} from "@heroui/react";
import { PRODUCTS, VEHICLES, INSTALL_TYPES } from "@/lib/network";

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

interface CreatorLink {
  username: string;
  customerId: string;
  displayName: string | null;
  email: string | null;
  profilePicUrl: string | null;
}

interface InstagramProfile {
  status?: boolean;
  profile_pic_url_hd?: string;
  profile_pic_url?: string;
  full_name?: string;
  biography?: string;
  is_verified?: boolean;
  is_private?: boolean;
  is_business_account?: boolean;
  edge_followed_by?: { count: number };
  edge_follow?: { count: number };
  edge_owner_to_timeline_media?: {
    count?: number;
    edges?: Array<{
      node: {
        display_url: string;
        shortcode?: string;
        is_video?: boolean;
        edge_media_preview_like?: { count: number };
        edge_media_to_comment?: { count: number };
      };
    }>;
  };
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
  // Find Installer fields
  bio: string | null;
  zipCode: string | null;
  rating: number;
  reviewCount: number;
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

function igProxy(url: string) {
  return `/api/admin/instagram/proxy?url=${encodeURIComponent(url)}`;
}

const STATUSES = ["applied", "approved", "active", "inactive"];
const statusColorMap: Record<string, "default" | "accent" | "success" | "danger"> = {
  applied: "default",
  approved: "accent",
  active: "success",
  inactive: "danger",
};

const EDITABLE_FIELDS: { key: string; label: string; type?: string; multiline?: boolean }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone" },
  { key: "instagramUsername", label: "Instagram Username" },
  { key: "region", label: "Region" },
  { key: "serviceArea", label: "Service Area" },
  { key: "zipCode", label: "ZIP Code" },
  { key: "specialties", label: "Specialties" },
  { key: "startingPrice", label: "Starting Price ($)", type: "number" },
  { key: "rating", label: "Rating (0-5)", type: "number" },
  { key: "reviewCount", label: "Review Count", type: "number" },
  { key: "completedInstalls", label: "Completed Installs", type: "number" },
  { key: "contractDate", label: "Contract Date", type: "date" },
  { key: "customerId", label: "Shopify Customer ID" },
  { key: "bio", label: "Bio / Description", multiline: true },
  { key: "customerQuote", label: "Customer Quote", multiline: true },
  { key: "notes", label: "Admin Notes", multiline: true },
];

const BOOL_FIELDS: { key: string; label: string }[] = [
  { key: "hasHardwire", label: "Hardwire experience" },
  { key: "hasMultiCamera", label: "Multi-camera setup" },
  { key: "hasJeepExperience", label: "Jeep / Off-road" },
  { key: "offersMobile", label: "Mobile service" },
  { key: "offersShop", label: "Shop service" },
  { key: "availableThisWeek", label: "Available this week" },
  { key: "weekendAvailable", label: "Weekend available" },
  { key: "fastResponse", label: "Fast response" },
];

export default function InstallerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [installer, setInstaller] = useState<InstallerDetail | null>(null);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [creatorLink, setCreatorLink] = useState<CreatorLink | null>(null);
  const [igProfile, setIgProfile] = useState<InstagramProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [contentTab, setContentTab] = useState<"ugc" | "uploads">("ugc");

  // Edit state
  const editModal = useOverlayState();
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  function loadData() {
    fetch(`/api/admin/installers/${id}`)
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setInstaller(data.installer);
          setMentions(data.mentions || []);
          setCreatorLink(data.creatorLink || null);
          if (data.installer?.instagramUsername) {
            fetch(`/api/admin/instagram?type=profile&username=${data.installer.instagramUsername}`)
              .then((r) => r.ok ? r.json() : null)
              .then((profile) => {
                if (profile && !profile.error && profile.status !== false) setIgProfile(profile);
              })
              .catch(() => {});
          }
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [id]);

  function openEdit() {
    if (!installer) return;
    setEditForm({
      name: installer.name || "",
      email: installer.email || "",
      phone: installer.phone || "",
      instagramUsername: installer.instagramUsername || "",
      region: installer.region || "",
      serviceArea: installer.serviceArea || "",
      zipCode: installer.zipCode || "",
      specialties: installer.specialties || "",
      startingPrice: installer.startingPrice != null ? String(installer.startingPrice) : "",
      rating: String(installer.rating || 0),
      reviewCount: String(installer.reviewCount || 0),
      completedInstalls: String(installer.completedInstalls || 0),
      contractDate: installer.contractDate ? installer.contractDate.split("T")[0] : "",
      customerId: installer.customerId || "",
      bio: installer.bio || "",
      customerQuote: installer.customerQuote || "",
      notes: installer.notes || "",
      // boolean and array fields
      hasHardwire: installer.hasHardwire,
      hasMultiCamera: installer.hasMultiCamera,
      hasJeepExperience: installer.hasJeepExperience,
      offersMobile: installer.offersMobile,
      offersShop: installer.offersShop,
      availableThisWeek: installer.availableThisWeek,
      weekendAvailable: installer.weekendAvailable,
      fastResponse: installer.fastResponse,
      supportedProducts: [...(installer.supportedProducts || [])],
      vehicleTypes: [...(installer.vehicleTypes || [])],
      installTypes: [...(installer.installTypes || [])],
      tags: (installer.tags || []).join(", "),
      facts: (installer.facts || []).join(", "),
    });
    setEditError("");
    editModal.open();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setEditError("");
    try {
      const payload: Record<string, unknown> = {};
      // String fields
      for (const field of EDITABLE_FIELDS) {
        const val = typeof editForm[field.key] === "string" ? (editForm[field.key] as string).trim() : "";
        if (field.type === "number") {
          payload[field.key] = val ? Number(val) : null;
        } else {
          payload[field.key] = val || null;
        }
      }
      // Boolean fields
      for (const bf of BOOL_FIELDS) {
        payload[bf.key] = Boolean(editForm[bf.key]);
      }
      // Array fields (multi-select)
      payload.supportedProducts = editForm.supportedProducts || [];
      payload.vehicleTypes = editForm.vehicleTypes || [];
      payload.installTypes = editForm.installTypes || [];
      // Comma-separated → array
      payload.tags = typeof editForm.tags === "string"
        ? editForm.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
        : editForm.tags || [];
      payload.facts = typeof editForm.facts === "string"
        ? editForm.facts.split(",").map((s: string) => s.trim()).filter(Boolean)
        : editForm.facts || [];

      const res = await fetch(`/api/admin/installers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.error || "Save failed");
        return;
      }
      editModal.close();
      loadData();
    } catch {
      setEditError("Network error");
    } finally {
      setSaving(false);
    }
  }

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
        <p className="text-default-500">Loading...</p>
      </div>
    );
  }

  const productLabels = Object.fromEntries(PRODUCTS.filter((p) => p.value !== "all").map((p) => [p.value, p.label]));
  const vehicleLabels = Object.fromEntries(VEHICLES.filter((v) => v.value !== "all").map((v) => [v.value, v.label]));
  const installTypeLabels = Object.fromEntries(INSTALL_TYPES.filter((t) => t.value !== "all").map((t) => [t.value, t.label]));

  const infoFields = [
    { label: "Email", value: installer.email },
    { label: "Phone", value: installer.phone },
    { label: "Instagram", value: installer.instagramUsername ? `@${installer.instagramUsername}` : null },
    { label: "Region", value: installer.region },
    { label: "Service Area", value: installer.serviceArea },
    { label: "ZIP Code", value: installer.zipCode },
    { label: "Specialties", value: installer.specialties },
    { label: "Starting Price", value: installer.startingPrice != null ? `$${installer.startingPrice}` : null },
    { label: "Rating", value: installer.rating ? `${installer.rating} / 5 (${installer.reviewCount} reviews)` : null },
    { label: "Completed Installs", value: installer.completedInstalls || null },
    { label: "Contract Date", value: installer.contractDate ? new Date(installer.contractDate).toLocaleDateString() : null },
    { label: "Shopify Customer ID", value: installer.customerId },
    { label: "Notes", value: installer.notes },
    { label: "Joined", value: new Date(installer.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onPress={() => router.push("/admin/installers")}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold">{installer.name}</h1>
            <Chip color={statusColorMap[installer.status]} variant="soft" size="sm">
              {installer.status}
            </Chip>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onPress={openEdit}>
              Edit
            </Button>
            {STATUSES.filter((s) => s !== installer.status).map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                onPress={() => updateStatus(s)}
                className="capitalize"
              >
                Set {s}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Instagram Profile Card */}
        {installer.instagramUsername && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-5">
                {(igProfile?.profile_pic_url_hd || igProfile?.profile_pic_url || creatorLink?.profilePicUrl) ? (
                  <img
                    src={igProxy(igProfile?.profile_pic_url_hd || igProfile?.profile_pic_url || creatorLink?.profilePicUrl || "")}
                    alt={installer.instagramUsername}
                    className="rounded-full object-cover w-20 h-20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400">
                    @
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      @{installer.instagramUsername}
                    </h2>
                    {igProfile?.is_verified && (
                      <span className="text-blue-500" title="Verified">✓</span>
                    )}
                    {(igProfile?.full_name || creatorLink?.displayName) && (
                      <span className="text-default-400 text-sm">
                        {igProfile?.full_name || creatorLink?.displayName}
                      </span>
                    )}
                  </div>
                  {igProfile?.biography && (
                    <p className="text-sm text-default-500 mt-1 line-clamp-2">{igProfile.biography}</p>
                  )}
                  <div className="flex gap-6 mt-3">
                    {igProfile?.edge_followed_by != null && (
                      <div className="text-center">
                        <p className="text-xl font-bold">{igProfile.edge_followed_by.count.toLocaleString()}</p>
                        <p className="text-xs text-default-400">Followers</p>
                      </div>
                    )}
                    {igProfile?.edge_follow != null && (
                      <div className="text-center">
                        <p className="text-xl font-bold">{igProfile.edge_follow.count.toLocaleString()}</p>
                        <p className="text-xs text-default-400">Following</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-xl font-bold">{igProfile?.edge_owner_to_timeline_media?.count?.toLocaleString() ?? mentions.length}</p>
                      <p className="text-xs text-default-400">Posts</p>
                    </div>
                  </div>
                </div>
                <a
                  href={`https://instagram.com/${installer.instagramUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View on Instagram →
                </a>
              </div>

              {/* Recent Instagram Posts */}
              {igProfile?.edge_owner_to_timeline_media?.edges && igProfile.edge_owner_to_timeline_media.edges.length > 0 && (
                <div className="mt-5 pt-5 border-t">
                  <h3 className="text-sm font-semibold mb-3">Recent Posts</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {igProfile.edge_owner_to_timeline_media.edges.slice(0, 6).map((edge, i) => (
                      <a
                        key={i}
                        href={`https://instagram.com/p/${edge.node.shortcode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="relative group"
                      >
                        <img
                          src={igProxy(edge.node.display_url)}
                          alt=""
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3 text-white text-xs">
                          <span>♥ {edge.node.edge_media_preview_like?.count ?? 0}</span>
                          <span>💬 {edge.node.edge_media_to_comment?.count ?? 0}</span>
                        </div>
                        {edge.node.is_video && (
                          <span className="absolute top-1 right-1 text-white text-xs bg-black/50 px-1 rounded">▶</span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Installer Info */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Installer Info</h2>
              <Button size="sm" variant="ghost" onPress={openEdit}>Edit</Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {infoFields.map((f) => (
                <div key={f.label}>
                  <p className="text-sm text-default-400">{f.label}</p>
                  <p className="font-medium text-sm">{f.value || "—"}</p>
                </div>
              ))}
            </div>

            {/* Bio */}
            {installer.bio && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-default-400 mb-1">Bio</p>
                <p className="text-sm">{installer.bio}</p>
              </div>
            )}

            {/* Products / Vehicles / Install Types */}
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-default-400 mb-2">Supported Products</p>
                <div className="flex flex-wrap gap-1.5">
                  {installer.supportedProducts?.length > 0
                    ? installer.supportedProducts.map((p) => (
                        <Chip key={p} size="sm" variant="soft">{productLabels[p] || p}</Chip>
                      ))
                    : <span className="text-sm text-default-400">—</span>}
                </div>
              </div>
              <div>
                <p className="text-sm text-default-400 mb-2">Vehicle Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {installer.vehicleTypes?.length > 0
                    ? installer.vehicleTypes.map((v) => (
                        <Chip key={v} size="sm" variant="soft">{vehicleLabels[v] || v}</Chip>
                      ))
                    : <span className="text-sm text-default-400">—</span>}
                </div>
              </div>
              <div>
                <p className="text-sm text-default-400 mb-2">Install Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {installer.installTypes?.length > 0
                    ? installer.installTypes.map((t) => (
                        <Chip key={t} size="sm" variant="soft">{installTypeLabels[t] || t}</Chip>
                      ))
                    : <span className="text-sm text-default-400">—</span>}
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-default-400 mb-2">Capabilities & Service</p>
              <div className="flex flex-wrap gap-1.5">
                {BOOL_FIELDS.filter((bf) => (installer as unknown as Record<string, boolean>)[bf.key]).map((bf) => (
                  <Chip key={bf.key} size="sm" variant="soft" color="success">{bf.label}</Chip>
                ))}
                {BOOL_FIELDS.every((bf) => !(installer as unknown as Record<string, boolean>)[bf.key]) && (
                  <span className="text-sm text-default-400">—</span>
                )}
              </div>
            </div>

            {/* Tags */}
            {installer.tags?.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-default-400 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {installer.tags.map((t) => (
                    <Chip key={t} size="sm" variant="soft" color="accent">{t}</Chip>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Quote */}
            {installer.customerQuote && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-default-400 mb-1">Customer Quote</p>
                <p className="text-sm italic border-l-2 border-orange-400 pl-3">&ldquo;{installer.customerQuote}&rdquo;</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content tabs */}
        <div className="flex gap-1 mb-6">
          {[
            { key: "ugc" as const, label: "Instagram UGC", count: mentions.length },
            { key: "uploads" as const, label: "Uploads", count: installer.uploads.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setContentTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                contentTab === t.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 ${contentTab === t.key ? "text-gray-300" : "text-gray-400"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {contentTab === "ugc" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mentions.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 py-8">
                {installer.instagramUsername ? "No UGC posts found." : "No Instagram username linked."}
              </p>
            ) : (
              mentions.map((m) => (
                <a key={m.id} href={m.permalink} target="_blank" rel="noreferrer" className="group">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
                    <div className="h-48 bg-gray-100">
                      {m.mediaType === "VIDEO" ? (
                        <video src={m.mediaUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                      ) : (
                        <Image src={m.thumbnailUrl || m.mediaUrl} alt="" className="w-full h-48 object-cover" width={400} height={300} />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-500 line-clamp-2">{m.caption || ""}</p>
                      <div className="flex gap-3 mt-2 text-xs text-gray-400">
                        <span>♥ {m.likeCount}</span>
                        <span>💬 {m.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        )}

        {contentTab === "uploads" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {installer.uploads.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 py-8">No uploads yet.</p>
            ) : (
              installer.uploads.map((u) => (
                <div key={u.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="h-48 bg-gray-100">
                    {u.fileType === "video" ? (
                      <video src={u.fileUrl} className="w-full h-full object-cover" muted playsInline controls preload="metadata" />
                    ) : (
                      <Image src={u.fileUrl} alt="" className="w-full h-48 object-cover" width={400} height={300} />
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        u.status === "approved" ? "text-green-600 bg-green-50" :
                        u.status === "rejected" ? "text-red-500 bg-red-50" :
                        "text-yellow-600 bg-yellow-50"
                      }`}>
                        {u.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {u.caption && <p className="text-xs text-gray-500 line-clamp-2">{u.caption}</p>}
                    {u.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => reviewUpload(u.id, "approved")}
                          className="flex-1 px-2 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reviewUpload(u.id, "rejected")}
                          className="flex-1 px-2 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      <Modal state={editModal}>
        <ModalBackdrop isDismissable>
          <ModalContainer size="lg">
            <ModalDialog>
              <form onSubmit={handleSave}>
                <ModalHeader>Edit Installer</ModalHeader>
                <ModalBody className="gap-3 max-h-[70vh] overflow-y-auto">
                  {EDITABLE_FIELDS.map((f) =>
                    f.multiline ? (
                      <TextField key={f.key}>
                        <Label>{f.label}</Label>
                        <TextArea
                          value={String(editForm[f.key] ?? "")}
                          onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        />
                      </TextField>
                    ) : (
                      <TextField key={f.key}>
                        <Label>{f.label}</Label>
                        <Input
                          type={f.type || "text"}
                          value={String(editForm[f.key] ?? "")}
                          onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        />
                      </TextField>
                    )
                  )}

                  {/* Supported Products */}
                  <div>
                    <p className="text-sm font-medium mb-2">Supported Products</p>
                    <div className="flex flex-wrap gap-2">
                      {PRODUCTS.filter((p) => p.value !== "all").map((p) => {
                        const arr = (editForm.supportedProducts as string[]) || [];
                        const selected = arr.includes(p.value);
                        return (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setEditForm({
                              ...editForm,
                              supportedProducts: selected ? arr.filter((v) => v !== p.value) : [...arr, p.value],
                            })}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                              selected ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-gray-200 text-gray-500"
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
                    <p className="text-sm font-medium mb-2">Vehicle Types</p>
                    <div className="flex flex-wrap gap-2">
                      {VEHICLES.filter((v) => v.value !== "all").map((v) => {
                        const arr = (editForm.vehicleTypes as string[]) || [];
                        const selected = arr.includes(v.value);
                        return (
                          <button
                            key={v.value}
                            type="button"
                            onClick={() => setEditForm({
                              ...editForm,
                              vehicleTypes: selected ? arr.filter((x) => x !== v.value) : [...arr, v.value],
                            })}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                              selected ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-gray-200 text-gray-500"
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
                    <p className="text-sm font-medium mb-2">Install Types</p>
                    <div className="flex flex-wrap gap-2">
                      {INSTALL_TYPES.filter((t) => t.value !== "all").map((t) => {
                        const arr = (editForm.installTypes as string[]) || [];
                        const selected = arr.includes(t.value);
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setEditForm({
                              ...editForm,
                              installTypes: selected ? arr.filter((x) => x !== t.value) : [...arr, t.value],
                            })}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                              selected ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-gray-200 text-gray-500"
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags & Facts (comma-separated) */}
                  <TextField>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={String(editForm.tags ?? "")}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      placeholder="e.g. Acumen Compatible, Hardwire Expert"
                    />
                  </TextField>
                  <TextField>
                    <Label>Facts (comma-separated)</Label>
                    <Input
                      value={String(editForm.facts ?? "")}
                      onChange={(e) => setEditForm({ ...editForm, facts: e.target.value })}
                      placeholder="e.g. 120 installs completed, 5 years in business"
                    />
                  </TextField>

                  {/* Boolean toggles */}
                  <div>
                    <p className="text-sm font-medium mb-2">Capabilities & Availability</p>
                    <div className="grid grid-cols-2 gap-2">
                      {BOOL_FIELDS.map((bf) => (
                        <label key={bf.key} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm[bf.key] as boolean || false}
                            onChange={(e) => setEditForm({ ...editForm, [bf.key]: e.target.checked })}
                            className="accent-orange-500"
                          />
                          {bf.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {editError && <p className="text-danger text-sm">{editError}</p>}
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" onPress={editModal.close}>Cancel</Button>
                  <Button type="submit" variant="primary" isDisabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </ModalFooter>
              </form>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>
    </div>
  );
}
