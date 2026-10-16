import "server-only";
import { unstable_cache } from "next/cache";
import { asc, eq, inArray } from "drizzle-orm";
import { db, settings, navItems, homeSections, testimonials, faqs, pages } from "@/db";
import { DEFAULT_SETTINGS, type SettingsMap } from "./defaults";

export const CMS_TAG = "cms";

/** All settings merged over defaults (so a missing key never breaks the site). */
export const getSettings = unstable_cache(
  async (): Promise<SettingsMap> => {
    const merged = structuredClone(DEFAULT_SETTINGS) as SettingsMap;
    try {
      const rows = await db.select().from(settings);
      for (const r of rows) {
        if (r.key in merged) {
          (merged as Record<string, unknown>)[r.key] = { ...(merged as Record<string, object>)[r.key], ...(r.value as object) };
        }
      }
    } catch (e) {
      console.error("[cms] settings unavailable, using defaults:", (e as Error).message);
    }
    return merged;
  },
  ["settings"],
  { tags: [CMS_TAG], revalidate: 3600 },
);

export const getNav = unstable_cache(
  async () => db.select().from(navItems).where(eq(navItems.isVisible, true)).orderBy(asc(navItems.position)),
  ["nav"],
  { tags: [CMS_TAG], revalidate: 3600 },
);

export const getHomeSections = unstable_cache(
  async () => db.select().from(homeSections).where(eq(homeSections.isVisible, true)).orderBy(asc(homeSections.position)),
  ["home-sections"],
  { tags: [CMS_TAG], revalidate: 3600 },
);

export const getTestimonials = unstable_cache(
  async () => db.select().from(testimonials).where(eq(testimonials.isVisible, true)).orderBy(asc(testimonials.position)),
  ["testimonials"],
  { tags: [CMS_TAG], revalidate: 3600 },
);

export const getFaqs = unstable_cache(
  async () => db.select().from(faqs).where(eq(faqs.isVisible, true)).orderBy(asc(faqs.position)),
  ["faqs"],
  { tags: [CMS_TAG], revalidate: 3600 },
);

export async function getPage(slug: string) {
  const [p] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return p && p.isPublished ? p : null;
}

export async function getPagesBySlugs(slugs: string[]) {
  return db.select().from(pages).where(inArray(pages.slug, slugs));
}

export function fillTokens(s: string, brand: string) {
  return s.replace(/\{year\}/g, String(new Date().getFullYear())).replace(/\{brand\}/g, brand);
}
