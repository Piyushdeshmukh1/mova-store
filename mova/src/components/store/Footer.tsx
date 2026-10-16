import Link from "next/link";
import { Landmark, Banknote } from "lucide-react";
import type { SettingsMap } from "@/lib/defaults";
import { fillTokens } from "@/lib/cms";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";

const SOCIAL_LABELS: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", pinterest: "Pinterest", youtube: "YouTube", twitter: "X / Twitter" };

function PaymentIcon({ name }: { name: string }) {
  const badge = "flex h-7 w-11 items-center justify-center rounded-md shrink-0";
  switch (name) {
    case "Visa":
      return <span className={cn(badge, "bg-[#1A1F71]")}><span className="font-display text-[11px] font-extrabold italic tracking-tight text-white">VISA</span></span>;
    case "Mastercard":
      return (
        <span className={cn(badge, "relative bg-white")}>
          <span className="absolute left-[10px] h-4 w-4 rounded-full bg-[#EB001B]" />
          <span className="absolute right-[10px] h-4 w-4 rounded-full bg-[#F79E1B] mix-blend-multiply" />
        </span>
      );
    case "RuPay":
      return <span className={cn(badge, "bg-white")}><span className="bg-gradient-to-r from-[#0C6A35] via-[#ED6E27] to-[#0C6A35] bg-clip-text font-display text-[10px] font-extrabold italic text-transparent">RuPay</span></span>;
    case "UPI":
      return <span className={cn(badge, "bg-white")}><span className="font-display text-[11px] font-extrabold tracking-tight text-[#097939]">UPI</span></span>;
    case "NetBanking":
      return <span className={cn(badge, "gap-1 bg-cream text-forest")}><Landmark className="h-4 w-4" /></span>;
    case "COD":
      return <span className={cn(badge, "gap-1 bg-cream text-forest")}><Banknote className="h-4 w-4" /></span>;
    default:
      return <span className={cn(badge, "bg-cream px-1 text-[10px] font-bold text-forest")}>{name}</span>;
  }
}

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

        {site.logoUrl ? (
          <div aria-hidden className="pointer-events-none mt-16 flex justify-center opacity-[0.07] md:justify-start">
            <img src={site.logoUrl} alt="" className="h-[26vw] max-h-72 w-auto object-contain brightness-0 invert" />
          </div>
        ) : (
          <div aria-hidden className="pointer-events-none mt-16 select-none font-display text-[22vw] font-extrabold leading-[0.8] tracking-[-0.07em] text-cream/[0.06]">
            {site.brandName}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-5 border-t border-cream/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-cream/60">{fillTokens(footer.copyright, site.brandName)} {footer.bottomNote}</p>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
            {footer.paymentIcons.map((p) => (
              <li key={p.name}><PaymentIcon name={p.name} /></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
