import { CheckoutView } from "@/components/store/CheckoutView";
import { getSettings } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";
import { mockPaymentsAllowed, razorpayEnabled } from "@/lib/razorpay";
import { getCustomer } from "@/lib/auth";
import { db, customers } from "@/db";
import { eq } from "drizzle-orm";

export async function generateMetadata() {
  return { ...(await buildMetadata({ title: "Checkout", path: "/checkout" })), robots: { index: false } };
}

export default async function CheckoutPage() {
  const [s, session] = await Promise.all([getSettings(), getCustomer()]);
  let prefill = { name: "", email: "", phone: "" };
  if (session) {
    const [c] = await db.select().from(customers).where(eq(customers.id, Number(session.sub))).limit(1).catch(() => []);
    if (c) prefill = { name: c.name ?? "", email: c.email, phone: c.phone ?? "" };
  }
  return (
    <CheckoutView
      prefill={prefill}
      codEnabled={s.commerce.codEnabled}
      codFee={s.commerce.codFee}
      onlineAvailable={razorpayEnabled() || mockPaymentsAllowed()}
      testMode={!razorpayEnabled() && mockPaymentsAllowed()}
      delivery={s.commerce.estimatedDelivery}
    />
  );
}
