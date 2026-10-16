import { asc } from "drizzle-orm";
import { db, coupons } from "@/db";
import { ENTITIES } from "@/lib/admin-entities";
import { AdminHeader } from "@/components/admin/AdminShell";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Offers & coupons" };
export default async function Page() {
  const rows = (await db.select().from(coupons).orderBy(asc(coupons.code))).map((c) => ({
    ...c,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : null,
    summary: [
      c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`,
      c.minOrder ? `min ₹${c.minOrder}` : null,
      c.prepaidOnly ? "prepaid only" : null,
      `used ${c.usedCount}${c.usageLimit ? `/${c.usageLimit}` : ""}`,
      c.description,
    ].filter(Boolean).join(" · "),
  }));
  return (<><AdminHeader title={ENTITIES.coupons.title} description={ENTITIES.coupons.description} /><EntityManager entity="coupons" rows={rows} /></>);
}
