"use client";

import Image from "next/image";
import Link from "next/link";
import type { InstallerCardData } from "@/lib/network";
import { PRODUCT_LABEL_MAP } from "@/lib/network";

type Props = {
  installer: InstallerCardData;
  searchZip: string;
};

export function InstallerCard({ installer: d, searchZip }: Props) {
  const initials = d.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  const serviceType = [d.offersMobile && "Mobile", d.offersShop && "Shop"]
    .filter(Boolean)
    .join(" + ");

  const detailHref = `/network/installer/${d.id}`;

  // Build specs from supportedProducts + installTypes
  const specs: string[] = [];
  if (d.supportedProducts.length > 0) {
    specs.push(d.supportedProducts.map((p) => PRODUCT_LABEL_MAP[p] || p).join(" / "));
  }
  d.installTypes.forEach((t) => {
    const labels: Record<string, string> = {
      hardwire: "Hardwire to fuse box",
      standard: "Standard installation",
      multi: "Multi-camera setup",
      rear: "Rear camera install",
    };
    if (labels[t]) specs.push(labels[t]);
  });

  return (
    <article className="grid grid-cols-[1.1fr_.9fr] max-lg:grid-cols-1 rounded-[24px] overflow-hidden border border-white/[.08]"
      style={{ background: "linear-gradient(180deg, rgba(25,35,48,.98), rgba(17,24,34,.98))" }}
    >
      {/* Main info */}
      <div className="p-5">
        {/* Top row: avatar + name + price */}
        <div className="flex justify-between items-start gap-3.5 mb-3">
          <div className="flex gap-3.5 items-center">
            <div className="w-[60px] h-[60px] rounded-[18px] border border-white/[.06] text-[#ffd6b7] font-black grid place-items-center text-lg shrink-0"
              style={{ background: "linear-gradient(135deg, #223043, #16202d)" }}
            >
              {d.avatarUrl ? (
                <Image src={d.avatarUrl} alt={d.name} width={60} height={60} className="rounded-[18px] object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h4 className="text-[22px] font-bold m-0 mb-1">{d.name}</h4>
              <div className="text-[#ffc857] font-extrabold text-sm">
                {"★".repeat(Math.round(d.rating))} {d.rating.toFixed(1)}{" "}
                <span className="text-[#95a2b1] font-normal">({d.reviewCount} reviews)</span>
              </div>
              <div className="text-[#95a2b1] text-sm mt-0.5">
                {serviceType} {d.fastResponse ? "• Responds within 2 hours" : "• Standard response time"}
              </div>
            </div>
          </div>
          {d.startingPrice != null && (
            <div className="text-right shrink-0">
              <strong className="block text-[28px] leading-tight">${d.startingPrice}+</strong>
              <span className="text-[#95a2b1] text-[13px]">Starting price</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {d.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {d.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-2 rounded-full text-xs font-extrabold bg-orange-500/12 border border-orange-500/20 text-[#ffc79f]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {d.bio && <p className="text-[15px] text-[#dbe3ed] mb-3.5">{d.bio}</p>}

        {/* Specs */}
        {specs.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 mb-3.5 max-md:grid-cols-1">
            {specs.slice(0, 4).map((s) => (
              <div key={s} className="py-2.5 px-3 rounded-[14px] bg-white/[.03] border border-white/[.06] text-sm text-[#d8e2ed]">
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Quote */}
        {d.customerQuote && (
          <div className="rounded-[14px] py-3 px-3.5 bg-white/[.03] border-l-3 border-l-orange-500 text-[#cbd4df] text-sm mb-3.5">
            &ldquo;{d.customerQuote}&rdquo;
          </div>
        )}

        {/* Facts */}
        {d.facts.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3.5">
            {d.facts.map((f) => (
              <span key={f} className="text-[#95a2b1] text-[13px] px-2.5 py-2 rounded-full bg-white/[.025] border border-white/[.05]">
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2.5 flex-wrap">
          <Link
            href={detailHref}
            className="rounded-full px-4 py-2.5 text-sm font-extrabold border border-white/[.08] bg-white/[.03] text-[#eef3f8] inline-flex items-center"
          >
            View Details
          </Link>
          <Link
            href={`${detailHref}#contact`}
            className="rounded-full px-4 py-2.5 text-sm font-extrabold bg-gradient-to-b from-orange-400 to-orange-500 text-[#15100c] inline-flex items-center"
          >
            Request Install
          </Link>
        </div>
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-2 grid-rows-2 bg-[#0d1218]">
        {d.uploads.length > 0
          ? d.uploads.slice(0, 4).map((media) => (
              <div key={media.id} className="relative min-h-[160px] overflow-hidden">
                {media.fileType.startsWith("video") ? (
                  <>
                    <video src={media.fileUrl} className="w-full h-full object-cover opacity-90" muted />
                    <span className="absolute top-3 right-3 py-1.5 px-2.5 rounded-full bg-orange-500/95 text-[#130d08] text-xs font-black">
                      Video
                    </span>
                  </>
                ) : (
                  <Image
                    src={media.fileUrl}
                    alt={media.caption || d.name}
                    fill
                    className="object-cover opacity-90"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
                {media.caption && (
                  <div className="absolute left-3 right-3 bottom-3 py-2 px-2.5 rounded-xl text-xs" style={{ background: "rgba(8,11,16,.7)" }}>
                    {media.caption}
                  </div>
                )}
              </div>
            ))
          : /* Placeholder when no uploads */
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-h-[160px] bg-[#111924] flex items-center justify-center text-[#95a2b1] text-xs">
                No media
              </div>
            ))}
      </div>
    </article>
  );
}
