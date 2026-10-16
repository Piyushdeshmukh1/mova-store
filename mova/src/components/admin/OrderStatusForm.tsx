"use client";
import { useFormState, useFormStatus } from "react-dom";
import { updateOrder } from "@/app/admin/actions";

const OPTS = {
  orderStatus: ["pending", "confirmed", "processing", "completed", "cancelled"],
  paymentStatus: ["pending", "paid", "failed", "refunded"],
  shippingStatus: ["unfulfilled", "packed", "shipped", "in_transit", "delivered", "returned"],
};
const LABELS = { orderStatus: "Order status", paymentStatus: "Payment status", shippingStatus: "Shipping status" };

function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="a-btn">{pending ? "Saving…" : "Save changes"}</button>;
}

export function OrderStatusForm({ id, o }: { id: number; o: Record<keyof typeof OPTS | "courier" | "trackingNumber" | "notes", string> }) {
  const [state, action] = useFormState(updateOrder.bind(null, id), undefined);
  return (
    <form action={action} className="mt-4 space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(OPTS) as (keyof typeof OPTS)[]).map((k) => (
          <div key={k}>
            <label className="a-label" htmlFor={k}>{LABELS[k]}</label>
            <select id={k} name={k} defaultValue={o[k]} className="a-input">{OPTS[k].map((v) => <option key={v} value={v}>{v.replace("_", " ")}</option>)}</select>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div><label className="a-label" htmlFor="courier">Courier</label><input id="courier" name="courier" defaultValue={o.courier} placeholder="Delhivery, Blue Dart…" className="a-input" /></div>
        <div><label className="a-label" htmlFor="tracking">Tracking number</label><input id="tracking" name="trackingNumber" defaultValue={o.trackingNumber} className="a-input" /></div>
      </div>
      <div><label className="a-label" htmlFor="notes">Notes (includes customer delivery notes)</label><textarea id="notes" name="notes" defaultValue={o.notes} rows={3} className="a-input" /></div>
      <div className="flex items-center gap-3">
        <Submit />
        {state?.ok && <span className="text-sm font-semibold text-forest">Saved. The customer sees updates on the tracking page.</span>}
        {state?.error && <span className="text-sm text-coral-600">{state.error}</span>}
      </div>
    </form>
  );
}
