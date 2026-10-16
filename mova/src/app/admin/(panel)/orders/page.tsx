import Link from "next/link";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db, orders } from "@/db";
import { formatDate, formatINR } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Orders" };
const PER = 30;

export default async function OrdersPage({ searchParams }: { searchParams: { q?: string; status?: string; payment?: string; ship?: string; page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const w: SQL[] = [];
  if (searchParams.q) w.push(or(ilike(orders.orderNumber, `%${searchParams.q}%`), ilike(orders.email, `%${searchParams.q}%`), ilike(orders.name, `%${searchParams.q}%`), ilike(orders.phone, `%${searchParams.q}%`))!);
  if (searchParams.status) w.push(eq(orders.orderStatus, searchParams.status));
  if (searchParams.payment) w.push(eq(orders.paymentStatus, searchParams.payment));
  if (searchParams.ship) w.push(eq(orders.shippingStatus, searchParams.ship));
  const where = w.length ? and(...w) : undefined;
  const [rows, [{ n }]] = await Promise.all([
    db.query.orders.findMany({ where, orderBy: desc(orders.createdAt), limit: PER, offset: (page - 1) * PER, with: { items: true } }),
    db.select({ n: count() }).from(orders).where(where),
  ]);
  const qs = (p: number) => `?${new URLSearchParams({ ...(searchParams as Record<string, string>), page: String(p) })}`;

  return (
    <>
      <AdminHeader title="Orders" description={`${n} orders`} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={searchParams.q} placeholder="Order #, name, email or phone" className="a-input max-w-xs" />
        <select name="status" defaultValue={searchParams.status} className="a-input w-auto"><option value="">Order status</option>{["pending", "confirmed", "processing", "completed", "cancelled"].map((s) => <option key={s}>{s}</option>)}</select>
        <select name="payment" defaultValue={searchParams.payment} className="a-input w-auto"><option value="">Payment</option>{["pending", "paid", "failed", "refunded"].map((s) => <option key={s}>{s}</option>)}</select>
        <select name="ship" defaultValue={searchParams.ship} className="a-input w-auto"><option value="">Shipping</option>{["unfulfilled", "packed", "shipped", "in_transit", "delivered", "returned"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select>
        <button className="a-btn-ghost">Filter</button>
      </form>
      <div className="a-card overflow-x-auto p-0 md:p-0">
        <table className="a-table min-w-[900px]">
          <thead><tr><th className="pl-5">Order</th><th>Customer</th><th>Products</th><th>Amount</th><th>Payment</th><th>Order</th><th>Shipping</th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-cream/60">
                <td className="pl-5"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-forest hover:underline">{o.orderNumber}</Link><span className="block text-xs text-sage">{formatDate(o.createdAt)}</span></td>
                <td><span className="block font-medium">{o.name}</span><span className="block text-xs text-sage">{o.email}</span></td>
                <td className="max-w-[220px] text-xs text-charcoal/80">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</td>
                <td className="font-semibold">{formatINR(o.total)}<span className="block text-[11px] font-normal uppercase text-sage">{o.paymentMethod}</span></td>
                <td><StatusBadge value={o.paymentStatus} /></td>
                <td><StatusBadge value={o.orderStatus} /></td>
                <td><StatusBadge value={o.shippingStatus} /></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="py-12 text-center text-sage">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
      {n > PER && (
        <div className="mt-4 flex justify-center gap-2">
          {page > 1 && <Link href={qs(page - 1)} className="a-btn-ghost">Previous</Link>}
          <span className="px-3 py-2 text-sm text-sage">Page {page} of {Math.ceil(n / PER)}</span>
          {page * PER < n && <Link href={qs(page + 1)} className="a-btn-ghost">Next</Link>}
        </div>
      )}
    </>
  );
}
