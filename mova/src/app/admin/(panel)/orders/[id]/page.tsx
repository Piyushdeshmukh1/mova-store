import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db, orders } from "@/db";
import { formatDate, formatINR } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export const metadata = { title: "Order" };

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const o = await db.query.orders.findFirst({ where: eq(orders.id, Number(params.id) || 0), with: { items: true } });
  if (!o) notFound();
  const a = o.shippingAddress;
  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-sage hover:text-forest"><ArrowLeft className="h-4 w-4" /> Orders</Link>
      <AdminHeader title={`Order ${o.orderNumber}`} description={`Placed ${formatDate(o.createdAt)} · last updated ${formatDate(o.updatedAt)}`}
        actions={<><StatusBadge value={o.paymentStatus} /><StatusBadge value={o.orderStatus} /><StatusBadge value={o.shippingStatus} /></>} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="a-card">
            <h2 className="font-display font-bold">Items</h2>
            <ul className="mt-3 divide-y divide-cream-200">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <div className="flex-1 text-sm">
                    {i.productId ? <Link href={`/admin/products/${i.productId}`} className="font-semibold hover:underline">{i.name}</Link> : <span className="font-semibold">{i.name}</span>}
                    <p className="text-xs text-sage">{[i.variantLabel, i.sku].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span className="text-sm text-sage">{i.quantity} × {formatINR(i.unitPrice)}</span>
                  <span className="w-20 text-right font-semibold">{formatINR(i.quantity * i.unitPrice)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-cream-200 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-sage">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between"><dt className="text-sage">Discount ({o.couponCode})</dt><dd>– {formatINR(o.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-sage">Shipping</dt><dd>{formatINR(o.shipping)}</dd></div>
              {o.codFee > 0 && <div className="flex justify-between"><dt className="text-sage">COD fee</dt><dd>{formatINR(o.codFee)}</dd></div>}
              <div className="flex justify-between border-t border-cream-200 pt-2 text-base font-bold"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
            </dl>
          </section>
          <section className="a-card">
            <h2 className="font-display font-bold">Update order</h2>
            <OrderStatusForm id={o.id} o={{ orderStatus: o.orderStatus, paymentStatus: o.paymentStatus, shippingStatus: o.shippingStatus, courier: o.courier ?? "", trackingNumber: o.trackingNumber ?? "", notes: o.notes ?? "" }} />
          </section>
        </div>
        <div className="space-y-6">
          <section className="a-card text-sm">
            <h2 className="font-display font-bold">Customer</h2>
            <p className="mt-3 font-semibold">{o.name}</p>
            <p><a href={`mailto:${o.email}`} className="text-forest hover:underline">{o.email}</a></p>
            <p><a href={`tel:${o.phone}`} className="text-forest hover:underline">{o.phone}</a></p>
            {o.customerId && <Link href={`/admin/customers/${o.customerId}`} className="mt-2 inline-block text-xs font-semibold text-forest underline">Customer history</Link>}
          </section>
          <section className="a-card text-sm">
            <h2 className="font-display font-bold">Shipping address</h2>
            <p className="mt-3 leading-relaxed">{a.line1}{a.line2 && <><br />{a.line2}</>}{a.landmark && <><br />Landmark: {a.landmark}</>}<br />{a.city}, {a.state} – {a.pincode}<br />{a.country}</p>
          </section>
          <section className="a-card text-sm">
            <h2 className="font-display font-bold">Payment</h2>
            <dl className="mt-3 space-y-1">
              <div className="flex justify-between"><dt className="text-sage">Method</dt><dd className="uppercase">{o.paymentMethod}</dd></div>
              <div className="flex justify-between"><dt className="text-sage">Razorpay order</dt><dd className="font-mono text-xs">{o.razorpayOrderId ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-sage">Payment ID</dt><dd className="font-mono text-xs">{o.razorpayPaymentId ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-sage">Stock reserved</dt><dd>{o.stockCommitted ? "Yes" : "No"}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
