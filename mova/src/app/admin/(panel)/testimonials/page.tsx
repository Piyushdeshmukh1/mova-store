import { asc } from "drizzle-orm";
import { db, testimonials } from "@/db";
import { ENTITIES } from "@/lib/admin-entities";
import { AdminHeader } from "@/components/admin/AdminShell";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Testimonials" };
export default async function Page() {
  const rows = await db.select().from(testimonials).orderBy(asc(testimonials.position), asc(testimonials.id));
  return (<><AdminHeader title={ENTITIES.testimonials.title} description={ENTITIES.testimonials.description} /><EntityManager entity="testimonials" rows={rows} /></>);
}
