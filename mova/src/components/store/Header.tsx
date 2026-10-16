"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart, useWishlist } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { SiteSettings, SocialSettings } from "@/lib/defaults";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";

type Nav = { id: number; label: string; url: string; openInNewTab: boolean }[];

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
        <div className={cn("container flex items-center gap-4 transition-all duration-500", scrolled ? "h-16" : "h-20")}>
          <button className="-ml-2 grid h-11 w-11 place-items-center rounded-full hover:bg-mint/40 xl:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            <Menu className="h-6 w-6 text-forest" />
          </button>

          <Logo brand={site.brandName} logoUrl={site.logoUrl} className="xl:mr-6" />

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="Main">
            {links.map((l) => (
              <Link key={l.id} href={l.url} target={l.openInNewTab ? "_blank" : undefined}
                className={cn("group relative rounded-full px-3 py-2 font-display text-[12px] font-bold tracking-[0.08em] text-forest transition hover:text-forest-600",
                  isActive(l.url) && "text-forest")}>
                {l.label}
                <span className={cn("absolute inset-x-3 -bottom-0.5 h-[2px] origin-left rounded-full bg-coral transition-transform duration-300",
                  isActive(l.url) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 xl:ml-0">
            <button onClick={() => setSearchOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-full text-forest hover:bg-mint/40" aria-label="Search">
              <Search className="h-[21px] w-[21px]" />
            </button>
            <Link href="/wishlist" className="relative hidden h-11 w-11 place-items-center rounded-full text-forest hover:bg-mint/40 sm:grid" aria-label="Wishlist">
              <Heart className="h-[21px] w-[21px]" />
              {mounted && wishCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-coral" />}
            </Link>
            <Link href="/account" className="hidden h-11 w-11 place-items-center rounded-full text-forest hover:bg-mint/40 sm:grid" aria-label="Account">
              <User className="h-[21px] w-[21px]" />
            </Link>
            <button onClick={() => openDrawer(true)}
              className="ml-1 flex h-11 items-center gap-2 rounded-full bg-forest pl-4 pr-1.5 text-cream transition hover:bg-forest-600"
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
            <div className="flex h-20 items-center justify-between px-6">
              <Logo brand={site.brandName} logoUrl={site.logoUrl} light />
              <button onClick={() => setMenuOpen(false)} className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 hover:bg-cream/20" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-6 pt-4" aria-label="Mobile">
              <ul className="space-y-1">
                {nav.map((l, i) => (
                  <li key={l.id} className="animate-rise" style={{ animationDelay: `${80 + i * 45}ms` }}>
                    <Link href={l.url} className={cn("flex items-baseline justify-between border-b border-cream/10 py-4 font-display text-[26px] font-extrabold tracking-tight transition hover:text-mint",
                      isActive(l.url) ? "text-mint" : "text-cream")}>
                      {l.label}
                      {l.url === "/cart" && <span className="text-base font-bold text-coral">{mounted ? count : 0}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                <Link href="/wishlist" className="whitespace-nowrap rounded-full bg-cream/10 px-4 py-2.5 font-semibold">Wishlist</Link>
                <Link href="/account" className="whitespace-nowrap rounded-full bg-cream/10 px-4 py-2.5 font-semibold">My account</Link>
                <Link href="/track" className="whitespace-nowrap rounded-full bg-cream/10 px-4 py-2.5 font-semibold">Track order</Link>
              </div>
            </nav>
            <div className="space-y-4 px-6 pb-8 pt-10 text-sm text-cream/70">
              <p>{site.email}<br />{site.phone}</p>
              <SocialIcons social={social} className="text-cream" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
