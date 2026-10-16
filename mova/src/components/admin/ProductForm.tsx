"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, ImagePlus, Loader2, Plus, Save, Star, Trash2, X } from "lucide-react";
import type { ProductInput } from "@/app/admin/actions";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { cn, formatINR, pricing, slugify } from "@/lib/utils";
import { FieldInput } from "./FieldEditor";
import { Toggle } from "./Toggle";
import { uploadFile } from "./ImageInput";
import { useFlash } from "./Flash";

type Variant = { id?: number | null; color: string; colorHex: string; size: string; sku: string; price: number | null; salePrice: number | null; stock: number };
type Form = Omit<ProductInput, "variants" | "price" | "salePrice" | "stock" | "categoryId"> & {
  price: number | null; salePrice: number | null; stock: number; categoryId: number | null; variants: Variant[];
};

export function ProductForm({ id, initial, categories }: { id: number | null; initial: Form; categories: { id: number; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(initial);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const { flash, node } = useFlash();
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const hasVariants = f.variants.length > 0;
  const totalStock = hasVariants ? f.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0) : f.stock;
  const pr = f.price ? pricing(f.price, f.salePrice) : null;

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files).slice(0, 12)) {
      try { urls.push(await uploadFile(file, "products")); } catch (e) { flash((e as Error).message, false); }
    }
    set("images", [...f.images, ...urls].slice(0, 12));
    setUploading(false);
  }
  const moveImg = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= f.images.length) return;
    const imgs = [...f.images];
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    set("images", imgs);
  };
  const setVar = (i: number, patch: Partial<Variant>) => set("variants", f.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await saveProduct(id, { ...f, price: f.price ?? 0 } as ProductInput);
      if (r.error) return flash(r.error, false);
      flash("Product saved");
      if (!id && r.id) router.replace(`/admin/products/${r.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="a-card space-y-5">
          <h2 className="font-display text-lg font-bold">Basics</h2>
          <div>
            <label className="a-label" htmlFor="p-name">Product name *</label>
            <input id="p-name" className="a-input text-base font-semibold" value={f.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="a-label" htmlFor="p-slug">URL slug</label>
              <div className="flex items-center rounded-xl border border-cream-300 bg-white pl-3 text-sm text-sage focus-within:border-forest">
                /p/<input id="p-slug" className="w-full bg-transparent px-1 py-2.5 text-charcoal focus:outline-none" value={f.slug} placeholder={slugify(f.name)} onChange={(e) => set("slug", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="a-label" htmlFor="p-sku">SKU *</label>
              <input id="p-sku" className="a-input uppercase" value={f.sku} onChange={(e) => set("sku", e.target.value)} required />
            </div>
          </div>
          <FieldInput field={{ key: "shortDescription", label: "Short description (shown near the price & in search results)", type: "textarea" }} value={f.shortDescription} onChange={(v) => set("shortDescription", v)} />
          <FieldInput field={{ key: "description", label: "Full description", type: "textarea", help: "Line breaks are kept." }} value={f.description} onChange={(v) => set("description", v)} />
        </section>

        <section className="a-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Images</h2>
            <span className="text-xs text-sage">First image is the main one · second shows on hover</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {f.images.map((src, i) => (
              <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl border border-cream-300 bg-cream-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold text-cream">MAIN</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-charcoal/60 p-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  <button type="button" onClick={() => moveImg(i, -1)} className="grid h-7 w-7 place-items-center text-white" aria-label="Move left"><ArrowLeft className="h-4 w-4" /></button>
                  <button type="button" onClick={() => set("images", f.images.filter((_, j) => j !== i))} className="grid h-7 w-7 place-items-center text-white" aria-label="Remove image"><X className="h-4 w-4" /></button>
                  <button type="button" onClick={() => moveImg(i, 1)} className="grid h-7 w-7 place-items-center text-white" aria-label="Move right"><ArrowRight className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
              className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-cream-300 text-center text-xs text-sage transition hover:border-forest hover:text-forest">
              <span>{uploading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : <ImagePlus className="mx-auto h-6 w-6" />}<span className="mt-1 block">Upload</span></span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <input id="img-url" className="a-input" placeholder="…or paste an image URL and press Add" onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); const v = e.currentTarget.value.trim(); if (v) { set("images", [...f.images, v]); e.currentTarget.value = ""; } }
            }} />
            <button type="button" className="a-btn-ghost" onClick={() => { const el = document.getElementById("img-url") as HTMLInputElement; if (el.value.trim()) { set("images", [...f.images, el.value.trim()]); el.value = ""; } }}>Add</button>
          </div>
        </section>

        <section className="a-card">
          <h2 className="mb-4 font-display text-lg font-bold">Pricing & stock</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="a-label" htmlFor="p-price">MRP (₹) *</label>
              <input id="p-price" type="number" min={1} className="a-input" value={f.price ?? ""} onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))} required />
            </div>
            <div>
              <label className="a-label" htmlFor="p-sale">Sale price (₹)</label>
              <input id="p-sale" type="number" min={0} className="a-input" value={f.salePrice ?? ""} placeholder="No discount" onChange={(e) => set("salePrice", e.target.value === "" ? null : Number(e.target.value))} />
            </div>
            <div>
              <label className="a-label" htmlFor="p-stock">Stock {hasVariants && "(from variants)"}</label>
              <input id="p-stock" type="number" min={0} className="a-input disabled:bg-cream-200" disabled={hasVariants} value={hasVariants ? totalStock : f.stock} onChange={(e) => set("stock", Number(e.target.value) || 0)} />
            </div>
          </div>
          {pr && (
            <p className="mt-3 text-sm text-sage">
              Customers pay <strong className="text-forest">{formatINR(pr.selling)}</strong>
              {pr.off > 0 && <> · shown as <span className="line-through">{formatINR(pr.mrp)}</span> <strong className="text-coral-600">{pr.off}% off</strong></>}
            </p>
          )}
        </section>

        <section className="a-card">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">Variants</h2>
            <button type="button" className="a-btn-ghost py-2" onClick={() => set("variants", [...f.variants, { color: "", colorHex: "", size: "", sku: `${f.sku || "SKU"}-${f.variants.length + 1}`.toUpperCase(), price: null, salePrice: null, stock: 0 }])}>
              <Plus className="h-4 w-4" /> Add variant
            </button>
          </div>
          <p className="mb-4 text-xs text-sage">Add colours and/or sizes. Leave price fields empty to use the product price. With variants, stock is tracked per variant.</p>
          {hasVariants && (
            <div className="-mx-2 overflow-x-auto">
              <table className="a-table min-w-[760px]">
                <thead><tr><th>Colour</th><th>Swatch</th><th>Size</th><th>SKU</th><th>MRP ₹</th><th>Sale ₹</th><th>Stock</th><th /></tr></thead>
                <tbody>
                  {f.variants.map((v, i) => (
                    <tr key={v.id ?? `n${i}`}>
                      <td><input className="a-input py-2" value={v.color} placeholder="Forest" onChange={(e) => setVar(i, { color: e.target.value })} aria-label="Colour" /></td>
                      <td><div className="flex items-center gap-1"><input type="color" className="h-9 w-9 rounded-lg border border-cream-300" value={v.colorHex || "#123C35"} onChange={(e) => setVar(i, { colorHex: e.target.value })} aria-label="Swatch colour" />{v.colorHex && <button type="button" onClick={() => setVar(i, { colorHex: "" })} className="text-sage" aria-label="Clear swatch"><X className="h-3 w-3" /></button>}</div></td>
                      <td><input className="a-input w-24 py-2" value={v.size} placeholder="Large" onChange={(e) => setVar(i, { size: e.target.value })} aria-label="Size" /></td>
                      <td><input className="a-input py-2 uppercase" value={v.sku} onChange={(e) => setVar(i, { sku: e.target.value })} aria-label="Variant SKU" /></td>
                      <td><input type="number" className="a-input w-24 py-2" value={v.price ?? ""} placeholder="—" onChange={(e) => setVar(i, { price: e.target.value === "" ? null : Number(e.target.value) })} aria-label="Variant MRP" /></td>
                      <td><input type="number" className="a-input w-24 py-2" value={v.salePrice ?? ""} placeholder="—" onChange={(e) => setVar(i, { salePrice: e.target.value === "" ? null : Number(e.target.value) })} aria-label="Variant sale price" /></td>
                      <td><input type="number" min={0} className={cn("a-input w-20 py-2", v.stock <= 5 && "border-coral")} value={v.stock} onChange={(e) => setVar(i, { stock: Number(e.target.value) || 0 })} aria-label="Variant stock" /></td>
                      <td><button type="button" onClick={() => set("variants", f.variants.filter((_, j) => j !== i))} className="grid h-9 w-9 place-items-center text-sage hover:text-coral-600" aria-label="Remove variant"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="a-card">
          <FieldInput field={{ key: "specifications", label: "Specifications", type: "list", itemLabel: "Spec", fields: [{ key: "label", label: "Label (e.g. Material)", type: "text" }, { key: "value", label: "Value (e.g. 100% cotton)", type: "text" }] }}
            value={f.specifications} onChange={(v) => set("specifications", v)} />
        </section>

        <section className="a-card space-y-5">
          <h2 className="font-display text-lg font-bold">SEO</h2>
          <FieldInput field={{ key: "seoTitle", label: "SEO title", type: "text", help: `${(f.seoTitle || f.name).length} characters · leave empty to use the product name` }} value={f.seoTitle} onChange={(v) => set("seoTitle", v)} />
          <FieldInput field={{ key: "seoDescription", label: "Meta description", type: "textarea", help: `${(f.seoDescription || "").length}/160 characters · leave empty to use the short description` }} value={f.seoDescription} onChange={(v) => set("seoDescription", v)} />
          <FieldInput field={{ key: "ogImage", label: "Social share image (defaults to main image)", type: "image" }} value={f.ogImage} onChange={(v) => set("ogImage", v)} folder="products" />
          <div className="rounded-xl bg-cream-200 p-4">
            <p className="text-xs text-sage">Google preview</p>
            <p className="mt-1 truncate text-[17px] text-[#1a0dab]">{f.seoTitle || f.name || "Product name"}</p>
            <p className="truncate text-xs text-[#006621]">/p/{f.slug || slugify(f.name)}</p>
            <p className="line-clamp-2 text-sm text-charcoal/70">{f.seoDescription || f.shortDescription || "Add a description to control what shows here."}</p>
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:h-fit">
        <section className="a-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Enabled (visible in store)</span>
            <Toggle checked={!!f.isActive} onChange={(v) => set("isActive", v)} label="Enabled" />
          </div>
          <button disabled={pending} className="a-btn w-full justify-center">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {id ? "Save product" : "Create product"}</button>
          {id && f.slug && <a href={`/p/${slugify(f.slug)}`} target="_blank" rel="noreferrer" className="a-btn-ghost w-full justify-center"><ExternalLink className="h-4 w-4" /> View in store</a>}
        </section>
        <section className="a-card space-y-4">
          <div>
            <label className="a-label" htmlFor="p-cat">Category</label>
            <select id="p-cat" className="a-input" value={f.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">— none —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="a-label" htmlFor="p-badge">Badge on card (optional)</label>
            <input id="p-badge" className="a-input" value={f.badge ?? ""} placeholder="e.g. Bestseller, Value pack" onChange={(e) => set("badge", e.target.value)} />
          </div>
          {([["isFeatured", "Featured"], ["isBestseller", "Bestseller"], ["isNewArrival", "New arrival"]] as const).map(([k, l]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium"><Star className="h-4 w-4 text-coral" />{l}</span>
              <Toggle checked={!!f[k]} onChange={(v) => set(k, v)} label={l} />
            </div>
          ))}
        </section>
        {id && (
          <button type="button" className="a-btn-danger w-full justify-center" onClick={() => {
            if (!confirm("Delete this product permanently? Past orders keep their details.")) return;
            start(async () => { await deleteProduct(id); router.push("/admin/products"); router.refresh(); });
          }}><Trash2 className="h-4 w-4" /> Delete product</button>
        )}
      </aside>
      {node}
    </form>
  );
}
