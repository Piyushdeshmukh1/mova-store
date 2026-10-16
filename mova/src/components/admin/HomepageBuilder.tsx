"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronDown, Copy, ExternalLink, Eye, EyeOff, GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { SECTION_TYPES } from "@/lib/schemas";
import { addSection, deleteSection, duplicateSection, reorderSections, saveSection, toggleSection } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { FieldEditor } from "./FieldEditor";
import { Toggle } from "./Toggle";
import { useFlash } from "./Flash";

type Section = { id: number; type: string; label: string; content: Record<string, unknown>; isVisible: boolean; position: number };

export function HomepageBuilder({ sections: initial, openId }: { sections: Section[]; openId?: number }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [open, setOpen] = useState<number | null>(openId ?? null);
  const [draft, setDraft] = useState<{ label: string; content: Record<string, unknown> } | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const { flash, node } = useFlash();

  useEffect(() => setList(initial), [initial]);
  useEffect(() => {
    const s = initial.find((x) => x.id === openId);
    if (s) setDraft({ label: s.label, content: s.content });
  }, [openId, initial]);

  const toggleOpen = (s: Section) => {
    if (open === s.id) { setOpen(null); return; }
    setOpen(s.id);
    setDraft({ label: s.label, content: structuredClone(s.content) });
  };

  const persistOrder = (next: Section[]) => {
    setList(next);
    start(async () => { await reorderSections(next.map((s) => s.id)); flash("Section order saved"); router.refresh(); });
  };
  const move = (i: number, to: number) => {
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const [x] = next.splice(i, 1);
    next.splice(to, 0, x);
    persistOrder(next);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
      <div>
        <ul className="space-y-3">
          {list.map((s, i) => {
            const def = SECTION_TYPES[s.type];
            const isOpen = open === s.id;
            return (
              <li key={s.id}
                draggable={!isOpen}
                onDragStart={() => setDrag(i)} onDragEnd={() => { setDrag(null); setOver(null); }}
                onDragOver={(e) => { e.preventDefault(); setOver(i); }}
                onDrop={() => { if (drag !== null && drag !== i) move(drag, i); setDrag(null); setOver(null); }}
                className={cn("overflow-hidden rounded-2xl border bg-white transition",
                  isOpen ? "border-forest shadow-xl" : "border-cream-300", drag === i && "opacity-40", over === i && drag !== i && "ring-2 ring-coral")}>
                <div className="flex items-center gap-2 p-3 md:gap-3 md:p-4">
                  <GripVertical className="hidden h-5 w-5 shrink-0 cursor-grab text-sage md:block" aria-label="Drag to reorder" />
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cream-200 text-xs font-bold text-forest">{i + 1}</span>
                  <button onClick={() => toggleOpen(s)} className="min-w-0 flex-1 text-left">
                    <p className={cn("truncate font-semibold", !s.isVisible && "text-sage line-through decoration-sage/40")}>{s.label}</p>
                    <p className="truncate text-xs text-sage">{def?.name ?? s.type}{typeof s.content.heading === "string" && s.content.heading ? ` · “${String(s.content.heading).replace(/\n/g, " ").slice(0, 50)}”` : ""}</p>
                  </button>
                  <div className="flex items-center">
                    <button onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-9 w-8 place-items-center text-sage hover:text-forest disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                    <button onClick={() => move(i, i + 1)} disabled={i === list.length - 1} className="grid h-9 w-8 place-items-center text-sage hover:text-forest disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                  </div>
                  <span className="hidden text-sage sm:inline">{s.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</span>
                  <Toggle checked={s.isVisible} label={s.isVisible ? "Hide section" : "Show section"} onChange={(v) => {
                    setList((l) => l.map((x) => (x.id === s.id ? { ...x, isVisible: v } : x)));
                    start(async () => { await toggleSection(s.id, v); flash(v ? "Section is now visible" : "Section hidden"); router.refresh(); });
                  }} />
                  <button onClick={() => toggleOpen(s)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-cream-200" aria-label="Edit section"><ChevronDown className={cn("h-4 w-4 transition", isOpen && "rotate-180")} /></button>
                </div>
                {isOpen && draft && def && (
                  <div className="border-t border-cream-300 bg-cream/40 p-4 md:p-6">
                    <p className="mb-5 text-sm text-sage">{def.description}</p>
                    <div className="mb-5">
                      <label className="a-label" htmlFor={`label-${s.id}`}>Section name (admin only)</label>
                      <input id={`label-${s.id}`} className="a-input" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
                    </div>
                    <FieldEditor fields={def.fields} value={draft.content} onChange={(content) => setDraft({ ...draft, content })} folder="homepage" />
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <button onClick={() => { if (confirm("Delete this section?")) start(async () => { await deleteSection(s.id); setOpen(null); flash("Section deleted"); router.refresh(); }); }} className="a-btn-danger"><Trash2 className="h-4 w-4" /> Delete</button>
                      <button onClick={() => start(async () => { await duplicateSection(s.id); flash("Duplicated (hidden until you show it)"); router.refresh(); })} className="a-btn-ghost"><Copy className="h-4 w-4" /> Duplicate</button>
                      <div className="flex-1" />
                      <button onClick={() => setOpen(null)} className="a-btn-ghost">Close</button>
                      <button disabled={pending} onClick={() => start(async () => {
                        const r = await saveSection(s.id, draft.label, draft.content);
                        if (r.error) return flash(r.error, false);
                        setList((l) => l.map((x) => (x.id === s.id ? { ...x, label: draft.label, content: draft.content } : x)));
                        flash("Saved — live on the homepage");
                        router.refresh();
                      })} className="a-btn">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save section</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
        <div className="a-card">
          <p className="font-display font-bold text-forest">Add a section</p>
          <p className="mt-1 text-xs text-sage">New sections start hidden so you can fill them in first.</p>
          {adding ? (
            <ul className="mt-4 space-y-1.5">
              {Object.entries(SECTION_TYPES).map(([type, def]) => (
                <li key={type}>
                  <button disabled={pending} onClick={() => start(async () => {
                    const r = await addSection(type);
                    setAdding(false);
                    if (r.id) { flash("Section added"); router.push(`/admin/homepage?open=${r.id}`); router.refresh(); }
                  })} className="w-full rounded-xl border border-cream-300 px-3 py-2 text-left text-sm hover:border-forest hover:bg-mint-200/40">
                    <span className="font-semibold">{def.name}</span>
                    <span className="block text-[11px] text-sage">{def.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <button onClick={() => setAdding(true)} className="a-btn mt-4 w-full justify-center"><Plus className="h-4 w-4" /> Add section</button>
          )}
        </div>
        <a href="/" target="_blank" className="a-btn-ghost w-full justify-center"><ExternalLink className="h-4 w-4" /> Preview homepage</a>
        <p className="px-1 text-xs leading-relaxed text-sage">Tip: drag sections (or use the arrows) to reorder them. Testimonials and product cards are managed in their own menus — sections pull them in automatically.</p>
      </aside>
      {node}
    </div>
  );
}
