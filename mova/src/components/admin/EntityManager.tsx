"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Copy, GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { ENTITIES, type EntityKey } from "@/lib/admin-entities";
import { deleteEntity, reorderEntity, saveEntity, toggleEntity } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { FieldEditor } from "./FieldEditor";
import { Toggle } from "./Toggle";
import { useFlash } from "./Flash";

type Row = Record<string, any> & { id: number };

export function EntityManager({ entity, rows: initial, linkBase }: { entity: EntityKey; rows: Row[]; linkBase?: string }) {
  const cfg = ENTITIES[entity];
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [drag, setDrag] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const { flash, node } = useFlash();

  useEffect(() => setRows(initial), [initial]);

  const edit = (r: Row | null) => {
    if (r ? open === r.id : open === "new") return setOpen(null);
    setOpen(r ? r.id : "new");
    setDraft(r ? { ...r } : { ...cfg.defaults });
  };

  const save = () => start(async () => {
    const res = await saveEntity(entity, open === "new" ? null : (open as number), draft);
    if (res.error) return flash(res.error, false);
    flash("Saved");
    setOpen(null);
    router.refresh();
  });

  const remove = (id: number) => {
    if (!confirm(`Delete this ${cfg.singular}? This can't be undone.`)) return;
    start(async () => {
      const r = await deleteEntity(entity, id);
      if (r.error) return flash(r.error, false);
      setRows((rs) => rs.filter((x) => x.id !== id));
      flash("Deleted");
      router.refresh();
    });
  };

  const duplicate = (r: Row) => {
    setOpen("new");
    const copy: Record<string, unknown> = { ...r };
    delete copy.id;
    if ("slug" in copy) copy.slug = "";
    if (entity === "coupons") copy.code = `${r.code}2`;
    setDraft(copy);
  };

  const onDrop = (target: number) => {
    if (drag === null || drag === target) return setDrag(null);
    const next = [...rows];
    const [x] = next.splice(drag, 1);
    next.splice(target, 0, x);
    setRows(next);
    setDrag(null);
    start(async () => { await reorderEntity(entity, next.map((r) => r.id)); flash("Order saved"); router.refresh(); });
  };

  const editor = (
    <div className="border-t border-cream-300 bg-cream/40 p-4 md:p-6">
      <FieldEditor fields={cfg.fields} value={draft} onChange={setDraft} folder={entity} />
      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        <button type="button" onClick={() => setOpen(null)} className="a-btn-ghost">Cancel</button>
        <button type="button" onClick={save} disabled={pending} className="a-btn">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save {cfg.singular}</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => edit(null)} className="a-btn"><Plus className="h-4 w-4" /> Add {cfg.singular}</button>
      </div>
      {open === "new" && <div className="mb-4 overflow-hidden rounded-2xl border-2 border-forest bg-white"><p className="px-5 pt-4 text-sm font-bold text-forest">New {cfg.singular}</p>{editor}</div>}
      <ul className="space-y-2">
        {rows.map((r, i) => {
          const img = cfg.imageKey ? r[cfg.imageKey] : null;
          return (
            <li key={r.id} draggable={cfg.sortable && open !== r.id} onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(i)}
              className={cn("overflow-hidden rounded-2xl border border-cream-300 bg-white transition", drag === i && "opacity-40", open === r.id && "border-forest shadow-lg")}>
              <div className="flex items-center gap-3 p-3 md:p-4">
                {cfg.sortable && <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-sage" aria-label="Drag to reorder" />}
                {cfg.imageKey && (
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                  </div>
                )}
                <button onClick={() => edit(r)} className="min-w-0 flex-1 text-left">
                  <p className="truncate font-semibold text-charcoal">{String(r[cfg.titleKey] ?? "")}</p>
                  {cfg.subtitleKey && r[cfg.subtitleKey] && <p className="truncate text-xs text-sage">{entity === "pages" ? "/" : ""}{String(r[cfg.subtitleKey])}</p>}
                </button>
                {linkBase && r.slug && <a href={`${linkBase}${r.slug}`} target="_blank" rel="noreferrer" className="hidden text-xs font-semibold text-forest hover:underline md:inline">View</a>}
                {cfg.visibleKey && (
                  <Toggle checked={!!r[cfg.visibleKey]} label="Visible" onChange={(v) => {
                    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, [cfg.visibleKey!]: v } : x)));
                    start(async () => { await toggleEntity(entity, r.id, v); flash(v ? "Now visible" : "Hidden"); });
                  }} />
                )}
                <button onClick={() => duplicate(r)} className="hidden h-9 w-9 place-items-center rounded-lg text-sage hover:bg-cream-200 hover:text-forest md:grid" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
                <button onClick={() => remove(r.id)} className="grid h-9 w-9 place-items-center rounded-lg text-sage hover:bg-coral-100 hover:text-coral-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                <button onClick={() => edit(r)} className="grid h-9 w-9 place-items-center rounded-lg text-sage hover:bg-cream-200" aria-label="Edit"><ChevronDown className={cn("h-4 w-4 transition", open === r.id && "rotate-180")} /></button>
              </div>
              {open === r.id && editor}
            </li>
          );
        })}
        {!rows.length && <li className="rounded-2xl border border-dashed border-cream-300 p-10 text-center text-sm text-sage">Nothing here yet.</li>}
      </ul>
      {node}
    </div>
  );
}
