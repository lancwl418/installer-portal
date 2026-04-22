import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Join the Acumen Installer Network",
  description:
    "Get discovered by Acumen owners in your area, showcase your install photos and videos, and turn your product expertise into qualified local inquiries.",
};

export default function InstallerNetworkPage() {
  return (
    <div className="min-h-screen bg-[#0a0d12] text-[#eef3f8] font-[Inter,Arial,sans-serif]"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(249,115,22,.14), transparent 22%), linear-gradient(180deg, #090c11 0%, #0b1017 34%, #0a0d12 100%)",
      }}
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-white/[.06]" style={{ background: "rgba(8,11,16,.72)", backdropFilter: "blur(18px)" }}>
        <div className="w-[min(calc(100%-28px),1240px)] mx-auto min-h-[74px] flex items-center justify-between gap-4 flex-wrap max-md:py-3">
          <Link href="/network" className="flex items-center gap-3 font-black tracking-wider uppercase">
            <span className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-orange-500 to-orange-400 text-[#120d08] grid place-items-center font-black text-lg">
              A
            </span>
            <span>ACUMEN</span>
          </Link>
          <nav className="flex gap-6 text-[#95a2b1] text-sm max-md:hidden">
            <a href="#why">Why Join</a>
            <a href="#showcase">Showcase</a>
            <a href="#apply">Apply</a>
            <Link href="/network/find">Find Installer</Link>
          </nav>
          <div className="flex gap-2.5 max-md:w-full">
            <Link
              href="/network/find"
              className="rounded-full px-5 py-3 font-extrabold text-sm inline-flex items-center justify-center border border-white/[.08] bg-white/[.03] max-md:flex-1"
            >
              Looking for an installer?
            </Link>
            <a
              href="#apply"
              className="rounded-full px-5 py-3 font-extrabold text-sm inline-flex items-center justify-center bg-gradient-to-b from-orange-400 to-orange-500 text-[#15100c] max-md:flex-1"
            >
              Apply to Join
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-12 max-md:py-8">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto grid grid-cols-[1.05fr_.95fr] gap-5 max-lg:grid-cols-1">
            {/* Hero Copy */}
            <div className="rounded-[28px] border border-white/[.08] p-13 max-md:p-5" style={{ background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
              <span className="inline-flex px-3.5 py-2 rounded-full bg-orange-500/12 border border-orange-500/20 text-[#ffc79f] text-xs font-extrabold uppercase tracking-wider mb-4">
                For installers and custom shops
              </span>
              <h1 className="text-[clamp(40px,5vw,72px)] font-black leading-[0.96] tracking-[-0.05em] max-w-[9ch] max-md:max-w-none max-md:text-[42px]">
                Join the Acumen Installer Network.
              </h1>
              <p className="mt-4 text-[#aab6c4] text-[17px] max-w-[58ch]">
                Get discovered by Acumen owners in your area, showcase your install photos and videos, and turn your product expertise into qualified local inquiries.
              </p>
              <div className="grid grid-cols-3 gap-3.5 mt-7 max-lg:grid-cols-1">
                <div className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06]">
                  <strong className="block text-2xl mb-1">Local leads</strong>
                  <span className="text-[13px] text-[#95a2b1]">Be found by customers already looking for installation help.</span>
                </div>
                <div className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06]">
                  <strong className="block text-2xl mb-1">Show your work</strong>
                  <span className="text-[13px] text-[#95a2b1]">Display install photos, videos, vehicle types, and product expertise.</span>
                </div>
                <div className="p-4 rounded-[18px] bg-white/[.03] border border-white/[.06]">
                  <strong className="block text-2xl mb-1">Build trust</strong>
                  <span className="text-[13px] text-[#95a2b1]">Grow with ratings, reviews, and a full public profile.</span>
                </div>
              </div>
            </div>

            {/* Hero Side */}
            <aside className="rounded-[28px] border border-white/[.08] p-6 max-md:p-5" style={{ background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
              <h2 className="text-[28px] font-bold m-0">Why installers join</h2>
              <p className="mt-2 mb-4 text-[#95a2b1]">
                This page is built for installers first. It should answer one question clearly: &ldquo;What do I get by joining?&rdquo;
              </p>
              <div className="grid gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[.03] border border-white/[.06]">
                  <strong className="block mb-1">Get seen by the right customers</strong>
                  <span className="text-sm text-[#95a2b1]">Acumen users can search by ZIP, product, vehicle type, and install complexity.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[.03] border border-white/[.06]">
                  <strong className="block mb-1">Present your work professionally</strong>
                  <span className="text-sm text-[#95a2b1]">Your profile can highlight hardwire setups, Jeep builds, multi-camera installs, and more.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[.03] border border-white/[.06]">
                  <strong className="block mb-1">Make trust visible</strong>
                  <span className="text-sm text-[#95a2b1]">Reviews, response speed, pricing range, and real UGC all help convert visitors into inquiries.</span>
                </div>
              </div>
              <div className="flex gap-2.5 flex-wrap mt-4">
                <a
                  href="#apply"
                  className="rounded-full px-5 py-3 font-extrabold text-sm inline-flex items-center justify-center bg-gradient-to-b from-orange-400 to-orange-500 text-[#15100c]"
                >
                  Apply to Join
                </a>
                <a
                  href="#showcase"
                  className="rounded-full px-5 py-3 font-extrabold text-sm inline-flex items-center justify-center border border-white/[.08] bg-white/[.03]"
                >
                  See how profiles look
                </a>
              </div>
            </aside>
          </div>
        </section>

        {/* Why Join */}
        <section className="py-6" id="why">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto">
            <div className="mb-4">
              <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">Why Join</div>
              <h2 className="mt-1.5 mb-2 text-[34px] font-bold tracking-[-0.03em]">
                A network designed to show your work, not hide it.
              </h2>
              <p className="text-[#95a2b1] max-w-[62ch]">
                The goal of this page is recruitment. Every section should make installers feel that joining the network helps them get discovered, look credible, and win better-fit jobs.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3.5 max-lg:grid-cols-1">
              {[
                { title: "Qualified discovery", desc: "Customers searching on Page 2 are already looking for someone to install an Acumen product." },
                { title: "Product fit visibility", desc: "Show which Acumen models you support and what types of installs you handle best." },
                { title: "Vehicle expertise", desc: "Highlight Jeeps, trucks, SUVs, vans, RVs, or daily-driver installs so customers self-match faster." },
                { title: "Proof through UGC", desc: "Use photos and videos to let customers understand the quality of your work before they contact you." },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-2xl bg-white/[.03] border border-white/[.06]">
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-[#95a2b1] m-0">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* UGC Showcase */}
        <section className="py-6" id="showcase">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto grid grid-cols-[1.25fr_.75fr] gap-4 max-lg:grid-cols-1">
            {/* Gallery Main */}
            <div className="rounded-[28px] border border-white/[.08] p-5" style={{ background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
              <div className="mb-4">
                <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">UGC Showcase</div>
                <h2 className="mt-1.5 mb-2 text-[34px] font-bold tracking-[-0.03em]">
                  This is how your work will be seen.
                </h2>
                <p className="text-[#95a2b1] max-w-[62ch]">
                  This section is the most important recruiting proof: installers should immediately understand how their photos, videos, and specialization will appear to customers.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                {[
                  { img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", name: "ProInstall LA", desc: "Jeep Wrangler • The Legend 4CH • Hardwire" },
                  { img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80", name: "Cali Wiring Garage", desc: "Truck • M4 QUAD • Multi-camera setup" },
                  { img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80", name: "TrailTech Mobile Install", desc: "Van / RV • Rear routing • Outdoor build" },
                  { img: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80", name: "MirrorCam Pros OC", desc: "Sedan • XR10 Pro • Standard install" },
                ].map((item) => (
                  <div key={item.name} className="relative rounded-[18px] overflow-hidden min-h-[220px] bg-[#0d1218] border border-white/[.06]">
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      className="object-cover opacity-92"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute left-3 right-3 bottom-3 p-2.5 rounded-[14px]" style={{ background: "rgba(8,11,16,.72)", backdropFilter: "blur(8px)" }}>
                      <strong className="block text-sm">{item.name}</strong>
                      <span className="text-xs text-[#d3dce6]">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery Side */}
            <aside className="rounded-[28px] border border-white/[.08] p-5" style={{ background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
              <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f] mb-3">What customers will notice</div>
              <div className="grid gap-3">
                {[
                  { title: "Photos and videos first", desc: "UGC is the strongest proof of craftsmanship and should do most of the persuasion." },
                  { title: "Clear fit signals", desc: "Products, vehicle types, and install scenarios help customers decide whether to click your profile." },
                  { title: "Trust builders", desc: "Reviews, ratings, response speed, and \"mobile vs. shop\" service make the decision easier." },
                  { title: "Lead to Page 2", desc: "Featured work on this page can also act as a visual bridge into the customer search experience." },
                ].map((item) => (
                  <div key={item.title} className="p-3.5 rounded-2xl bg-white/[.03] border border-white/[.06]">
                    <strong className="block mb-1">{item.title}</strong>
                    <span className="text-sm text-[#95a2b1]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* How Joining Works */}
        <section className="py-6">
          <div className="w-[min(calc(100%-28px),1240px)] mx-auto">
            <div className="mb-4">
              <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">How joining works</div>
              <h2 className="mt-1.5 mb-2 text-[34px] font-bold tracking-[-0.03em]">
                A simple 3-step onboarding flow.
              </h2>
              <p className="text-[#95a2b1]">This should be installer-oriented, not customer-oriented.</p>
            </div>
            <div className="grid grid-cols-3 gap-3.5 max-lg:grid-cols-1">
              {[
                { num: "1", title: "Apply", desc: "Submit business info, service area, installation capabilities, and supported Acumen products." },
                { num: "2", title: "Build your profile", desc: "Upload install photos and videos, list vehicle types, describe specialties, and add pricing guidance." },
                { num: "3", title: "Start receiving inquiries", desc: "Get discovered by local Acumen owners searching for the right installer match." },
              ].map((step) => (
                <div key={step.num} className="p-4 rounded-2xl bg-white/[.03] border border-white/[.06]">
                  <div className="w-[34px] h-[34px] rounded-full grid place-items-center bg-orange-500/12 text-[#ffc79f] font-black mb-3">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-[#95a2b1] m-0">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Apply CTA */}
        <section className="py-6" id="apply">
          <div
            className="w-[min(calc(100%-28px),1240px)] mx-auto rounded-[28px] border border-white/[.08] p-5 grid grid-cols-[1.1fr_.9fr] gap-4 items-center max-lg:grid-cols-1"
            style={{ background: "linear-gradient(180deg, rgba(17,25,36,.92), rgba(13,20,30,.92))", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}
          >
            <div>
              <div className="text-xs font-extrabold tracking-wider uppercase text-[#ffc79f]">Apply</div>
              <h2 className="mt-1.5 mb-0 text-[34px] font-bold tracking-[-0.03em]">Ready to join the network?</h2>
              <p className="mt-2 text-[#95a2b1]">
                Page 1 should end with a strong recruitment action, because its success metric is installer applications and more tagged / shareable installation content.
              </p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              <a
                href="#"
                className="rounded-full px-5 py-3 font-extrabold text-sm inline-flex items-center justify-center bg-gradient-to-b from-orange-400 to-orange-500 text-[#15100c]"
              >
                Apply to Join
              </a>
              <Link
                href="/network/find"
                className="inline-flex items-center gap-2 text-[#ffc79f] font-bold text-sm"
              >
                Already an Acumen owner? Go to Find Installer →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-9 pb-14 text-[#95a2b1] text-sm">
        <div className="w-[min(calc(100%-28px),1240px)] mx-auto p-5 rounded-[22px] bg-white/[.03] border border-white/[.06] flex justify-between gap-4 flex-wrap">
          <div>
            <strong className="block text-[#eef3f8] mb-1.5">Acumen Installer Network</strong>
            <span>A recruitment-first page for installers and custom shops.</span>
          </div>
          <div>Page 1 of 3</div>
        </div>
      </footer>
    </div>
  );
}
