"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PRODUCT_LABEL_MAP } from "@/lib/network";

interface InstallerDetail {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  zipCode: string | null;
  region: string | null;
  serviceArea: string | null;
  specialties: string | null;
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
  phone: string | null;
}

interface MediaItem {
  id: string;
  url: string;
  type: "photo" | "video";
  caption: string | null;
  source: "upload" | "ugc";
}

interface RelatedInstaller {
  id: string;
  name: string;
  avatarUrl: string | null;
  rating: number;
  reviewCount: number;
  region: string | null;
  offersMobile: boolean;
  offersShop: boolean;
  tags: string[];
}

const VEHICLE_LABELS: Record<string, string> = {
  jeep: "Jeep / Off-road",
  truck: "Truck / SUV",
  sedan: "Sedan",
  van: "Van / RV",
};
const INSTALL_LABELS: Record<string, string> = {
  hardwire: "Hardwire install",
  standard: "Standard install",
  multi: "Multi-camera setup",
  rear: "Rear camera install",
};

export default function InstallerDetailPage() {
  const { id } = useParams();
  const [installer, setInstaller] = useState<InstallerDetail | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [related, setRelated] = useState<RelatedInstaller[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryTab, setGalleryTab] = useState<"photos" | "videos">("photos");

  useEffect(() => {
    fetch(`/api/network/installers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setInstaller(data.installer);
        setMedia(data.media || []);
        setRelated(data.related || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #090c11 0%, #0a0d12 100%)" }}>
        <p className="text-[#95a2b1]">Loading...</p>
      </div>
    );
  }

  if (!installer) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #090c11 0%, #0a0d12 100%)" }}>
        <p className="text-[#95a2b1]">Installer not found.</p>
      </div>
    );
  }

  const d = installer;
  const initials = d.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  const serviceType = [d.offersMobile && "Mobile", d.offersShop && "Shop"].filter(Boolean).join(" + ") || "—";
  const stars = "★".repeat(Math.round(d.rating));

  const photos = media.filter((m) => m.type === "photo");
  const videos = media.filter((m) => m.type === "video");
  const visibleGallery = galleryTab === "photos" ? photos : videos;

  // Build stats
  const stats: [string, string][] = [];
  if (d.completedInstalls > 0) stats.push([`${d.completedInstalls}+`, "Installs completed"]);
  if (d.rating > 0) stats.push([`${d.rating.toFixed(1)}★`, "Average rating"]);
  if (d.fastResponse) stats.push(["< 2 hrs", "Typical response"]);
  else stats.push(["Standard", "Response time"]);
  if (d.offersMobile && d.serviceArea) stats.push([d.serviceArea, "Service area"]);
  else if (d.offersShop) stats.push(["Shop", "Install style"]);

  // Build info rows
  const info: [string, string][] = [];
  if (d.serviceArea || d.region) info.push(["Service area", d.serviceArea || d.region || "—"]);
  if (d.availableThisWeek) info.push(["Next availability", "This week"]);
  const bestFor = [
    d.hasHardwire && "Hardwire",
    d.hasJeepExperience && "Jeep builds",
    d.hasMultiCamera && "Multi-camera",
  ].filter(Boolean).join(" + ");
  if (bestFor) info.push(["Best for", bestFor]);
  info.push(["Services", d.installTypes.map((t) => INSTALL_LABELS[t] || t).join(", ") || "—"]);

  // Support bullets
  const supportBullets: string[] = [];
  if (d.supportedProducts.length > 0)
    supportBullets.push("Products: " + d.supportedProducts.map((p) => PRODUCT_LABEL_MAP[p] || p).join(", "));
  if (d.vehicleTypes.length > 0)
    supportBullets.push("Vehicles: " + d.vehicleTypes.map((v) => VEHICLE_LABELS[v] || v).join(", "));
  if (d.installTypes.length > 0)
    supportBullets.push("Scenarios: " + d.installTypes.map((t) => INSTALL_LABELS[t] || t).join(", "));

  // Services
  const services: { title: string; desc: string; price: string }[] = [];
  if (d.installTypes.includes("standard"))
    services.push({ title: "Standard installation", desc: "Basic mirror dash cam install and camera testing", price: d.startingPrice ? `$${d.startingPrice}+` : "Quote" });
  if (d.installTypes.includes("hardwire"))
    services.push({ title: "Hardwire installation", desc: "Fuse box wiring for parking mode and stable power", price: "Quote" });
  if (d.installTypes.includes("multi"))
    services.push({ title: "Multi-camera setup", desc: "Cabin + rear routing for 3CH / 4CH systems", price: "Quote" });
  if (d.installTypes.includes("rear"))
    services.push({ title: "Rear camera install", desc: "Rear camera routing and positioning", price: "Quote" });
  if (services.length === 0 && d.startingPrice)
    services.push({ title: "Installation", desc: "Professional dash cam installation", price: `$${d.startingPrice}+` });

  return (
    <div
      className="min-h-screen text-[#eef3f8] font-[Inter,Arial,sans-serif]"
      style={{
        background: "radial-gradient(circle at top left, rgba(249,115,22,.14), transparent 22%), linear-gradient(180deg, #090c11 0%, #0b1017 34%, #0a0d12 100%)",
      }}
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-white/[.06]" style={{ background: "rgba(8,11,16,.72)", backdropFilter: "blur(18px)" }}>
        <div className="w-[min(calc(100%-28px),1240px)] mx-auto min-h-[74px] flex items-center justify-between gap-4 flex-wrap max-md:py-3">
          <Link href="/network" className="flex items-center gap-3 font-black tracking-wider uppercase">
            <span className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-orange-500 to-orange-400 text-[#120d08] grid place-items-center font-black text-lg">A</span>
            <span>ACUMEN</span>
          </Link>
          <nav className="flex gap-6 text-[#95a2b1] text-sm max-md:hidden">
            <Link href="/network/find">Find Installer</Link>
            <a href="#gallery">Gallery</a>
            <a href="#reviews">Reviews</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="flex gap-2.5 max-md:w-full">
            <Link href="/network/find" className="rounded-full px-4 py-2.5 font-extrabold text-sm inline-flex items-center justify-center border border-white/[.08] bg-white/[.03] max-md:flex-1">
              Back to Results
            </Link>
            <a href="#contact" className="rounded-full px-4 py-2.5 font-extrabold text-sm inline-flex items-center justify-center bg-gradient-to-b from-orange-400 to-orange-500 text-[#15100c] max-md:flex-1">
              Request Install
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Breadcrumbs */}
        <div className="w-[min(calc(100%-28px),1240px)] mx-auto flex gap-2.5 flex-wrap text-[#95a2b1] text-sm py-5">
          <Link href="/network" className="hover:text-white">Network Home</Link>
          <span>›</span>
          <Link href="/network/find" className="hover:text-white">Find Installer</Link>
          <span>›</span>
          <span className="text-[#eef3f8]">{d.name}</span>
        </div>

        {/* Hero */}
        <section className="pb-6">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto grid grid-cols-[1.02fr_.98fr] gap-5 max-lg:grid-cols-1">
            {/* Profile Card */}
            <Card>
              <div className="flex justify-between items-start gap-3.5 max-md:flex-col">
                <div className="flex gap-4 items-center">
                  {d.avatarUrl ? (
                    <img src={d.avatarUrl} alt={d.name} className="w-[82px] h-[82px] rounded-[22px] object-cover border border-white/[.06]" />
                  ) : (
                    <div className="w-[82px] h-[82px] rounded-[22px] border border-white/[.06] text-[#ffd6b7] text-[28px] font-black grid place-items-center" style={{ background: "linear-gradient(135deg, #223043, #16202d)" }}>
                      {initials}
                    </div>
                  )}
                  <div>
                    <h1 className="text-[clamp(34px,4vw,54px)] font-black leading-[0.98] tracking-[-0.045em] max-md:text-[40px]">{d.name}</h1>
                    <div className="text-[#ffc857] font-extrabold text-[15px] mb-1.5">
                      {stars} {d.rating.toFixed(1)} ({d.reviewCount} reviews)
                    </div>
                    <div className="text-[#95a2b1] text-sm">
                      {[d.region, serviceType, d.fastResponse ? "Responds within 2 hours" : null].filter(Boolean).join(" • ")}
                    </div>
                  </div>
                </div>
                {d.startingPrice != null && (
                  <div className="text-right max-md:text-left shrink-0">
                    <strong className="block text-[32px] leading-tight">${d.startingPrice}+</strong>
                    <span className="text-[#95a2b1] text-[13px]">Starting price</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {d.tags.length > 0 && (
                <div className="flex gap-2.5 flex-wrap mt-3.5 mb-4">
                  {d.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-2 rounded-full text-xs font-extrabold bg-orange-500/12 border border-orange-500/20 text-[#ffc79f]">{tag}</span>
                  ))}
                </div>
              )}

              {/* Summary */}
              {d.bio && <p className="text-[15px] text-[#dbe3ed] leading-relaxed">{d.bio}</p>}

              {/* Stats */}
              {stats.length > 0 && (
                <div className="grid grid-cols-4 gap-2.5 mt-4 max-lg:grid-cols-2 max-md:grid-cols-1">
                  {stats.map(([val, label]) => (
                    <div key={label} className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06]">
                      <strong className="block text-2xl mb-1">{val}</strong>
                      <span className="text-[13px] text-[#95a2b1]">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Contact Card */}
            <aside className="sticky top-[92px] h-fit max-lg:static" id="contact">
              <Card>
                <h2 className="text-[28px] font-bold m-0">Get in touch</h2>
                <p className="mt-2 mb-4 text-[#95a2b1]">Build enough trust before reaching out to the installer.</p>

                {/* Info rows */}
                {info.length > 0 && (
                  <div className="grid gap-2.5 mb-4">
                    {info.map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center gap-3 py-3 px-3.5 rounded-2xl bg-white/[.03] border border-white/[.06] text-sm">
                        <span className="text-[#95a2b1]">{k}</span>
                        <strong>{v}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contact form */}
                <div className="grid gap-3">
                  <input placeholder="Your name" className="w-full bg-[#0b1017] text-[#eef3f8] border border-white/[.08] rounded-[14px] px-3.5 py-3" />
                  <input placeholder="ZIP code" className="w-full bg-[#0b1017] text-[#eef3f8] border border-white/[.08] rounded-[14px] px-3.5 py-3" />
                  <select className="w-full bg-[#0b1017] text-[#eef3f8] border border-white/[.08] rounded-[14px] px-3.5 py-3">
                    <option>Select product</option>
                    <option>The Legend 4CH</option>
                    <option>M4 2CH</option>
                    <option>M4 3CH</option>
                    <option>M4 QUAD</option>
                    <option>XR10 Pro</option>
                    <option>DC4K Plus</option>
                  </select>
                  <select className="w-full bg-[#0b1017] text-[#eef3f8] border border-white/[.08] rounded-[14px] px-3.5 py-3">
                    <option>Select install type</option>
                    <option>Hardwire install</option>
                    <option>Standard install</option>
                    <option>Multi-camera setup</option>
                    <option>Rear camera install</option>
                  </select>
                  <textarea
                    placeholder="Vehicle details, preferred schedule, and any notes about wiring complexity."
                    className="w-full bg-[#0b1017] text-[#eef3f8] border border-white/[.08] rounded-[14px] px-3.5 py-3 min-h-[96px] resize-y"
                  />
                  <div className="flex gap-2.5 flex-wrap">
                    <button className="rounded-full px-5 py-3 font-extrabold text-sm bg-gradient-to-b from-orange-400 to-orange-500 text-[#15100c]">Request a Quote</button>
                    <button className="rounded-full px-5 py-3 font-extrabold text-sm border border-white/[.08] bg-white/[.03]">Message</button>
                    <button className="rounded-full px-5 py-3 font-extrabold text-sm border border-white/[.08] bg-white/[.03]">Call</button>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </section>

        {/* Gallery */}
        {media.length > 0 && (
          <section className="py-5" id="gallery">
            <div className="w-[min(calc(100%-28px),1240px)] mx-auto">
              <Card>
                <div className="mb-4">
                  <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">Trust Builder #1</div>
                  <h2 className="mt-1.5 mb-2 text-[32px] font-bold tracking-[-0.03em]">Real install gallery</h2>
                  <p className="text-[#95a2b1]">UGC first — proof that this installer has done similar work before.</p>
                </div>
                {/* Tabs */}
                <div className="flex gap-2.5 flex-wrap mb-4">
                  <button
                    onClick={() => setGalleryTab("photos")}
                    className={`px-3.5 py-2.5 rounded-full text-[13px] font-extrabold border transition ${
                      galleryTab === "photos" ? "border-orange-500/30 bg-orange-500/12 text-[#ffc79f]" : "border-white/[.08] bg-white/[.03] text-[#d8e1ec]"
                    }`}
                  >
                    Install Photos ({photos.length})
                  </button>
                  <button
                    onClick={() => setGalleryTab("videos")}
                    className={`px-3.5 py-2.5 rounded-full text-[13px] font-extrabold border transition ${
                      galleryTab === "videos" ? "border-orange-500/30 bg-orange-500/12 text-[#ffc79f]" : "border-white/[.08] bg-white/[.03] text-[#d8e1ec]"
                    }`}
                  >
                    Install Videos ({videos.length})
                  </button>
                </div>
                {/* Grid */}
                <div className="grid grid-cols-3 gap-3.5 max-lg:grid-cols-1">
                  {visibleGallery.length > 0 ? visibleGallery.map((m) => (
                    <div key={m.id} className="relative overflow-hidden rounded-[18px] border border-white/[.08] bg-[#0d1218] min-h-[240px]">
                      {m.type === "video" ? (
                        <>
                          <video src={m.url} className="w-full h-full object-cover opacity-92 min-h-[240px]" muted preload="metadata" />
                          <span className="absolute top-3 right-3 py-1.5 px-2.5 rounded-full bg-orange-500/95 text-[#130d08] text-xs font-black">Video</span>
                        </>
                      ) : (
                        <Image src={m.url} alt={m.caption || ""} fill className="object-cover opacity-92" sizes="(max-width: 1024px) 100vw, 33vw" />
                      )}
                      {m.caption && (
                        <div className="absolute left-3 right-3 bottom-3 p-2.5 rounded-[14px]" style={{ background: "rgba(8,11,16,.72)", backdropFilter: "blur(8px)" }}>
                          <span className="text-xs text-[#d3dce6]">{m.caption}</span>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-12 text-[#95a2b1]">
                      No {galleryTab} available yet.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="py-5" id="reviews">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto">
            <Card>
              <div className="mb-4">
                <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">Trust Builder #2</div>
                <h2 className="mt-1.5 mb-2 text-[32px] font-bold tracking-[-0.03em]">Customer reviews</h2>
              </div>
              <div className="flex gap-3.5 items-center flex-wrap mb-4">
                <div className="text-[42px] font-black leading-none">{d.rating.toFixed(1)}</div>
                <div>
                  <div className="text-[#ffc857] font-extrabold text-[15px]">{stars} {d.reviewCount} reviews</div>
                </div>
              </div>
              {d.customerQuote ? (
                <div className="grid gap-3.5">
                  <div className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06]">
                    <strong className="block mb-1.5 text-base">Customer Review</strong>
                    <p className="text-sm text-[#d7e0ea] m-0">&ldquo;{d.customerQuote}&rdquo;</p>
                  </div>
                </div>
              ) : (
                <p className="text-[#95a2b1] text-sm">No reviews yet.</p>
              )}
            </Card>
          </div>
        </section>

        {/* Support & Services — two col */}
        <section className="py-5">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto grid grid-cols-2 gap-5 max-lg:grid-cols-1">
            {/* Supported Products */}
            <Card>
              <div className="mb-4">
                <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">Fit Signals</div>
                <h2 className="mt-1.5 mb-2 text-[32px] font-bold tracking-[-0.03em]">Supported products & scenarios</h2>
              </div>
              <div className="grid gap-2.5">
                {supportBullets.length > 0 ? supportBullets.map((b) => (
                  <div key={b} className="py-3 px-3.5 rounded-[14px] bg-white/[.03] border border-white/[.06] text-sm text-[#d5dee8]">{b}</div>
                )) : (
                  <p className="text-[#95a2b1] text-sm">No details yet.</p>
                )}
              </div>
            </Card>

            {/* Services & Pricing */}
            <Card>
              <div className="mb-4">
                <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">What they offer</div>
                <h2 className="mt-1.5 mb-2 text-[32px] font-bold tracking-[-0.03em]">Services & pricing</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {services.map((s) => (
                  <div key={s.title} className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06]">
                    <strong className="block mb-2 text-base">{s.title}</strong>
                    <span className="text-[#95a2b1] text-[13px]">{s.desc}</span>
                    <div className="text-2xl font-black mt-3">{s.price}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* About & Business — two col */}
        <section className="py-5">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto grid grid-cols-2 gap-5 max-lg:grid-cols-1">
            <Card>
              <div className="mb-4">
                <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">About</div>
                <h2 className="mt-1.5 text-[32px] font-bold tracking-[-0.03em]">About this installer</h2>
              </div>
              <div className="grid gap-2.5">
                {d.bio && <div className="py-3 px-3.5 rounded-[14px] bg-white/[.03] border border-white/[.06] text-sm text-[#d5dee8]">{d.bio}</div>}
                {d.specialties && <div className="py-3 px-3.5 rounded-[14px] bg-white/[.03] border border-white/[.06] text-sm text-[#d5dee8]">Specialties: {d.specialties}</div>}
                {d.facts.map((f) => (
                  <div key={f} className="py-3 px-3.5 rounded-[14px] bg-white/[.03] border border-white/[.06] text-sm text-[#d5dee8]">{f}</div>
                ))}
                {!d.bio && !d.specialties && d.facts.length === 0 && (
                  <p className="text-[#95a2b1] text-sm">No details yet.</p>
                )}
              </div>
            </Card>
            <Card>
              <div className="mb-4">
                <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">Business details</div>
                <h2 className="mt-1.5 text-[32px] font-bold tracking-[-0.03em]">Business details</h2>
              </div>
              <div className="grid gap-2.5">
                {d.region && <div className="py-3 px-3.5 rounded-[14px] bg-white/[.03] border border-white/[.06] text-sm text-[#d5dee8]">Location: {d.region}</div>}
                <div className="py-3 px-3.5 rounded-[14px] bg-white/[.03] border border-white/[.06] text-sm text-[#d5dee8]">
                  Service type: {serviceType}
                </div>
                {d.serviceArea && <div className="py-3 px-3.5 rounded-[14px] bg-white/[.03] border border-white/[.06] text-sm text-[#d5dee8]">Service area: {d.serviceArea}</div>}
                {d.weekendAvailable && <div className="py-3 px-3.5 rounded-[14px] bg-white/[.03] border border-white/[.06] text-sm text-[#d5dee8]">Weekend appointments available</div>}
                {d.fastResponse && <div className="py-3 px-3.5 rounded-[14px] bg-white/[.03] border border-white/[.06] text-sm text-[#d5dee8]">Responds within 2 hours</div>}
              </div>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-5">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto">
            <Card>
              <div className="mb-4">
                <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">FAQ</div>
                <h2 className="mt-1.5 text-[32px] font-bold tracking-[-0.03em]">Common pre-contact questions</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-1">
                {d.offersMobile && (
                  <div className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06]">
                    <strong className="block mb-2">Do you offer mobile installation?</strong>
                    <span className="text-[#95a2b1] text-[13px]">Yes{d.serviceArea ? `, within ${d.serviceArea}` : ""}.</span>
                  </div>
                )}
                {d.hasHardwire && (
                  <div className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06]">
                    <strong className="block mb-2">Can you do hardwire installs?</strong>
                    <span className="text-[#95a2b1] text-[13px]">Yes. Fuse box wiring for parking mode and clean cable routing.</span>
                  </div>
                )}
                <div className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06]">
                  <strong className="block mb-2">Do you test the system before handoff?</strong>
                  <span className="text-[#95a2b1] text-[13px]">Yes. All channels and settings are checked before completion.</span>
                </div>
                {d.weekendAvailable && (
                  <div className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06]">
                    <strong className="block mb-2">Do you accept weekend bookings?</strong>
                    <span className="text-[#95a2b1] text-[13px]">Yes, weekend appointments are available.</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Related Installers */}
        {related.length > 0 && (
          <section className="py-5">
            <div className="w-[min(calc(100%-28px),1240px)] mx-auto">
              <Card>
                <div className="mb-4">
                  <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">Alternatives</div>
                  <h2 className="mt-1.5 text-[32px] font-bold tracking-[-0.03em]">Nearby alternatives</h2>
                </div>
                <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-1">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/network/installer/${r.id}`}
                      className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06] hover:border-orange-500/30 transition block"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {r.avatarUrl ? (
                          <img src={r.avatarUrl} alt={r.name} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-white/[.06] grid place-items-center text-sm font-bold text-[#ffd6b7]">
                            {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                          </div>
                        )}
                        <strong className="text-base">{r.name}</strong>
                      </div>
                      <span className="text-[#95a2b1] text-[13px]">
                        {[
                          r.region,
                          [r.offersMobile && "Mobile", r.offersShop && "Shop"].filter(Boolean).join(" + "),
                          r.rating > 0 ? `${r.rating.toFixed(1)}★` : null,
                        ].filter(Boolean).join(" • ")}
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </section>
        )}
      </main>

      {/* Mobile Bottom Bar */}
      <div className="hidden max-md:block sticky bottom-0 z-40" style={{ background: "linear-gradient(180deg, rgba(10,13,18,0) 0%, rgba(10,13,18,.92) 26%, rgba(10,13,18,.98) 100%)" }}>
        <div className="w-[min(calc(100%-28px),1240px)] mx-auto p-2.5">
          <div className="grid grid-cols-3 gap-2.5 p-2.5 rounded-[18px] border border-white/[.08]" style={{ background: "rgba(17,25,36,.92)", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
            <button className="rounded-full py-2.5 font-extrabold text-sm border border-white/[.08] bg-white/[.03]">Message</button>
            <button className="rounded-full py-2.5 font-extrabold text-sm border border-white/[.08] bg-white/[.03]">Call</button>
            <button className="rounded-full py-2.5 font-extrabold text-sm bg-gradient-to-b from-orange-400 to-orange-500 text-[#15100c]">Quote</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-9 pb-14 text-[#95a2b1] text-sm">
        <div className="w-[min(calc(100%-28px),1240px)] mx-auto p-5 rounded-[22px] bg-white/[.03] border border-white/[.06] flex justify-between gap-4 flex-wrap">
          <div>
            <strong className="block text-[#eef3f8] mb-1.5">Acumen Installer Detail</strong>
            <span>A trust-building page for final pre-contact decisions.</span>
          </div>
          <div>Page 3 of 3</div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Card wrapper matching the dark theme
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[28px] border border-white/[.08] p-6 max-md:p-5 ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))",
        boxShadow: "0 24px 60px rgba(0,0,0,.35)",
      }}
    >
      {children}
    </div>
  );
}
