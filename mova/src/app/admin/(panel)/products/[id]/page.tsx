import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db, products, productVariants, categories } from "@/db";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: { params: { id: string } }) {
  const cats = await db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.position));
  const isNew = params.id === "new";
  let initial;
  if (isNew) {
    initial = {
      name: "", slug: "", sku: "", categoryId: cats[0]?.id ?? null, shortDescription: "", description: "", price: null, salePrice: null, stock: 0,
      images: [], specifications: [], badge: "", isActive: true, isFeatured: false, isBestseller: false, isNewArrival: true,
      seoTitle: "", seoDescription: "", ogImage: "", variants: [],
    };
  } else {
    const id = Number(params.id);
    if (!Number.isInteger(id)) notFound();
    const p = await db.query.products.findFirst({ where: eq(products.id, id), with: { variants: { orderBy: [asc(productVariants.position), asc(productVariants.id)] } } });
    if (!p) notFound();
    initial = {
      name: p.name, slug: p.slug, sku: p.sku, categoryId: p.categoryId, shortDescription: p.shortDescription ?? "", description: p.description,
      price: p.price, salePrice: p.salePrice, stock: p.stock, images: p.images, specifications: p.specifications, badge: p.badge ?? "",
      isActive: p.isActive, isFeatured: p.isFeatured, isBestseller: p.isBestseller, isNewArrival: p.isNewArrival,
      seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "", ogImage: p.ogImage ?? "",
      variants: p.variants.map((v) => ({ id: v.id, color: v.color ?? "", colorHex: v.colorHex ?? "", size: v.size ?? "", sku: v.sku, price: v.price, salePrice: v.salePrice, stock: v.stock })),
    };
  }
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-sage hover:text-forest"><ArrowLeft className="h-4 w-4" /> Products</Link>
      <AdminHeader title={isNew ? "New product" : initial.name} />
      <ProductForm key={params.id} id={isNew ? null : Number(params.id)} initial={initial} categories={cats} />
    </>
  );
}
