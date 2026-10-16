import { asc } from "drizzle-orm";
import { db, pages } from "@/db";
import { ENTITIES } from "@/lib/admin-entities";
import { AdminHeader } from "@/components/admin/AdminShell";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Pages & policies" };
export default async function Page() {
  const rows = await db.select().from(pages).orderBy(asc(pages.id));
  return (<><AdminHeader title={ENTITIES.pages.title} description={ENTITIES.pages.description} /><EntityManager entity="pages" rows={rows} linkBase="/" /></>);
}
