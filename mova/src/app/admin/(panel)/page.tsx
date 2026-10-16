import Link from "next/link";
import { and, count, desc, eq, gte, lte, ne, or, sql } from "drizzle-orm";
import { AlertTriangle, Boxes, IndianRupee, Package, Receipt, ShoppingBag, Users } from "lucide-react";
import { db, orders, orderItems, products, productVariants, customers, reviews } from "@/db";
import { getSettings } from "@/lib/cms";
import { formatDate, formatINR } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Dashboard" };

/** An order "counts" once it's paid, or it's a COD order that hasn't been cancelled. */
const valid = and(ne(orders.orderStatus, "cancelled"), or(eq(orders.paymentStatus, "paid"), eq(orders.paymentMethod, "cod")));

export default async function Dashboard() {
  const { commerce } = await getSettings();
  const t = commerce.lowStockThreshold;
  const since = new Date(Date.now() - 13 * 86400000);
  since.setHours(0, 0, 0, 0);

  const [[rev], [units], [prodCount], [custCount], [pendingReviews], recent, lowP, lowV, daily, [toShip]] = await Promise.all([
    db.select({ total: sql<number>`coalesce(sum(${orders.total}),0)::int`, n: count() }).from(orders).where(valid),
    db.select({ n: sql<number>`coalesce(sum(${orderItems.quantity}),0)::int` }).from(orderItems).innerJoin(orders, eq(orders.id, orderItems.orderId)).where(valid),
    db.select({ n: count(), active: sql<number>`count(*) filter (where ${products.isActive})::int` }).from(products),
    db.select({ n: count() }).from(customers),
    db.select({ n: count() }).from(reviews).where(eq(reviews.isApproved, false)),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
    db.select({ id: products.id, name: products.name, stock: products.stock, sku: products.sku }).from(products)
      .where(and(lte(products.stock, t), sql`not exists (select 1 from ${productVariants} v where v.product_id = ${products.id})`)).orderBy(products.stock).limit(10),
    db.select({ id: products.id, name: products.name, stock: productVariants.stock, sku: productVariants.sku, color: productVariants.color, size: productVariants.size })
      .from(productVariants).innerJoin(products, eq(products.id, productVariants.productId)).where(lte(productVariants.stock, t)).orderBy(productVariants.stock).limit(10),
    db.select({ day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`, total: sql<number>`sum(${orders.total})::int`, n: count() })
      .from(orders).where(and(valid, gte(orders.createdAt, since))).groupBy(sql`1`),
    db.select({ n: count() }).from(orders).where(and(valid, eq(orders.shippingStatus, "unfulfilled"))),
  ]);

  const low = [...lowP.map((p) => ({ ...p, label: null as string | null })), ...lowV.map((v) => ({ id: v.id, name: v.name, stock: v.stock, sku: v.sku, label: [v.color, v.size].filter(Boolean).join(" / ") }))]
    .sort((a, b) => a.stock - b.stock).slice(0, 10);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const hit = daily.find((x) => x.day === key);
    return { key, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), total: hit?.total ?? 0, n: hit?.n ?? 0 };
  });
  const max = Math.max(1, ...days.map((d) => d.total));
  const last14 = days.reduce((s, d) => s + d.total, 0);

  const stats = [
    { label: "Revenue", value: formatINR(rev.total), sub: `Avg order ${formatINR(rev.n ? Math.round(rev.total / rev.n) : 0)}`, icon: IndianRupee, tone: "bg-forest text-cream" },
    { label: "Orders", value: rev.n.toLocaleString("en-IN"), sub: `${toShip.n} waiting to ship`, icon: Receipt, tone: "bg-mint text-forest" },
    { label: "Total sales", value: `${units.n.toLocaleString("en-IN")} units`, sub: "Items sold", icon: ShoppingBag, tone: "bg-coral text-charcoal" },
    { label: "Products", value: prodCount.n.toLocaleString("en-IN"), sub: `${prodCount.active} live`, icon: Boxes, tone: "bg-white text-forest" },
    { label: "Customers", value: custCount.n.toLocaleString("en-IN"), sub: "Accounts & guests", icon: Users, tone: "bg-white text-forest" },
    { label: "Low stock", value: String(low.length), sub: `At or below ${t} units`, icon: AlertTriangle, tone: low.length ? "bg-coral-100 text-coral-600" : "bg-white text-forest" },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" description="A quick look at how the store is doing." actions={<Link href="/admin/products/new" className="a-btn">Add product</Link>} />

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.tone} ${s.tone.includes("bg-white") ? "border border-cream-300" : ""}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</p>
              <s.icon className="h-4 w-4 opacity-70" />
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold tracking-tight md:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs opacity-70">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="a-card">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display font-bold">Last 14 days</h2>
            <span className="text-sm font-semibold text-forest">{formatINR(last14)}</span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-1.5" role="img" aria-label="Daily revenue chart">
            {days.map((d) => (
              <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
                <div className="rounded-t-md bg-mint transition-colors group-hover:bg-forest" style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }} />
                <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-charcoal px-2 py-1 text-[11px] text-white group-hover:block">{d.label}: {formatINR(d.total)} · {d.n} orders</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-sage"><span>{days[0].label}</span><span>{days[13].label}</span></div>
        </section>

        <section className="a-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">Low stock</h2>
            <Link href="/admin/products?stock=low" className="text-xs font-semibold text-forest hover:underline">View all</Link>
          </div>
          {low.length ? (
            <ul className="mt-4 divide-y divide-cream-200">
              {low.map((l) => (
                <li key={`${l.sku}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/products/${l.id}`} className="min-w-0 hover:underline">
                    <span className="block truncate font-medium">{l.name}</span>
                    <span className="block truncate text-xs text-sage">{l.label || l.sku}</span>
                  </Link>
                  <span className={`badge ${l.stock === 0 ? "bg-coral text-charcoal" : "bg-coral-100 text-coral-600"}`}>{l.stock === 0 ? "Sold out" : `${l.stock} left`}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-6 flex items-center gap-2 text-sm text-sage"><Package className="h-4 w-4" /> Everything is well stocked.</p>}
        </section>
      </div>

      {pendingReviews.n > 0 && (
        <Link href="/admin/reviews" className="mt-6 flex items-center justify-between rounded-2xl bg-mint-200 px-5 py-4 text-sm font-semibold text-forest hover:bg-mint">
          {pendingReviews.n} product review{pendingReviews.n > 1 ? "s" : ""} waiting for approval <span>Review now</span>
        </Link>
      )}

      <section className="a-card mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs font-semibold text-forest hover:underline">All orders</Link>
        </div>
        <div className="-mx-3 mt-3 overflow-x-auto">
          <table className="a-table min-w-[640px]">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Status</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="hover:bg-cream/60">
                  <td><Link href={`/admin/orders/${o.id}`} className="font-semibold text-forest hover:underline">{o.orderNumber}</Link></td>
                  <td>{o.name}</td>
                  <td className="text-sage">{formatDate(o.createdAt)}</td>
                  <td><StatusBadge kind="payment" value={o.paymentStatus} /> <span className="text-[11px] uppercase text-sage">{o.paymentMethod}</span></td>
                  <td><StatusBadge kind="order" value={o.orderStatus} /></td>
                  <td className="text-right font-semibold">{formatINR(o.total)}</td>
                </tr>
              ))}
              {!recent.length && <tr><td colSpan={6} className="py-10 text-center text-sage">No orders yet — they&apos;ll show up here.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
