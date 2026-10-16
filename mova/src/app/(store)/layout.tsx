import { getNav, getSettings } from "@/lib/cms";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { JsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [s, nav] = await Promise.all([getSettings(), getNav().catch(() => [])]);
  const bagLabel = nav.find((n) => n.url === "/cart")?.label ?? "Bag";
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.site.brandName,
    url: siteUrl(),
    logo: s.site.logoUrl || siteUrl("/favicon.svg"),
    email: s.site.email,
    telephone: s.site.phone,
    address: { "@type": "PostalAddress", streetAddress: s.site.address.replace(/\n/g, ", "), addressCountry: "IN" },
    sameAs: Object.values(s.social).filter(Boolean),
  };
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-cream">Skip to content</a>
      <AnnouncementBar a={s.announcement} />
      <Header nav={nav} site={s.site} social={s.social} />
      <main id="main">{children}</main>
      <Footer s={s} />
      <CartDrawer freeShippingThreshold={s.commerce.freeShippingThreshold} bagLabel={bagLabel} />
      <JsonLd data={org} />
    </>
  );
}
