import { asc } from "drizzle-orm";
import { db, categories } from "@/db";
import { ENTITIES } from "@/lib/admin-entities";
import { AdminHeader } from "@/components/admin/AdminShell";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Categories" };
export default async function Page() {
  const rows = await db.select().from(categories).orderBy(asc(categories.position), asc(categories.id));
  return (<><AdminHeader title={ENTITIES.categories.title} description={ENTITIES.categories.description} /><EntityManager entity="categories" rows={rows} linkBase="/c/" /></>);
}
