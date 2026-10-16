import "server-only";
import { and, asc, desc, eq, ilike, or, sql, inArray, ne, type SQL } from "drizzle-orm";
import { db, products, categories, productVariants, reviews } from "@/db";

export type CardProduct = {
  id: number; name: string; slug: string; price: number; salePrice: number | null; images: string[];
  badge: string | null; isNewArrival: boolean; isBestseller: boolean; stock: number;
  categoryName: string | null; categorySlug: string | null;
  rating: number; reviewCount: number; variantCount: number; defaultVariantId: number | null;
};

const ratingSq = db
  .select({
    productId: reviews.productId,
    avg: sql<number>`coalesce(avg(${reviews.rating}), 0)::float`.as("avg"),
    count: sql<number>`count(*)::int`.as("count"),
  })
  .from(reviews)
  .where(eq(reviews.isApproved, true))
  .groupBy(reviews.productId)
  .as("r");

const variantSq = db
  .select({
    productId: productVariants.productId,
    vcount: sql<number>`count(*)::int`.as("vcount"),
    vstock: sql<number>`coalesce(sum(${productVariants.stock}), 0)::int`.as("vstock"),
    firstId: sql<number>`min(${productVariants.id})::int`.as("first_id"),
  })
  .from(productVariants)
  .groupBy(productVariants.productId)
  .as("v");

export type ListOptions = {
  categorySlug?: string;
  filter?: "featured" | "bestseller" | "new" | "sale";
  sort?: "featured" | "price-asc" | "price-desc" | "newest" | "rating";
  q?: string;
  limit?: number;
  excludeId?: number;
  ids?: number[];
};

export async function listProducts(o: ListOptions = {}): Promise<CardProduct[]> {
  const where: SQL[] = [eq(products.isActive, true)];
  if (o.categorySlug) where.push(eq(categories.slug, o.categorySlug));
  if (o.filter === "featured") where.push(eq(products.isFeatured, true));
  if (o.filter === "bestseller") where.push(eq(products.isBestseller, true));
  if (o.filter === "new") where.push(eq(products.isNewArrival, true));
  if (o.filter === "sale") where.push(sql`${products.salePrice} is not null and ${products.salePrice} < ${products.price}`);
  if (o.q) where.push(or(ilike(products.name, `%${o.q}%`), ilike(products.shortDescription, `%${o.q}%`))!);
  if (o.excludeId) where.push(ne(products.id, o.excludeId));
  if (o.ids?.length) where.push(inArray(products.id, o.ids));

  const selling = sql`coalesce(${products.salePrice}, ${products.price})`;
  const order =
    o.sort === "price-asc" ? [asc(selling)] :
    o.sort === "price-desc" ? [desc(selling)] :
    o.sort === "newest" ? [desc(products.createdAt)] :
    o.sort === "rating" ? [desc(sql`coalesce(${ratingSq.avg}, 0)`)] :
    [desc(products.isFeatured), desc(products.isBestseller), asc(products.id)];

  const rows = await db
    .select({
      id: products.id, name: products.name, slug: products.slug, price: products.price, salePrice: products.salePrice,
      images: products.images, badge: products.badge, isNewArrival: products.isNewArrival, isBestseller: products.isBestseller,
      stock: products.stock, categoryName: categories.name, categorySlug: categories.slug,
      rating: sql<number>`coalesce(${ratingSq.avg}, 0)::float`, reviewCount: sql<number>`coalesce(${ratingSq.count}, 0)::int`,
      variantCount: sql<number>`coalesce(${variantSq.vcount}, 0)::int`, variantStock: sql<number>`coalesce(${variantSq.vstock}, 0)::int`,
      defaultVariantId: variantSq.firstId,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(ratingSq, eq(ratingSq.productId, products.id))
    .leftJoin(variantSq, eq(variantSq.productId, products.id))
    .where(and(...where))
    .orderBy(...order)
    .limit(o.limit ?? 60);

  return rows.map(({ variantStock, ...r }) => ({
    ...r,
    stock: r.variantCount > 0 ? variantStock : r.stock,
    defaultVariantId: r.defaultVariantId ?? null,
  }));
}

/** Resolve a CMS "source" string (featured | bestseller | new | cat:slug) into products */
export function productsFromSource(source: string | undefined, limit = 4) {
  if (source?.startsWith("cat:")) return listProducts({ categorySlug: source.slice(4), limit });
  const f = (source as ListOptions["filter"]) || "featured";
  return listProducts({ filter: f, limit });
}

export async function getProductBySlug(slug: string) {
  const p = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
    with: {
      category: true,
      variants: { orderBy: [asc(productVariants.position), asc(productVariants.id)] },
      reviews: { where: eq(reviews.isApproved, true), orderBy: [desc(reviews.createdAt)], limit: 50 },
    },
  });
  if (!p) return null;
  const count = p.reviews.length;
  const rating = count ? p.reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { ...p, rating, reviewCount: count };
}

export async function getActiveCategories() {
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.position));
}

export async function getCategory(slug: string) {
  const [c] = await db.select().from(categories).where(and(eq(categories.slug, slug), eq(categories.isActive, true))).limit(1);
  return c ?? null;
}
