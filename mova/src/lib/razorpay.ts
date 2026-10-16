import "server-only";
import crypto from "crypto";

/** Thin Razorpay REST client — no SDK dependency required. */
export const razorpayEnabled = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
export const mockPaymentsAllowed = () => !razorpayEnabled() && process.env.ALLOW_MOCK_PAYMENTS === "true" && process.env.NODE_ENV !== "production";

export async function createRazorpayOrder(amountInr: number, receipt: string, notes: Record<string, string> = {}) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountInr * 100, currency: "INR", receipt, notes, payment_capture: 1 }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed: ${await res.text()}`);
  return (await res.json()) as { id: string; amount: number; currency: string };
}

const safeEqual = (a: string, b: string) => {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

/** Verifies the signature returned to the browser by Razorpay Checkout */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

/** Verifies X-Razorpay-Signature on webhooks */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
