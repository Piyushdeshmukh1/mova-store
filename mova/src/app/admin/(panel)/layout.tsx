import { count, eq } from "drizzle-orm";
import { db, contactMessages } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/cms";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const [{ site }, [unread]] = await Promise.all([
    getSettings(),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.isRead, false)).catch(() => [{ n: 0 }]),
  ]);
  return <AdminShell brand={site.brandName} email={me.email} unread={unread?.n ?? 0}>{children}</AdminShell>;
}
