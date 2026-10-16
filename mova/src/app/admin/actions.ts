"use server";
import bcrypt from "bcryptjs";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  db, adminUsers, settings, navItems, homeSections, pages, testimonials, faqs, categories, coupons,
  products, productVariants, reviews, orders, contactMessages, subscribers,
} from "@/db";
import { clearSession, rateLimit, requireAdmin, setSession } from "@/lib/auth";
import { CMS_TAG } from "@/lib/cms";
import { ENTITIES, type EntityKey } from "@/lib/admin-entities";
import { SECTION_TYPES, SETTINGS_SCHEMAS, type Field } from "@/lib/schemas";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { slugify } from "@/lib/utils";
import { commitStock } from "@/lib/orders";

export type ActionResult = { ok?: boolean; error?: string; id?: number };

function refresh() {
  revalidateTag(CMS_TAG);
  revalidatePath("/", "layout");
}

function dbError(e: unknown): string {
  const msg = (e as { message?: string; code?: string })?.message ?? "";
  if ((e as { code?: string })?.code === "23505" || /duplicate key|unique/i.test(msg)) return "That value is already used by another item (slug, SKU or code must be unique).";
  console.error("[admin]", e);
  return "Something went wrong while saving. Please try again.";
}

/* ───────────── Auth ───────────── */

export async function adminLogin(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  if (!rateLimit("admin-login", 6)) return { error: "Too many attempts. Please wait 10 minutes." };
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const next = String(fd.get("next") || "/admin");
  const [u] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1).catch(() => []);
  // Always run a bcrypt compare so timing doesn't reveal whether the email exists.
  const ok = await bcrypt.compare(password, u?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!u || !ok) return { error: "Incorrect email or password." };
  await setSession({ sub: String(u.id), email: u.email, name: u.name, role: "admin" });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function adminLogout() {
  clearSession("admin");
  redirect("/admin/login");
}

export async function changePassword(_: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  const me = await requireAdmin();
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  if (next.length < 10) return { error: "New password must be at least 10 characters." };
  const [u] = await db.select().from(adminUsers).where(eq(adminUsers.id, Number(me.sub))).limit(1);
  if (!u || !(await bcrypt.compare(current, u.passwordHash))) return { error: "Current password is incorrect." };
  await db.update(adminUsers).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(adminUsers.id, u.id));
  return { ok: true };
}

/* ───────────── Generic collections ───────────── */

const TABLES = { nav: navItems, categories, testimonials, faqs, coupons, pages } as const;
const NOT_NULL_DEFAULTS: Record<string, unknown> = { category: "General", content: "", template: "default", type: "percent", kind: "review", rating: 5, minOrder: 0 };

function coerce(fields: Field[], data: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (!(f.key in data)) continue;
    const v = data[f.key];
    switch (f.type) {
      case "toggle": out[f.key] = !!v; break;
      case "number": {
        const n = v === "" || v == null ? null : Math.round(Number(v));
        out[f.key] = n == null || Number.isNaN(n) ? null : n;
        break;
      }
      case "date": out[f.key] = v ? new Date(String(v)) : null; break;
      case "list": out[f.key] = Array.isArray(v) ? v : []; break;
      default: {
        const s = typeof v === "string" ? v.trim() : v == null ? "" : String(v);
        out[f.key] = s === "" ? null : s.slice(0, 20000);
      }
    }
    if (out[f.key] == null && f.key in NOT_NULL_DEFAULTS) out[f.key] = NOT_NULL_DEFAULTS[f.key];
    if (f.required && (out[f.key] == null || out[f.key] === "")) throw new Error(`${f.label} is required.`);
  }
  return out;
}

export async function saveEntity(entity: EntityKey, id: number | null, data: Record<string, unknown>): Promise<ActionResult> {
  await requireAdmin();
  const cfg = ENTITIES[entity];
  if (!cfg) return { error: "Unknown collection." };
  let values: Record<string, unknown>;
  try { values = coerce(cfg.fields, data); } catch (e) { return { error: (e as Error).message }; }

  if (entity === "categories" || entity === "pages") {
    values.slug = slugify(String(values.slug || values.name || values.title || "")) || `item-${Date.now()}`;
    if (entity === "pages" && ["admin", "api", "c", "p", "cart", "checkout", "account", "order", "track", "wishlist", "collection"].includes(String(values.slug))) {
      return { error: "That URL is reserved. Choose another slug." };
    }
    if (entity === "pages") values.updatedAt = new Date();
  }
  if (entity === "coupons") {
    values.code = String(values.code).toUpperCase().replace(/\s+/g, "");
    if (values.type === "percent" && Number(values.value) > 90) return { error: "Percentage discounts must be 90% or less." };
  }
  if (entity === "testimonials" && values.rating != null) values.rating = Math.min(5, Math.max(1, Number(values.rating)));

  const table = TABLES[entity];
  try {
    if (id) {
      await db.update(table).set(values).where(eq(table.id, id));
    } else {
      if ("position" in table) {
        const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${(table as typeof navItems).position}), -1)::int` }).from(table);
        values.position = max + 1;
      }
      const [row] = await db.insert(table).values(values as never).returning({ id: table.id });
      id = row.id;
    }
  } catch (e) {
    return { error: dbError(e) };
  }
  refresh();
  return { ok: true, id };
}

export async function deleteEntity(entity: EntityKey, id: number): Promise<ActionResult> {
  await requireAdmin();
  const table = TABLES[entity];
  try { await db.delete(table).where(eq(table.id, id)); } catch (e) { return { error: dbError(e) }; }
  refresh();
  return { ok: true };
}

export async function toggleEntity(entity: EntityKey, id: number, value: boolean): Promise<ActionResult> {
  await requireAdmin();
  const key = ENTITIES[entity].visibleKey;
  if (!key) return { error: "Not supported." };
  const table = TABLES[entity];
  await db.update(table).set({ [key]: value } as never).where(eq(table.id, id));
  refresh();
  return { ok: true };
}

export async function reorderEntity(entity: EntityKey, ids: number[]): Promise<ActionResult> {
  await requireAdmin();
  if (!ENTITIES[entity].sortable) return { error: "Not sortable." };
  const table = TABLES[entity] as typeof navItems;
  await db.transaction(async (tx) => {
    for (const [i, id] of ids.entries()) await tx.update(table).set({ position: i }).where(eq(table.id, id));
  });
  refresh();
  return { ok: true };
}

/* ───────────── Homepage builder ───────────── */

export async function saveSection(id: number, label: string, content: Record<string, unknown>): Promise<ActionResult> {
  await requireAdmin();
  const [s] = await db.select().from(homeSections).where(eq(homeSections.id, id)).limit(1);
  if (!s || !SECTION_TYPES[s.type]) return { error: "Section not found." };
  const allowed = new Set(SECTION_TYPES[s.type].fields.map((f) => f.key));
  const clean = Object.fromEntries(Object.entries(content).filter(([k]) => allowed.has(k)));
  await db.update(homeSections).set({ label: label.trim().slice(0, 80) || SECTION_TYPES[s.type].name, content: clean }).where(eq(homeSections.id, id));
  refresh();
  return { ok: true };
}

export async function addSection(type: string): Promise<ActionResult> {
  await requireAdmin();
  const def = SECTION_TYPES[type];
  if (!def) return { error: "Unknown section type." };
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${homeSections.position}), -1)::int` }).from(homeSections);
  const content: Record<string, unknown> = {};
  for (const f of def.fields) content[f.key] = f.type === "list" ? [] : f.type === "toggle" ? false : f.type === "number" ? 4 : f.type === "select" ? f.options?.[0]?.value ?? "" : "";
  if ("heading" in content) content.heading = "NEW SECTION";
  const [row] = await db.insert(homeSections).values({ type, label: def.name, content, position: max + 1, isVisible: false }).returning({ id: homeSections.id });
  refresh();
  return { ok: true, id: row.id };
}

export async function duplicateSection(id: number): Promise<ActionResult> {
  await requireAdmin();
  const [s] = await db.select().from(homeSections).where(eq(homeSections.id, id)).limit(1);
  if (!s) return { error: "Section not found." };
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${homeSections.position}), -1)::int` }).from(homeSections);
  const [row] = await db.insert(homeSections).values({ type: s.type, label: `${s.label} (copy)`, content: s.content, position: max + 1, isVisible: false }).returning({ id: homeSections.id });
  refresh();
  return { ok: true, id: row.id };
}

export async function deleteSection(id: number): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(homeSections).where(eq(homeSections.id, id));
  refresh();
  return { ok: true };
}

export async function toggleSection(id: number, isVisible: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.update(homeSections).set({ isVisible }).where(eq(homeSections.id, id));
  refresh();
  return { ok: true };
}

export async function reorderSections(ids: number[]): Promise<ActionResult> {
  await requireAdmin();
  await db.transaction(async (tx) => {
    for (const [i, id] of ids.entries()) await tx.update(homeSections).set({ position: i }).where(eq(homeSections.id, id));
  });
  refresh();
  return { ok: true };
}

/* ───────────── Settings ───────────── */

export async function saveSettings(group: string, value: Record<string, unknown>): Promise<ActionResult> {
  await requireAdmin();
  const schema = SETTINGS_SCHEMAS[group];
  if (!schema || !(group in DEFAULT_SETTINGS)) return { error: "Unknown settings group." };
  let clean: Record<string, unknown>;
  try { clean = coerce(schema.fields, value); } catch (e) { return { error: (e as Error).message }; }
  // Settings are JSON: store empty strings rather than null so defaults don't reappear for cleared fields.
  for (const f of schema.fields) {
    if (clean[f.key] == null) clean[f.key] = f.type === "number" ? 0 : f.type === "toggle" ? false : f.type === "list" ? [] : "";
  }
  await db.insert(settings).values({ key: group, value: clean }).onConflictDoUpdate({ target: settings.key, set: { value: clean, updatedAt: new Date() } });
  refresh();
  return { ok: true };
}

/* ───────────── Products ───────────── */

const intOrNull = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().min(0).nullable());
const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(160),
  slug: z.string().trim().max(160).optional().default(""),
  sku: z.string().trim().min(1, "SKU is required.").max(64),
  categoryId: intOrNull,
  shortDescription: z.string().max(400).optional().default(""),
  description: z.string().max(20000).optional().default(""),
  price: z.preprocess(Number, z.number().int().min(1, "MRP must be at least ₹1.")),
  salePrice: intOrNull,
  stock: z.preprocess((v) => Number(v || 0), z.number().int().min(0)),
  images: z.array(z.string().max(1000)).max(12),
  specifications: z.array(z.object({ label: z.string().max(80), value: z.string().max(300) })).max(30),
  badge: z.string().max(40).optional().default(""),
  isActive: z.boolean(), isFeatured: z.boolean(), isBestseller: z.boolean(), isNewArrival: z.boolean(),
  seoTitle: z.string().max(160).optional().default(""),
  seoDescription: z.string().max(400).optional().default(""),
  ogImage: z.string().max(1000).optional().default(""),
  variants: z.array(z.object({
    id: z.number().int().positive().optional().nullable(),
    color: z.string().max(40).optional().default(""),
    colorHex: z.string().max(9).optional().default(""),
    size: z.string().max(40).optional().default(""),
    sku: z.string().trim().min(1, "Every variant needs a SKU.").max(64),
    price: intOrNull, salePrice: intOrNull,
    stock: z.preprocess((v) => Number(v || 0), z.number().int().min(0)),
  })).max(60),
});
export type ProductInput = z.input<typeof productSchema>;

export async function saveProduct(id: number | null, input: ProductInput): Promise<ActionResult> {
  await requireAdmin();
  const p = productSchema.safeParse(input);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Please check the form." };
  const { variants, ...d } = p.data;
  if (d.salePrice != null && d.salePrice >= d.price) return { error: "Sale price must be lower than the MRP (or left empty)." };
  const skus = variants.map((v) => v.sku.toUpperCase());
  if (new Set(skus).size !== skus.length) return { error: "Variant SKUs must be unique." };
  const nil = (s: string) => (s.trim() ? s.trim() : null);
  const values = {
    ...d, slug: slugify(d.slug || d.name), sku: d.sku.toUpperCase(),
    shortDescription: nil(d.shortDescription), badge: nil(d.badge), seoTitle: nil(d.seoTitle), seoDescription: nil(d.seoDescription), ogImage: nil(d.ogImage),
    images: d.images.map((s) => s.trim()).filter(Boolean), specifications: d.specifications.filter((s) => s.label.trim() && s.value.trim()),
    updatedAt: new Date(),
  };
  try {
    id = await db.transaction(async (tx) => {
      let pid = id;
      if (pid) await tx.update(products).set(values).where(eq(products.id, pid));
      else pid = (await tx.insert(products).values(values).returning({ id: products.id }))[0].id;
      const keep = variants.filter((v) => v.id).map((v) => v.id!) as number[];
      await tx.delete(productVariants).where(keep.length ? and(eq(productVariants.productId, pid), notInArray(productVariants.id, keep)) : eq(productVariants.productId, pid));
      for (const [i, v] of variants.entries()) {
        const row = { productId: pid, color: nil(v.color), colorHex: nil(v.colorHex), size: nil(v.size), sku: v.sku.toUpperCase(), price: v.price, salePrice: v.salePrice, stock: v.stock, position: i };
        if (v.id) await tx.update(productVariants).set(row).where(and(eq(productVariants.id, v.id), eq(productVariants.productId, pid)));
        else await tx.insert(productVariants).values(row);
      }
      return pid;
    });
  } catch (e) {
    return { error: dbError(e) };
  }
  refresh();
  return { ok: true, id: id! };
}

export async function toggleProduct(id: number, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.update(products).set({ isActive }).where(eq(products.id, id));
  refresh();
  return { ok: true };
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  refresh();
  return { ok: true };
}

export async function duplicateProduct(id: number): Promise<ActionResult> {
  await requireAdmin();
  const p = await db.query.products.findFirst({ where: eq(products.id, id), with: { variants: true } });
  if (!p) return { error: "Product not found." };
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  const { id: _id, createdAt: _c, updatedAt: _u, variants, ...rest } = p;
  const [row] = await db.insert(products).values({ ...rest, name: `${p.name} (copy)`, slug: `${p.slug}-${suffix.toLowerCase()}`, sku: `${p.sku}-${suffix}`, isActive: false }).returning({ id: products.id });
  if (variants.length) {
    await db.insert(productVariants).values(variants.map(({ id: _v, productId: _p, ...v }) => ({ ...v, productId: row.id, sku: `${v.sku}-${suffix}` })));
  }
  refresh();
  return { ok: true, id: row.id };
}

/* ───────────── Reviews ───────────── */

export async function setReviewApproved(id: number, isApproved: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.update(reviews).set({ isApproved }).where(eq(reviews.id, id));
  refresh();
  return { ok: true };
}
export async function deleteReview(id: number): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(reviews).where(eq(reviews.id, id));
  refresh();
  return { ok: true };
}

/* ───────────── Orders ───────────── */

const orderUpdate = z.object({
  orderStatus: z.enum(["pending", "confirmed", "processing", "completed", "cancelled"]),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
  shippingStatus: z.enum(["unfulfilled", "packed", "shipped", "in_transit", "delivered", "returned"]),
  courier: z.string().max(80).optional().default(""),
  trackingNumber: z.string().max(80).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
});

export async function updateOrder(id: number, _: ActionResult | undefined, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const p = orderUpdate.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Invalid status." };
  const d = p.data;
  await db.update(orders).set({ ...d, courier: d.courier || null, trackingNumber: d.trackingNumber || null, notes: d.notes || null, updatedAt: new Date() }).where(eq(orders.id, id));
  // Manually confirming a pending order (e.g. bank transfer) reserves its stock once.
  if (d.paymentStatus === "paid" || d.orderStatus === "confirmed" || d.orderStatus === "processing") await commitStock(id);
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}

/* ───────────── Inbox ───────────── */

export async function markMessage(id: number, isRead: boolean) {
  await requireAdmin();
  await db.update(contactMessages).set({ isRead }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/inbox");
}
export async function deleteMessage(id: number) {
  await requireAdmin();
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath("/admin/inbox");
}
export async function deleteSubscriber(id: number) {
  await requireAdmin();
  await db.delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/admin/inbox");
}
