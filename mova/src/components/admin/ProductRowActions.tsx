"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { deleteProduct, duplicateProduct, toggleProduct } from "@/app/admin/actions";
import { Toggle } from "./Toggle";

export function ProductRowActions({ id, isActive, slug }: { id: number; isActive: boolean; slug: string }) {
  const router = useRouter();
  const [on, setOn] = useState(isActive);
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1">
      <Toggle checked={on} disabled={pending} label={on ? "Disable product" : "Enable product"} onChange={(v) => { setOn(v); start(async () => { await toggleProduct(id, v); router.refresh(); }); }} />
      <span className="flex-1" />
      <Link href={`/admin/products/${id}`} className="grid h-8 w-8 place-items-center rounded-lg text-sage hover:bg-cream-200 hover:text-forest" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
      <a href={`/p/${slug}`} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg text-sage hover:bg-cream-200 hover:text-forest" aria-label="View in store"><ExternalLink className="h-4 w-4" /></a>
      <button disabled={pending} onClick={() => start(async () => { const r = await duplicateProduct(id); if (r.id) router.push(`/admin/products/${r.id}`); })} className="grid h-8 w-8 place-items-center rounded-lg text-sage hover:bg-cream-200 hover:text-forest" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
      <button disabled={pending} onClick={() => { if (confirm("Delete this product permanently?")) start(async () => { await deleteProduct(id); router.refresh(); }); }} className="grid h-8 w-8 place-items-center rounded-lg text-sage hover:bg-coral-100 hover:text-coral-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
