import Link from "next/link";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, customers, orders } from "@/db";
import { formatDate, formatINR } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminShell";

export const metadata = { title: "Customers" };
export default async function CustomersPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q;
  const rows = await db.select({
    id: customers.id, name: customers.name, email: customers.email, phone: customers.phone, createdAt: customers.createdAt,
    hasAccount: sql<boolean>`${customers.passwordHash} is not null`,
    orders: sql<number>`count(${orders.id})::int`,
    spent: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.orderStatus} <> 'cancelled' and (${orders.paymentStatus} = 'paid' or ${orders.paymentMethod} = 'cod')), 0)::int`,
    last: sql<Date | null>`max(${orders.createdAt})`,
  }).from(customers).leftJoin(orders, eq(orders.customerId, customers.id))
    .where(q ? or(ilike(customers.email, `%${q}%`), ilike(customers.name, `%${q}%`), ilike(customers.phone, `%${q}%`)) : undefined)
    .groupBy(customers.id).orderBy(desc(customers.createdAt)).limit(300);
  return (
    <>
      <AdminHeader title="Customers" description="Everyone who has created an account or checked out as a guest." />
      <form className="mb-4 flex gap-2"><input name="q" defaultValue={q} placeholder="Search name, email, phone" className="a-input max-w-xs" /><button className="a-btn-ghost">Search</button></form>
      <div className="a-card overflow-x-auto p-0 md:p-0">
        <table className="a-table min-w-[720px]">
          <thead><tr><th className="pl-5">Customer</th><th>Phone</th><th>Type</th><th>Orders</th><th>Spent</th><th>Last order</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-cream/60">
                <td className="pl-5"><Link href={`/admin/customers/${c.id}`} className="font-semibold hover:underline">{c.name || "—"}</Link><span className="block text-xs text-sage">{c.email}</span></td>
                <td className="text-sage">{c.phone ?? "—"}</td>
                <td><span className={`badge ${c.hasAccount ? "bg-mint-200 text-forest" : "bg-cream-300"}`}>{c.hasAccount ? "Account" : "Guest"}</span></td>
                <td>{c.orders}</td>
                <td className="font-semibold">{formatINR(c.spent)}</td>
                <td className="text-sage">{c.last ? formatDate(c.last) : "—"}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="py-12 text-center text-sage">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
