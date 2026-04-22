"use client";

import { PRODUCTS, VEHICLES, INSTALL_TYPES, type SearchParams } from "@/lib/network";

const QUICK_TAGS = ["Fuse box hardwire", "Jeep routing", "Rear cable hiding", "Parking monitor"];

type Props = {
  params: SearchParams;
  onChange: (params: SearchParams) => void;
  onSearch: () => void;
};

export function SearchForm({ params, onChange, onSearch }: Props) {
  const set = (key: keyof SearchParams, value: string) =>
    onChange({ ...params, [key]: value });

  return (
    <aside
      className="rounded-[28px] border border-white/[.08] p-6 max-md:p-5"
      style={{
        background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))",
        boxShadow: "0 24px 60px rgba(0,0,0,.35)",
      }}
    >
      <h2 className="text-[28px] font-bold m-0">Start your search</h2>
      <p className="mt-2 mb-4 text-[#95a2b1]">
        Use the form below to narrow the list. This page should focus on matching, not recruitment.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#d5deea]">ZIP Code</label>
            <input
              value={params.zip}
              onChange={(e) => set("zip", e.target.value)}
              className="w-full bg-[#0b1017] text-[#eef3f8] border border-white/[.08] rounded-[14px] px-3.5 py-3.5"
              placeholder="e.g. 91791"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#d5deea]">Acumen Product</label>
            <select
              value={params.product}
              onChange={(e) => set("product", e.target.value)}
              className="w-full bg-[#0b1017] text-[#eef3f8] border border-white/[.08] rounded-[14px] px-3.5 py-3.5"
            >
              {PRODUCTS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#d5deea]">Vehicle Type</label>
            <select
              value={params.vehicle}
              onChange={(e) => set("vehicle", e.target.value)}
              className="w-full bg-[#0b1017] text-[#eef3f8] border border-white/[.08] rounded-[14px] px-3.5 py-3.5"
            >
              {VEHICLES.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#d5deea]">Install Type</label>
            <select
              value={params.install}
              onChange={(e) => set("install", e.target.value)}
              className="w-full bg-[#0b1017] text-[#eef3f8] border border-white/[.08] rounded-[14px] px-3.5 py-3.5"
            >
              {INSTALL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-full max-md:col-span-1">
            <label className="text-[13px] font-bold text-[#d5deea] mb-2 block">Popular needs</label>
            <div className="flex gap-2.5 flex-wrap">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="px-3 py-2 rounded-full border border-white/[.08] bg-white/[.03] text-[#d8e1ec] text-xs font-extrabold hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-[#ffc79f] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2.5 mt-4">
          <button
            type="submit"
            className="rounded-full px-5 py-3 font-extrabold text-sm inline-flex items-center justify-center bg-gradient-to-b from-orange-400 to-orange-500 text-[#15100c]"
          >
            Search Installers
          </button>
        </div>
      </form>
    </aside>
  );
}
