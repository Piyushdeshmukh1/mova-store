import { desc } from "drizzle-orm";
import { db, subscribers } from "@/db";
import { getAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  const csv = ["email,subscribed_at", ...rows.map((r) => `"${r.email.replace(/"/g, '""')}",${r.createdAt.toISOString()}`)].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="subscribers.csv"` } });
}
