import Link from "next/link";
import type { SettingsMap } from "@/lib/defaults";
import { fillTokens } from "@/lib/cms";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";

const SOCIAL_LABELS: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", pinterest: "Pinterest", youtube: "YouTube", twitter: "X / Twitter" };

export function Footer({ s }: { s: SettingsMap }) {
  const { footer, site, social } = s;
  const socialLinks = Object.entries(social).filter(([, v]) => v);
  return (
    <footer className="relative overflow-hidden bg-forest text-cream">
      <div className="container pb-10 pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo brand={site.brandName} logoUrl={site.logoUrl} light />
            <p className="mt-5 text-[15px] leading-relaxed text-cream/70">{footer.description}</p>
            <div className="mt-6 space-y-1 text-sm text-cream/70">
              {site.email && <p><a className="hover:text-mint" href={`mailto:${site.email}`}>{site.email}</a></p>}
              {site.phone && <p><a className="hover:text-mint" href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a></p>}
              {site.businessHours && <p>{site.businessHours}</p>}
            </div>
            <SocialIcons social={social} className="mt-6 text-cream" />
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.1em] text-mint">{col.title}</h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label + l.url}>
                      <Link href={l.url} className="text-[15px] text-cream/75 transition hover:text-cream hover:underline hover:decoration-coral hover:underline-offset-4">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {socialLinks.length > 0 && (
              <div>
                <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.1em] text-mint">Follow</h3>
                <ul className="mt-5 space-y-3">
                  {socialLinks.map(([k, url]) => (
                    <li key={k}><a href={url} target="_blank" rel="noopener noreferrer" className="text-[15px] text-cream/75 transition hover:text-cream">{SOCIAL_LABELS[k] ?? k}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div aria-hidden className="pointer-events-none mt-16 select-none font-display text-[22vw] font-extrabold leading-[0.8] tracking-[-0.07em] text-cream/[0.06]">
          {site.brandName}
        </div>

        <div className="mt-6 flex flex-col gap-5 border-t border-cream/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-cream/60">{fillTokens(footer.copyright, site.brandName)} {footer.bottomNote}</p>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
            {footer.paymentIcons.map((p) => (
              <li key={p.name} className="rounded-md bg-cream px-2.5 py-1 text-[11px] font-bold tracking-wide text-forest">{p.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
