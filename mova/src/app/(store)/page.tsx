import { getHomeSections, getSettings } from "@/lib/cms";
import { buildMetadata, JsonLd } from "@/lib/seo";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { siteUrl } from "@/lib/utils";

export async function generateMetadata() {
  const { seo } = await getSettings();
  return buildMetadata({ title: seo.defaultTitle, absoluteTitle: true, path: "/" });
}

export default async function HomePage() {
  const [sections, s] = await Promise.all([getHomeSections(), getSettings()]);
  const website = {
    "@context": "https://schema.org", "@type": "WebSite", name: s.site.brandName, url: siteUrl(),
    potentialAction: { "@type": "SearchAction", target: `${siteUrl("/collection")}?q={search_term_string}`, "query-input": "required name=search_term_string" },
  };
  return (
    <>
      <SectionRenderer sections={sections} />
      {sections.length === 0 && (
        <div className="container py-32 text-center">
          <h1 className="text-display-md">Your homepage is empty</h1>
          <p className="mt-4 text-sage">Add sections in Admin → Homepage, or run <code>npm run db:seed</code>.</p>
        </div>
      )}
      <JsonLd data={website} />
    </>
  );
}
