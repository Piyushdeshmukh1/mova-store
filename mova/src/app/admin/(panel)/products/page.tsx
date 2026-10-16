import Link from "next/link";
import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db, products, categories, productVariants } from "@/db";
import { getSettings } from "@/lib/cms";
import { formatINR, pricing } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ProductRowActions } from "@/components/admin/ProductRowActions";

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: { q?: string; cat?: string; stock?: string; status?: string } }) {
  const { commerce } = await getSettings();
  const stockExpr = sql<number>`coalesce((select sum(v.stock) from ${productVariants} v where v.product_id = ${products.id}), ${products.stock})::int`;
  const where: SQL[] = [];
  if (searchParams.q) where.push(or(ilike(products.name, `%${searchParams.q}%`), ilike(products.sku, `%${searchParams.q}%`))!);
  if (searchParams.cat) where.push(eq(products.categoryId, Number(searchParams.cat)));
  if (searchParams.status === "live") where.push(eq(products.isActive, true));
  if (searchParams.status === "hidden") where.push(eq(products.isActive, false));
  if (searchParams.stock === "low") where.push(sql`${stockExpr} <= ${commerce.lowStockThreshold}`);

  const [rows, cats] = await Promise.all([
    db.select({
      id: products.id, name: products.name, slug: products.slug, sku: products.sku, price: products.price, salePrice: products.salePrice,
      images: products.images, isActive: products.isActive, isFeatured: products.isFeatured, isBestseller: products.isBestseller, isNewArrival: products.isNewArrival,
      category: categories.name, stock: stockExpr, variants: sql<number>`(select count(*) from ${productVariants} v where v.product_id = ${products.id})::int`,
    }).from(products).leftJoin(categories, eq(categories.id, products.categoryId)).where(where.length ? and(...where) : undefined).orderBy(desc(products.createdAt), asc(products.id)),
    db.select().from(categories).orderBy(asc(categories.position)),
  ]);

  return (
    <>
      <AdminHeader title="Products" description={`${rows.length} products. Click a product to edit images, prices, stock, variants and SEO.`}
        actions={<Link href="/admin/products/new" className="a-btn"><Plus className="h-4 w-4" /> Add product</Link>} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={searchParams.q} placeholder="Search name or SKU" className="a-input max-w-xs" />
        <select name="cat" defaultValue={searchParams.cat} className="a-input w-auto">
          <option value="">All categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="status" defaultValue={searchParams.status} className="a-input w-auto">
          <option value="">Any status</option><option value="live">Live</option><option value="hidden">Disabled</option>
        </select>
        <select name="stock" defaultValue={searchParams.stock} className="a-input w-auto">
          <option value="">Any stock</option><option value="low">Low stock</option>
        </select>
        <button className="a-btn-ghost">Filter</button>
      </form>
      <div className="a-card overflow-x-auto p-0 md:p-0">
        <table className="a-table min-w-[820px]">
          <thead><tr><th className="pl-5">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Tags</th><th>Live</th><th /></tr></thead>
          <tbody>
            {rows.map((p) => {
              const pr = pricing(p.price, p.salePrice);
              return (
                <tr key={p.id} className="hover:bg-cream/60">
                  <td className="pl-5">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                      </span>
                      <span>
                        <span className="block font-semibold text-charcoal hover:underline">{p.name}</span>
                        <span className="block text-xs text-sage">{p.sku}{p.variants ? ` · ${p.variants} variants` : ""}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="text-sage">{p.category ?? "—"}</td>
                  <td>
                    <span className="font-semibold">{formatINR(pr.selling)}</span>
                    {pr.off > 0 && <span className="block text-xs text-sage"><s>{formatINR(pr.mrp)}</s> · {pr.off}% off</span>}
                  </td>
                  <td><span className={`badge ${p.stock <= 0 ? "bg-coral text-charcoal" : p.stock <= commerce.lowStockThreshold ? "bg-coral-100 text-coral-600" : "bg-mint-200 text-forest"}`}>{p.stock <= 0 ? "Sold out" : p.stock}</span></td>
                  <td className="space-x-1 whitespace-nowrap text-[11px]">
                    {p.isFeatured && <span className="badge bg-cream-300">Featured</span>}
                    {p.isBestseller && <span className="badge bg-cream-300">Best</span>}
                    {p.isNewArrival && <span className="badge bg-cream-300">New</span>}
                  </td>
                  <td colSpan={2}><ProductRowActions id={p.id} isActive={p.isActive} slug={p.slug} /></td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={7} className="py-12 text-center text-sage">No products match.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
