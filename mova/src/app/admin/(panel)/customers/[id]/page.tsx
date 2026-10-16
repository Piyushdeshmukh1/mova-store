import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db, customers, orders } from "@/db";
import { formatDate, formatINR } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Customer" };
export default async function CustomerDetail({ params }: { params: { id: string } }) {
  const [c] = await db.select().from(customers).where(eq(customers.id, Number(params.id) || 0)).limit(1);
  if (!c) notFound();
  const list = await db.query.orders.findMany({ where: eq(orders.customerId, c.id), orderBy: desc(orders.createdAt), with: { items: true } });
  const spent = list.filter((o) => o.orderStatus !== "cancelled" && (o.paymentStatus === "paid" || o.paymentMethod === "cod")).reduce((s, o) => s + o.total, 0);
  return (
    <>
      <Link href="/admin/customers" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-sage hover:text-forest"><ArrowLeft className="h-4 w-4" /> Customers</Link>
      <AdminHeader title={c.name || c.email} description={`${c.email}${c.phone ? ` · ${c.phone}` : ""} · since ${formatDate(c.createdAt)} · ${c.passwordHash ? "has an account" : "guest checkout"}`} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="a-card"><p className="a-label">Orders</p><p className="font-display text-2xl font-extrabold">{list.length}</p></div>
        <div className="a-card"><p className="a-label">Total spent</p><p className="font-display text-2xl font-extrabold">{formatINR(spent)}</p></div>
        <div className="a-card"><p className="a-label">Avg order</p><p className="font-display text-2xl font-extrabold">{formatINR(list.length ? Math.round(spent / list.length) : 0)}</p></div>
      </div>
      <h2 className="mb-3 font-display text-lg font-bold">Order history</h2>
      <div className="a-card overflow-x-auto p-0 md:p-0">
        <table className="a-table min-w-[720px]">
          <thead><tr><th className="pl-5">Order</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Shipping</th></tr></thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id}>
                <td className="pl-5"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-forest hover:underline">{o.orderNumber}</Link></td>
                <td className="text-sage">{formatDate(o.createdAt)}</td>
                <td className="text-xs">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</td>
                <td className="font-semibold">{formatINR(o.total)}</td>
                <td><StatusBadge value={o.paymentStatus} /></td>
                <td><StatusBadge value={o.shippingStatus} /></td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={6} className="py-10 text-center text-sage">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
