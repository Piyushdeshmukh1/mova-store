import { asc } from "drizzle-orm";
import { db, homeSections } from "@/db";
import { AdminHeader } from "@/components/admin/AdminShell";
import { HomepageBuilder } from "@/components/admin/HomepageBuilder";

export const metadata = { title: "Homepage" };
export default async function Page({ searchParams }: { searchParams: { open?: string } }) {
  const rows = await db.select().from(homeSections).orderBy(asc(homeSections.position), asc(homeSections.id));
  return (
    <>
      <AdminHeader title="Homepage builder" description="Edit every homepage section — headings, text, images, buttons and which products show. Show/hide sections and drag to reorder. Changes go live as soon as you save." />
      <HomepageBuilder sections={rows.map((r) => ({ ...r, content: r.content as Record<string, unknown> }))} openId={searchParams.open ? Number(searchParams.open) : undefined} />
    </>
  );
}
