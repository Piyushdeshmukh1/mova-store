import { desc, eq } from "drizzle-orm";
import { db, reviews, products } from "@/db";
import { formatDate } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { Stars } from "@/components/store/Stars";

export const metadata = { title: "Product reviews" };
export default async function Page({ searchParams }: { searchParams: { show?: string } }) {
  const pendingOnly = searchParams.show !== "all";
  const rows = await db.select({ r: reviews, product: products.name, slug: products.slug }).from(reviews)
    .innerJoin(products, eq(products.id, reviews.productId))
    .where(pendingOnly ? eq(reviews.isApproved, false) : undefined).orderBy(desc(reviews.createdAt)).limit(200);
  return (
    <>
      <AdminHeader title="Product reviews" description="Reviews submitted on product pages appear here. Approve them to show them on the site and in star ratings."
        actions={<a href={pendingOnly ? "?show=all" : "?"} className="a-btn-ghost">{pendingOnly ? "Show all reviews" : "Show pending only"}</a>} />
      <ul className="space-y-3">
        {rows.map(({ r, product, slug }) => (
          <li key={r.id} className="a-card flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Stars value={r.rating} />
                <span className="font-semibold">{r.title || "Untitled"}</span>
                {!r.isApproved && <span className="badge bg-coral-100 text-coral-600">Pending</span>}
              </div>
              <p className="mt-2 text-sm text-charcoal/80">{r.body}</p>
              <p className="mt-2 text-xs text-sage">{r.name} · {formatDate(r.createdAt)} · on <a href={`/p/${slug}`} target="_blank" className="underline" rel="noreferrer">{product}</a></p>
            </div>
            <ReviewActions id={r.id} approved={r.isApproved} />
          </li>
        ))}
        {!rows.length && <li className="a-card text-center text-sm text-sage">{pendingOnly ? "No reviews waiting. Nice." : "No reviews yet."}</li>}
      </ul>
    </>
  );
}
