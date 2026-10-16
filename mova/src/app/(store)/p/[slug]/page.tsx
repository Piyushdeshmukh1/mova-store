import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, listProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/cms";
import { buildMetadata, JsonLd, breadcrumbSchema } from "@/lib/seo";
import { formatDate, siteUrl, variantPricing } from "@/lib/utils";
import { ProductDetail } from "@/components/store/ProductDetail";
import { ProductCard } from "@/components/store/ProductCard";
import { ReviewForm } from "@/components/store/ReviewForm";
import { Stars } from "@/components/store/Stars";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getProductBySlug(params.slug);
  if (!p) return {};
  return buildMetadata({ title: p.seoTitle || p.name, description: p.seoDescription || p.shortDescription, image: p.ogImage || p.images[0], path: `/p/${p.slug}` });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProductBySlug(params.slug);
  if (!p) notFound();
  const [s, related] = await Promise.all([
    getSettings(),
    listProducts({ categorySlug: p.category?.slug, excludeId: p.id, limit: 4 }),
  ]);

  const crumbs = [{ name: "Home", path: "/" }, ...(p.category ? [{ name: p.category.name, path: `/c/${p.category.slug}` }] : []), { name: p.name, path: `/p/${p.slug}` }];
  const totalStock = p.variants.length ? p.variants.reduce((n, v) => n + v.stock, 0) : p.stock;
  const prices = p.variants.length ? p.variants.map((v) => variantPricing(p, v).selling) : [variantPricing(p).selling];
  const abs = (u: string) => (u.startsWith("http") ? u : siteUrl(u));

  const productSchema = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.sku, description: p.shortDescription || p.description.slice(0, 300),
    image: p.images.map(abs), brand: { "@type": "Brand", name: s.site.brandName }, category: p.category?.name,
    offers: {
      "@type": "AggregateOffer", priceCurrency: "INR", lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: Math.max(1, p.variants.length),
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: siteUrl(`/p/${p.slug}`),
    },
    ...(p.reviewCount ? {
      aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating.toFixed(1), reviewCount: p.reviewCount },
      review: p.reviews.slice(0, 5).map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.name }, reviewRating: { "@type": "Rating", ratingValue: r.rating }, reviewBody: r.body })),
    } : {}),
  };

  return (
    <>
      <div className="container pb-20 pt-6 md:pt-10">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-sage">
          <ol className="flex flex-wrap gap-2">
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                {i < crumbs.length - 1 ? <Link className="hover:text-forest" href={c.path}>{c.name}</Link> : <span aria-current="page" className="text-forest">{c.name}</span>}
                {i < crumbs.length - 1 && <span aria-hidden>/</span>}
              </li>
            ))}
          </ol>
        </nav>
        <ProductDetail
          p={{ ...p, categoryName: p.category?.name ?? null, variants: p.variants }}
          shippingInfo={s.productPage.shippingInfo} returnInfo={s.productPage.returnInfo}
          trustBadges={s.productPage.trustBadges} deliveryText={s.commerce.estimatedDelivery}
        />
      </div>

      <section id="reviews" className="scroll-mt-24 bg-white/60 py-20">
        <div className="container grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-display-md uppercase">Reviews</h2>
            {p.reviewCount > 0 ? (
              <div className="mt-6">
                <p className="font-display text-6xl font-extrabold text-forest">{p.rating.toFixed(1)}</p>
                <Stars value={p.rating} size={20} className="mt-2" />
                <p className="mt-2 text-sage">Based on {p.reviewCount} reviews</p>
                <div className="mt-6 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const c = p.reviews.filter((r) => r.rating === n).length;
                    return (
                      <div key={n} className="flex items-center gap-3 text-sm">
                        <span className="w-3 text-sage">{n}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-300"><span className="block h-full rounded-full bg-coral" style={{ width: `${(c / p.reviewCount) * 100}%` }} /></span>
                        <span className="w-6 text-right text-sage">{c}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : <p className="mt-4 text-sage">No reviews yet. Be the first to share yours.</p>}
            <div className="mt-8"><ReviewForm productId={p.id} /></div>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {p.reviews.map((r) => (
              <li key={r.id} className="rounded-[1.75rem] bg-white p-6">
                <div className="flex items-center justify-between"><Stars value={r.rating} /><span className="text-xs text-sage">{formatDate(r.createdAt)}</span></div>
                {r.title && <p className="mt-3 font-display font-bold text-forest">{r.title}</p>}
                <p className="mt-2 text-[15px] leading-relaxed text-charcoal/80">{r.body}</p>
                <p className="mt-4 text-sm font-semibold text-charcoal">{r.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="mb-12 text-display-md uppercase">You might also like</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {related.map((r) => <ProductCard key={r.id} p={r} />)}
            </div>
          </div>
        </section>
      )}
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
    </>
  );
}
