import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db, products, categories, pages } from "@/db";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/collection"), changeFrequency: "daily", priority: 0.9 },
  ];
  try {
    const [ps, cs, pg] = await Promise.all([
      db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.isActive, true)),
      db.select({ slug: categories.slug }).from(categories).where(eq(categories.isActive, true)),
      db.select({ slug: pages.slug, updatedAt: pages.updatedAt }).from(pages).where(eq(pages.isPublished, true)),
    ]);
    return [
      ...base,
      ...cs.map((c) => ({ url: siteUrl(`/c/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
      ...ps.map((p) => ({ url: siteUrl(`/p/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...pg.map((p) => ({ url: siteUrl(`/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.4 })),
    ];
  } catch {
    return base;
  }
}
