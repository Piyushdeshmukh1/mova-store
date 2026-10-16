"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart, useWishlist } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { SiteSettings, SocialSettings } from "@/lib/defaults";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";

type Nav = { id: number; label: string; url: string; openInNewTab: boolean }[];

const ACCENTS = [
  { bar: "bg-coral", dot: "bg-coral", tint: "bg-coral-100" },
  { bar: "bg-mint-600", dot: "bg-mint-600", tint: "bg-mint-200" },
  { bar: "bg-forest-600", dot: "bg-forest-600", tint: "bg-cream-300" },
];

export function Header({ nav, site, social }: { nav: Nav; site: SiteSettings; social: SocialSettings }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mounted, setMounted] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const bump = useCart((s) => s.bump);
  const openDrawer = useCart((s) => s.openDrawer);
  const wishCount = useWishlist((s) => s.ids.length);

  const bagItem = nav.find((n) => n.url === "/cart");
  const links = nav.filter((n) => n.url !== "/cart");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url.split("?")[0]));

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/collection?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <header className={cn("sticky top-0 z-40 transition-all duration-500", scrolled ? "bg-cream/85 shadow-[0_1px_0_rgba(18,60,53,.08)] backdrop-blur-xl" : "bg-cream")}>
        <div aria-hidden className="h-[3px] w-full bg-gradient-to-r from-coral via-mint to-forest-600" />
        <div className={cn("container flex items-center gap-4 transition-all duration-500", scrolled ? "h-16" : "h-20")}>
          <button className="-ml-2 grid h-11 w-11 place-items-center rounded-full transition-all duration-300 hover:-rotate-6 hover:bg-mint/40 xl:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            <Menu className="h-6 w-6 text-forest" />
          </button>

          <Logo brand={site.brandName} logoUrl={site.logoUrl} className="xl:mr-6" />

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="Main">
            {links.map((l, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              const active = isActive(l.url);
              return (
                <Link key={l.id} href={l.url} target={l.openInNewTab ? "_blank" : undefined}
                  className="group relative rounded-full px-4 py-2.5 font-display text-[12px] font-bold tracking-[0.08em] text-forest transition-all duration-300 hover:-translate-y-0.5">
                  <span aria-hidden className={cn("absolute inset-0 scale-75 rounded-full opacity-0 transition-all duration-300 ease-out", accent.tint,
                    active ? "scale-100 opacity-100" : "group-hover:scale-100 group-hover:opacity-100")} />
                  <span aria-hidden className={cn("absolute left-1/2 top-0.5 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1 scale-0 rounded-full opacity-0 transition-all duration-300", accent.dot,
                    active ? "scale-100 opacity-100" : "group-hover:scale-100 group-hover:opacity-100")} />
                  <span className="relative z-10">{l.label}</span>
                  <span aria-hidden className={cn("absolute inset-x-4 -bottom-0.5 h-[2.5px] origin-left scale-x-0 rounded-full transition-transform duration-300", accent.bar,
                    active ? "scale-x-100" : "group-hover:scale-x-100")} />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 xl:ml-0">
            <button onClick={() => setSearchOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-full text-forest transition-all duration-300 hover:scale-110 hover:bg-coral-100 hover:text-coral-600" aria-label="Search">
              <Search className="h-[21px] w-[21px]" />
            </button>
            <Link href="/wishlist" className="relative hidden h-11 w-11 place-items-center rounded-full text-forest transition-all duration-300 hover:scale-110 hover:bg-coral-100 hover:text-coral-600 sm:grid" aria-label="Wishlist">
              <Heart className={cn("h-[21px] w-[21px] transition", mounted && wishCount > 0 && "fill-coral text-coral")} />
              {mounted && wishCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-coral" />}
            </Link>
            <Link href="/account" className="hidden h-11 w-11 place-items-center rounded-full text-forest transition-all duration-300 hover:scale-110 hover:bg-cream-300 hover:text-forest-600 sm:grid" aria-label="Account">
              <User className="h-[21px] w-[21px]" />
            </Link>
            <button onClick={() => openDrawer(true)}
              className="ml-1 flex h-11 items-center gap-2 rounded-full bg-forest pl-4 pr-1.5 text-cream transition-all duration-300 hover:bg-forest-600 hover:shadow-[0_8px_24px_-8px_rgba(255,128,102,.7)]"
              aria-label={`${bagItem?.label ?? "Bag"}, ${count} items`}>
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span className="hidden font-display text-[12px] font-bold tracking-[0.08em] md:inline">{bagItem?.label ?? "BAG"}</span>
              <span key={bump} className={cn("grid h-8 min-w-8 place-items-center rounded-full bg-mint px-1.5 text-[12px] font-bold text-forest", mounted && bump > 0 && "animate-pop")}>
                {mounted ? count : 0}
              </span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="animate-fade border-t border-forest/10 bg-cream">
            <form onSubmit={submitSearch} className="container flex items-center gap-3 py-4" role="search">
              <Search className="h-5 w-5 text-sage" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search towels, handkerchiefs, combos"
                className="flex-1 bg-transparent font-display text-xl font-semibold text-forest placeholder:text-sage/70 focus:outline-none md:text-2xl" aria-label="Search products" />
              <button type="button" onClick={() => setSearchOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-mint/40" aria-label="Close search"><X className="h-5 w-5" /></button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile slide-out */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 animate-fade bg-charcoal/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-[420px] animate-slideinleft flex-col overflow-y-auto bg-forest text-cream">
            <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-mint/20 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-coral/15 blur-3xl" />
            <div className="relative z-10 flex h-20 items-center justify-between px-6">
              <Logo brand={site.brandName} logoUrl={site.logoUrl} light />
              <button onClick={() => setMenuOpen(false)} className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 transition hover:rotate-90 hover:bg-cream/20" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="relative z-10 flex-1 px-6 pt-4" aria-label="Mobile">
              <ul className="space-y-1">
                {nav.map((l, i) => {
                  const accent = ACCENTS[i % ACCENTS.length];
                  return (
                    <li key={l.id} className="animate-rise" style={{ animationDelay: `${80 + i * 45}ms` }}>
                      <Link href={l.url} className="group flex items-center justify-between gap-3 border-b border-cream/10 py-4 transition-all duration-300 hover:pl-2">
                        <span className="flex items-baseline gap-3">
                          <span className={cn("font-display text-xs font-bold", accent.bar.replace("bg-", "text-"))}>{String(i + 1).padStart(2, "0")}</span>
                          <span className={cn("font-display text-[26px] font-extrabold tracking-tight transition group-hover:text-mint",
                            isActive(l.url) ? "text-mint" : "text-cream")}>
                            {l.label}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          {l.url === "/cart" && <span className="text-base font-bold text-coral">{mounted ? count : 0}</span>}
                          <ArrowRight className="h-5 w-5 -translate-x-2 text-mint opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                <Link href="/wishlist" className="whitespace-nowrap rounded-full bg-cream/10 px-4 py-2.5 font-semibold transition hover:bg-mint hover:text-forest">Wishlist</Link>
                <Link href="/account" className="whitespace-nowrap rounded-full bg-cream/10 px-4 py-2.5 font-semibold transition hover:bg-mint hover:text-forest">My account</Link>
                <Link href="/track" className="whitespace-nowrap rounded-full bg-cream/10 px-4 py-2.5 font-semibold transition hover:bg-mint hover:text-forest">Track order</Link>
              </div>
            </nav>
            <div className="relative z-10 space-y-4 px-6 pb-8 pt-10 text-sm text-cream/70">
              <p>{site.email}<br />{site.phone}</p>
              <SocialIcons social={social} className="text-cream" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
