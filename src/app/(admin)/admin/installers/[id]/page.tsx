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
}

function igProxy(url: string) {
  return `/api/admin/instagram/proxy?url=${encodeURIComponent(url)}`;
}

const STATUSES = ["applied", "approved", "active", "inactive"];
const statusColorMap: Record<string, "default" | "primary" | "success" | "danger"> = {
  applied: "default",
  approved: "primary",
  active: "success",
  inactive: "danger",
};

const EDITABLE_FIELDS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone" },
  { key: "instagramUsername", label: "Instagram Username" },
  { key: "region", label: "Region" },
  { key: "serviceArea", label: "Service Area" },
  { key: "specialties", label: "Specialties" },
  { key: "contractDate", label: "Contract Date", type: "date" },
  { key: "customerId", label: "Shopify Customer ID" },
  { key: "notes", label: "Notes", multiline: true },
] as const;

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
  const [editForm, setEditForm] = useState<Record<string, string>>({});
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
      specialties: installer.specialties || "",
      contractDate: installer.contractDate ? installer.contractDate.split("T")[0] : "",
      customerId: installer.customerId || "",
      notes: installer.notes || "",
    });
    setEditError("");
    editModal.open();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setEditError("");
    try {
      const payload: Record<string, string | null> = {};
      for (const field of EDITABLE_FIELDS) {
        const val = editForm[field.key]?.trim() || "";
        payload[field.key] = val || null;
      }
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

  const infoFields = [
    { label: "Email", value: installer.email },
    { label: "Phone", value: installer.phone },
    { label: "Instagram", value: installer.instagramUsername ? `@${installer.instagramUsername}` : null },
    { label: "Region", value: installer.region },
    { label: "Service Area", value: installer.serviceArea },
    { label: "Specialties", value: installer.specialties },
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
            <Button variant="light" size="sm" onPress={() => router.push("/admin/installers")}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold">{installer.name}</h1>
            <Chip color={statusColorMap[installer.status]} variant="flat" size="sm">
              {installer.status}
            </Chip>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="bordered" onPress={openEdit}>
              Edit
            </Button>
            {STATUSES.filter((s) => s !== installer.status).map((s) => (
              <Button
                key={s}
                size="sm"
                variant="bordered"
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
          <Card shadow="sm" className="mb-6">
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
        <Card shadow="sm" className="mb-6">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Installer Info</h2>
              <Button size="sm" variant="light" onPress={openEdit}>Edit</Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {infoFields.map((f) => (
                <div key={f.label}>
                  <p className="text-sm text-default-400">{f.label}</p>
                  <p className="font-medium text-sm">{f.value || "—"}</p>
                </div>
              ))}
            </div>
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
                <ModalBody className="gap-3">
                  {EDITABLE_FIELDS.map((f) =>
                    f.multiline ? (
                      <TextField key={f.key}>
                        <Label>{f.label}</Label>
                        <TextArea
                          value={editForm[f.key] || ""}
                          onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        />
                      </TextField>
                    ) : (
                      <TextField key={f.key}>
                        <Label>{f.label}</Label>
                        <Input
                          type={f.type || "text"}
                          value={editForm[f.key] || ""}
                          onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        />
                      </TextField>
                    )
                  )}
                  {editError && <p className="text-danger text-sm">{editError}</p>}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={editModal.close}>Cancel</Button>
                  <Button type="submit" variant="solid" isDisabled={saving}>
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
