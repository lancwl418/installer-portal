"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SearchForm } from "@/components/network/SearchForm";
import { FilterSidebar } from "@/components/network/FilterSidebar";
import { InstallerCard } from "@/components/network/InstallerCard";
import {
  type InstallerCardData,
  type SearchParams,
  DEFAULT_SEARCH,
  buildSearchQuery,
  PRODUCTS,
  VEHICLES,
  INSTALL_TYPES,
} from "@/lib/network";

export default function FindInstallerPage() {
  const [params, setParams] = useState<SearchParams>(DEFAULT_SEARCH);
  const [installers, setInstallers] = useState<InstallerCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  const fetchInstallers = useCallback(async (p: SearchParams) => {
    setLoading(true);
    try {
      const qs = buildSearchQuery(p);
      const res = await fetch(`/api/network/installers?${qs}`);
      const data = await res.json();
      setInstallers(data.installers || []);
    } catch {
      setInstallers([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInstallers(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when filters change
  const handleFilterChange = (next: SearchParams) => {
    setParams(next);
    fetchInstallers(next);
  };

  const handleSearch = () => {
    fetchInstallers(params);
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSortChange = (sort: string) => {
    const next = { ...params, sort };
    setParams(next);
    fetchInstallers(next);
  };

  // Active filter chips
  const chips: { label: string; value: string }[] = [];
  if (params.zip) chips.push({ label: "ZIP", value: params.zip });
  if (params.product !== "all") {
    const p = PRODUCTS.find((x) => x.value === params.product);
    if (p) chips.push({ label: "Product", value: p.label });
  }
  if (params.vehicle !== "all") {
    const v = VEHICLES.find((x) => x.value === params.vehicle);
    if (v) chips.push({ label: "Vehicle", value: v.label });
  }
  if (params.install !== "all") {
    const t = INSTALL_TYPES.find((x) => x.value === params.install);
    if (t) chips.push({ label: "Install", value: t.label });
  }

  return (
    <div
      className="min-h-screen text-[#eef3f8] font-[Inter,Arial,sans-serif]"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(249,115,22,.14), transparent 22%), linear-gradient(180deg, #090c11 0%, #0b1017 34%, #0a0d12 100%)",
      }}
    >
      {/* Top Bar */}
      <header
        className="sticky top-0 z-20 border-b border-white/[.06]"
        style={{ background: "rgba(8,11,16,.72)", backdropFilter: "blur(18px)" }}
      >
        <div className="w-[min(calc(100%-28px),1240px)] mx-auto min-h-[74px] flex items-center justify-between gap-4 flex-wrap max-md:py-3">
          <Link href="/network" className="flex items-center gap-3 font-black tracking-wider uppercase">
            <span className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-orange-500 to-orange-400 text-[#120d08] grid place-items-center font-black text-lg">
              A
            </span>
            <span>ACUMEN</span>
          </Link>
          <nav className="flex gap-6 text-[#95a2b1] text-sm max-md:hidden">
            <Link href="/network">Installer Network</Link>
            <a href="#results">Find Installer</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex gap-2.5 max-md:w-full">
            <Link
              href="/network"
              className="rounded-full px-4 py-2.5 font-extrabold text-sm inline-flex items-center justify-center border border-white/[.08] bg-white/[.03] max-md:flex-1"
            >
              Are you an installer?
            </Link>
            <a
              href="#results"
              className="rounded-full px-4 py-2.5 font-extrabold text-sm inline-flex items-center justify-center bg-gradient-to-b from-orange-400 to-orange-500 text-[#15100c] max-md:flex-1"
            >
              Search Now
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-10 max-md:py-6">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto grid grid-cols-[1.06fr_.94fr] gap-5 max-lg:grid-cols-1">
            {/* Hero Copy */}
            <div
              className="rounded-[28px] border border-white/[.08] p-6 max-md:p-5"
              style={{
                background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))",
                boxShadow: "0 24px 60px rgba(0,0,0,.35)",
              }}
            >
              <span className="inline-flex px-3.5 py-2 rounded-full bg-orange-500/12 border border-orange-500/20 text-[#ffc79f] text-xs font-extrabold uppercase tracking-wider mb-4">
                For Acumen product owners
              </span>
              <h1 className="text-[clamp(36px,4.5vw,58px)] font-black leading-[0.98] tracking-[-0.04em] max-md:text-[40px]">
                Find the right installer near you.
              </h1>
              <p className="mt-3.5 text-[#aab6c4] text-base max-w-[58ch]">
                This page is for customers who already bought an Acumen product and want to find someone nearby who can help with installation.
              </p>
              <div className="flex gap-2.5 flex-wrap mt-5">
                {["Product compatibility", "Vehicle experience", "Hardwire skill", "Ratings & reviews", "Real install photos"].map((pill) => (
                  <span key={pill} className="px-3 py-2 rounded-full border border-white/[.08] bg-white/[.03] text-[#d8e1ec] text-xs font-extrabold">
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Search Form */}
            <SearchForm params={params} onChange={setParams} onSearch={handleSearch} />
          </div>
        </section>

        {/* Results */}
        <section className="py-5" id="results">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto grid grid-cols-[290px_1fr] gap-4 items-start max-lg:grid-cols-1">
            {/* Filters */}
            <FilterSidebar params={params} onChange={handleFilterChange} />

            {/* Results Panel */}
            <div
              className="rounded-[28px] border border-white/[.08] p-6"
              style={{
                background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))",
                boxShadow: "0 24px 60px rgba(0,0,0,.35)",
              }}
            >
              {/* Results header */}
              <div className="flex justify-between items-center gap-3 flex-wrap mb-3.5">
                <div>
                  <h3 className="text-[22px] font-bold m-0">
                    {loading
                      ? "Searching..."
                      : `${installers.length} installer${installers.length === 1 ? "" : "s"}${params.zip ? ` near ${params.zip}` : ""}`}
                  </h3>
                  <div className="text-[#95a2b1] text-sm mt-1">
                    {installers.length > 0
                      ? "Compare cards by product fit, vehicle experience, install type, reviews, and real UGC."
                      : searched
                        ? "No installers match the current filters."
                        : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#95a2b1] text-sm">
                  Sort by
                  <select
                    value={params.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-[#0b1017] text-[#eef3f8] border border-white/[.08] rounded-full px-3.5 py-2.5"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="rating">Highest rated</option>
                    <option value="reviews">Most reviewed</option>
                    <option value="price">Lowest price</option>
                  </select>
                </div>
              </div>

              {/* Active chips */}
              {chips.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3.5">
                  {chips.map((c) => (
                    <span key={c.label} className="px-3 py-2 rounded-full border border-white/[.08] bg-white/[.03] text-xs font-extrabold text-[#d8e1ec]">
                      <strong className="text-[#ffc79f]">{c.label}</strong> {c.value}
                    </span>
                  ))}
                </div>
              )}

              {/* Installer list */}
              <div className="grid gap-4">
                {loading ? (
                  <div className="text-center py-12 text-[#95a2b1]">Loading installers...</div>
                ) : installers.length === 0 ? (
                  <div className="text-center py-12 text-[#95a2b1]">
                    No installers found. Try adjusting your filters.
                  </div>
                ) : (
                  installers.map((inst) => (
                    <InstallerCard key={inst.id} installer={inst} searchZip={params.zip} />
                  ))
                )}
              </div>

              {/* Bottom link */}
              <div className="mt-4">
                <Link href="/network" className="inline-flex items-center gap-2 text-[#ffc79f] font-bold text-sm">
                  Are you an installer? Join the network →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-5">
          <div
            className="w-[min(calc(100%-28px),1240px)] mx-auto rounded-[28px] border border-white/[.08] p-6"
            id="faq"
            style={{
              background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))",
              boxShadow: "0 24px 60px rgba(0,0,0,.35)",
            }}
          >
            <h3 className="text-[22px] font-bold mb-1.5">Quick FAQ</h3>
            <p className="text-[#95a2b1] mb-4 m-0">
              Keep this page focused on immediate decision questions, not recruitment education.
            </p>
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              {[
                { q: "Can I find hardwire installers?", a: "Yes. Use the hardwire and product filters to narrow the results." },
                { q: "Can I find Jeep or truck specialists?", a: "Yes. Vehicle-specific experience is one of the main comparison factors." },
                { q: "Can I compare shop vs mobile installers?", a: "Yes. Service type is visible on each card and available as a filter." },
                { q: "Why click into the detail page?", a: "Because the detail page is where users build trust through full UGC, reviews, and contact options." },
              ].map((item) => (
                <div key={item.q} className="p-4 rounded-2xl bg-white/[.03] border border-white/[.06]">
                  <strong className="block mb-1.5">{item.q}</strong>
                  <span className="text-[#95a2b1] text-sm">{item.a}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-9 pb-14 text-[#95a2b1] text-sm">
        <div className="w-[min(calc(100%-28px),1240px)] mx-auto p-5 rounded-[22px] bg-white/[.03] border border-white/[.06] flex justify-between gap-4 flex-wrap">
          <div>
            <strong className="block text-[#eef3f8] mb-1.5">Acumen Find Installer</strong>
            <span>A matching and comparison page for customers.</span>
          </div>
          <div>Page 2 of 3</div>
        </div>
      </footer>
    </div>
  );
}
