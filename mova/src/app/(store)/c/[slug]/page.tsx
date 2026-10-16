import { notFound } from "next/navigation";
import { CatalogView } from "@/components/store/CatalogView";
import { PageHero } from "@/components/store/PageHero";
import { getCategory } from "@/lib/catalog";
import { buildMetadata, JsonLd, breadcrumbSchema } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await getCategory(params.slug);
  if (!c) return {};
  return buildMetadata({ title: c.seoTitle || c.name, description: c.seoDescription || c.description, image: c.ogImage || c.imageUrl, path: `/c/${c.slug}` });
}

export default async function CategoryPage({ params, searchParams }: { params: { slug: string }; searchParams: Record<string, string | undefined> }) {
  const c = await getCategory(params.slug);
  if (!c) notFound();
  const crumbs = [{ name: "Home", path: "/" }, { name: "Collection", path: "/collection" }, { name: c.name, path: `/c/${c.slug}` }];
  return (
    <>
      <PageHero title={c.name} subtitle={c.description} image={c.imageUrl} crumbs={crumbs} />
      <CatalogView categorySlug={c.slug} sp={searchParams} basePath={`/c/${c.slug}`} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
    </>
  );
}
