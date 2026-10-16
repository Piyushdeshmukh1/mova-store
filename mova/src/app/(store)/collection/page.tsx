import { CatalogView } from "@/components/store/CatalogView";
import { PageHero } from "@/components/store/PageHero";
import { getNav } from "@/lib/cms";
import { buildMetadata, JsonLd, breadcrumbSchema } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({ title: "All Products", description: "Shop premium handkerchiefs, quick-dry gym towels and combo packs.", path: "/collection" });
}

export default async function CollectionPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const nav = await getNav().catch(() => []);
  const label = nav.find((n) => n.url === "/collection")?.label ?? "The Collection";
  return (
    <>
      <PageHero title={label} crumbs={[{ name: "Home", path: "/" }, { name: label, path: "/collection" }]} />
      <CatalogView sp={searchParams} basePath="/collection" />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: label, path: "/collection" }])} />
    </>
  );
}
