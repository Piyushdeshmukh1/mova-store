import { asc } from "drizzle-orm";
import { db, navItems } from "@/db";
import { ENTITIES } from "@/lib/admin-entities";
import { AdminHeader } from "@/components/admin/AdminShell";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Navigation" };
export default async function Page() {
  const rows = await db.select().from(navItems).orderBy(asc(navItems.position), asc(navItems.id));
  return (
    <>
      <AdminHeader title={ENTITIES.nav.title} description={ENTITIES.nav.description} />
      <div className="mb-6 rounded-2xl bg-mint-200 p-4 text-sm text-forest">
        Useful links: <code>/</code> home · <code>/collection</code> all products · <code>/c/gym-towels</code> · <code>/c/handkerchiefs</code> · <code>/c/combo-packs</code> · <code>/our-story</code> · <code>/hello-there</code> · <code>/cart</code> bag · <code>/collection?filter=new</code> new arrivals
      </div>
      <EntityManager entity="nav" rows={rows} />
    </>
  );
}
