"use client";

import type { SearchParams } from "@/lib/network";

type Props = {
  params: SearchParams;
  onChange: (params: SearchParams) => void;
};

type FilterItem = {
  key: keyof SearchParams;
  label: string;
};

const COMPATIBILITY: FilterItem[] = [
  { key: "hardwire", label: "Hardwire experience" },
  { key: "multi", label: "Multi-camera setup" },
  { key: "jeep", label: "Jeep / off-road experience" },
];

const SERVICE: FilterItem[] = [
  { key: "mobile", label: "Mobile installation" },
  { key: "shop", label: "Shop installation" },
];

const TRUST: FilterItem[] = [
  { key: "topRated", label: "4.5+ stars" },
  { key: "manyReviews", label: "10+ reviews" },
  { key: "fast", label: "Responds within 2 hours" },
];

const AVAILABILITY: FilterItem[] = [
  { key: "week", label: "Available this week" },
  { key: "weekend", label: "Weekend appointments" },
];

function FilterGroup({ title, items, params, onChange }: { title: string; items: FilterItem[] } & Props) {
  return (
    <div className="pt-3.5 mt-3.5 border-t border-white/[.06]">
      <h4 className="m-0 mb-2.5 text-[13px] text-[#d6deea] uppercase tracking-wider font-bold">{title}</h4>
      <div className="grid gap-2">
        {items.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 text-sm text-[#95a2b1] cursor-pointer">
            <input
              type="checkbox"
              checked={params[key] as boolean}
              onChange={(e) => onChange({ ...params, [key]: e.target.checked })}
              className="accent-orange-500"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function FilterSidebar({ params, onChange }: Props) {
  const reset = () => {
    onChange({
      ...params,
      hardwire: false,
      multi: false,
      jeep: false,
      mobile: false,
      shop: false,
      topRated: false,
      manyReviews: false,
      fast: false,
      week: false,
      weekend: false,
    });
  };

  return (
    <aside
      className="rounded-[28px] border border-white/[.08] p-6 sticky top-[92px] max-lg:static"
      style={{
        background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))",
        boxShadow: "0 24px 60px rgba(0,0,0,.35)",
      }}
    >
      <div className="flex justify-between items-center gap-2.5">
        <h3 className="text-[22px] font-bold m-0">Filters</h3>
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-4 py-2.5 text-sm font-extrabold border border-white/[.08] bg-white/[.03] text-[#eef3f8]"
        >
          Reset
        </button>
      </div>
      <FilterGroup title="Compatibility" items={COMPATIBILITY} params={params} onChange={onChange} />
      <FilterGroup title="Service Type" items={SERVICE} params={params} onChange={onChange} />
      <FilterGroup title="Trust" items={TRUST} params={params} onChange={onChange} />
      <FilterGroup title="Availability" items={AVAILABILITY} params={params} onChange={onChange} />
    </aside>
  );
}
