"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_SECTIONS = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "grid" },
    ],
  },
  {
    label: "INSTALLERS",
    items: [
      { label: "Installer Management", href: "/admin/installers", icon: "users" },
      { label: "Recruitment", href: "/admin/recruit", icon: "search" },
    ],
  },
];

const icons: Record<string, JSX.Element> = {
  grid: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    fetch("/api/admin/login", { method: "DELETE" }).then(() => router.push("/admin/login"));
  }

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1e1e2d] text-gray-300 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-white font-semibold text-sm">Admin</span>
        </div>

        <nav className="flex-1 px-3 pb-4 space-y-6 text-[13px]">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                        active
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      {icons[item.icon]}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-500 hover:text-gray-300 hover:bg-white/5 transition w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  );
}
