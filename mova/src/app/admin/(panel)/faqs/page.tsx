import { asc } from "drizzle-orm";
import { db, faqs } from "@/db";
import { ENTITIES } from "@/lib/admin-entities";
import { AdminHeader } from "@/components/admin/AdminShell";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "FAQs" };
export default async function Page() {
  const rows = await db.select().from(faqs).orderBy(asc(faqs.position), asc(faqs.id));
  return (<><AdminHeader title={ENTITIES.faqs.title} description={ENTITIES.faqs.description} /><EntityManager entity="faqs" rows={rows} /></>);
}
