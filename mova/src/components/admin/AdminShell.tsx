"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgePercent, Boxes, ExternalLink, FileText, FolderTree, HelpCircle, Home, Inbox, LayoutDashboard, LogOut, Megaphone, Menu,
  MessageSquareQuote, Navigation, PanelBottom, Receipt, Search, Settings, Share2, Star, Truck, UserCog, Users, X, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminLogout } from "@/app/admin/actions";

const GROUPS = [
  { title: "", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  { title: "Store", items: [
    { href: "/admin/orders", label: "Orders", icon: Receipt },
    { href: "/admin/products", label: "Products", icon: Boxes },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/coupons", label: "Offers & coupons", icon: BadgePercent },
    { href: "/admin/reviews", label: "Product reviews", icon: Star },
    { href: "/admin/customers", label: "Customers", icon: Users },
  ] },
  { title: "Content", items: [
    { href: "/admin/homepage", label: "Homepage", icon: Home },
    { href: "/admin/navigation", label: "Navigation", icon: Navigation },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { href: "/admin/pages", label: "Pages & policies", icon: FileText },
    { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
    { href: "/admin/settings/footer", label: "Footer", icon: PanelBottom },
    { href: "/admin/settings/announcement", label: "Announcement bar", icon: Megaphone },
  ] },
  { title: "Settings", items: [
    { href: "/admin/settings/site", label: "Brand & contact", icon: Settings },
    { href: "/admin/settings/social", label: "Social media", icon: Share2 },
    { href: "/admin/settings/seo", label: "SEO", icon: Search },
    { href: "/admin/settings/commerce", label: "Shipping & payments", icon: Truck },
    { href: "/admin/settings/productPage", label: "Product page info", icon: Package },
    { href: "/admin/settings/account", label: "My account", icon: UserCog },
  ] },
  { title: "", items: [{ href: "/admin/inbox", label: "Inbox & subscribers", icon: Inbox }] },
];

export function AdminShell({ brand, email, unread, children }: { brand: string; email: string; unread: number; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="font-display text-xl font-extrabold tracking-tight text-cream">{brand}<span className="ml-2 rounded-md bg-coral px-1.5 py-0.5 align-middle text-[10px] text-charcoal">ADMIN</span></Link>
        <button onClick={() => setOpen(false)} className="text-cream lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {GROUPS.map((g, gi) => (
          <div key={gi}>
            {g.title && <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cream/40">{g.title}</p>}
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={it.href}>
                  <Link href={it.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active(it.href) ? "bg-mint text-forest" : "text-cream/75 hover:bg-white/10 hover:text-cream")}>
                    <it.icon className="h-4 w-4 shrink-0" />{it.label}
                    {it.href === "/admin/inbox" && unread > 0 && <span className="ml-auto rounded-full bg-coral px-1.5 text-[11px] font-bold text-charcoal">{unread}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-cream/75 hover:bg-white/10"><ExternalLink className="h-4 w-4" /> View store</a>
        <form action={adminLogout}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-cream/75 hover:bg-white/10"><LogOut className="h-4 w-4" /> Sign out</button>
        </form>
        <p className="truncate px-3 pt-2 text-[11px] text-cream/40">{email}</p>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream-200/60 text-charcoal">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-forest lg:block">{nav}</aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cream-300 bg-forest px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} className="text-cream" aria-label="Open menu"><Menu className="h-6 w-6" /></button>
        <span className="font-display font-extrabold text-cream">{brand} Admin</span>
        <a href="/" target="_blank" className="text-cream" aria-label="View store"><ExternalLink className="h-5 w-5" /></a>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 animate-fade bg-charcoal/50" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slideinleft bg-forest">{nav}</aside>
        </div>
      )}
      <main className="lg:pl-64"><div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</div></main>
    </div>
  );
}

export function AdminHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-forest md:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-sage">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
