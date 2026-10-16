import type { Metadata } from "next";
import { getSettings } from "./cms";
import { siteUrl } from "./utils";

export async function buildMetadata(o: { title?: string | null; description?: string | null; image?: string | null; path?: string; absoluteTitle?: boolean }): Promise<Metadata> {
  const { seo, site } = await getSettings();
  const title = o.title ? (o.absoluteTitle ? o.title : seo.titleTemplate.replace("%s", o.title)) : seo.defaultTitle;
  const description = o.description || seo.description;
  const image = o.image || seo.ogImage;
  const url = siteUrl(o.path || "/");
  return {
    title: { absolute: title },
    description,
    keywords: seo.keywords,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: site.brandName, images: image ? [{ url: image }] : [], locale: "en_IN", type: "website" },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: siteUrl(it.path) })),
  };
}
