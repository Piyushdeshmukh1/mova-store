"use client";
import { useId, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import type { Field } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { ImageInput } from "./ImageInput";
import { Toggle } from "./Toggle";

type Obj = Record<string, any>;

/** Renders any schema of fields against a value object. Used by every admin form. */
export function FieldEditor({ fields, value, onChange, folder }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void; folder?: string }) {
  return (
    <div className="grid gap-x-4 gap-y-5 md:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={cn(!f.half && "md:col-span-2")}>
          <FieldInput field={f} value={value?.[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} folder={folder} />
        </div>
      ))}
    </div>
  );
}

export function FieldInput({ field: f, value, onChange, folder }: { field: Field; value: any; onChange: (v: any) => void; folder?: string }) {
  const id = `f-${f.key}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const label = (
    <label htmlFor={id} className="a-label">
      {f.label}{f.required && <span className="text-coral-600"> *</span>}
    </label>
  );
  const help = f.help && <p className="mt-1 text-[11px] text-sage">{f.help}</p>;

  switch (f.type) {
    case "toggle":
      return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-cream-300 bg-white px-3 py-2.5">
          <span className="text-sm font-medium">{f.label}</span>
          <Toggle checked={!!value} onChange={onChange} label={f.label} />
        </div>
      );
    case "textarea":
    case "markdown":
      return (
        <div>{label}
          <textarea id={id} className={cn("a-input leading-relaxed", f.type === "markdown" && "font-mono text-[13px]")} rows={f.type === "markdown" ? 16 : 3}
            value={value ?? ""} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
          {help}
        </div>
      );
    case "number":
      return (
        <div>{label}
          <input id={id} type="number" inputMode="numeric" className="a-input" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />
          {help}
        </div>
      );
    case "date":
      return (
        <div>{label}
          <input id={id} type="date" className="a-input" value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value || null)} />
          {help}
        </div>
      );
    case "color":
      return (
        <div>{label}
          <div className="flex gap-2">
            <input type="color" className="h-10 w-12 rounded-lg border border-cream-300" value={value || "#123C35"} onChange={(e) => onChange(e.target.value)} />
            <input id={id} className="a-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
          </div>
        </div>
      );
    case "select":
      return (
        <div>{label}
          <select id={id} className="a-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
            {!f.options?.some((o) => o.value === value) && <option value={value ?? ""}>{value ? String(value) : "— choose —"}</option>}
            {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {help}
        </div>
      );
    case "image":
      return <div><span className="a-label">{f.label}</span><ImageInput value={value ?? ""} onChange={onChange} folder={folder} />{help}</div>;
    case "list":
      return <ListEditor field={f} value={Array.isArray(value) ? value : []} onChange={onChange} folder={folder} />;
    default:
      return (
        <div>{label}
          <input id={id} className="a-input" value={value ?? ""} placeholder={f.placeholder ?? (f.type === "url" ? "/collection or https://…" : undefined)} onChange={(e) => onChange(e.target.value)} />
          {help}
        </div>
      );
  }
}

function ListEditor({ field: f, value, onChange, folder }: { field: Field; value: Obj[]; onChange: (v: Obj[]) => void; folder?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const sub = f.fields ?? [];
  const summary = (item: Obj) => String(item[sub[0]?.key] ?? item.title ?? item.label ?? item.text ?? "").slice(0, 60) || `${f.itemLabel ?? "Item"}`;
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
    setOpen((o) => (o === from ? to : o));
  };
  const simple = sub.length <= 2 && sub.every((s) => s.type === "text" || s.type === "url");

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="a-label mb-0">{f.label}</span>
        <span className="text-[11px] text-sage">{value.length} {value.length === 1 ? "item" : "items"}</span>
      </div>
      <ul className="space-y-2">
        {value.map((item, i) => (
          <li key={i} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
            className={cn("rounded-xl border border-cream-300 bg-cream/60", drag === i && "opacity-50")}>
            {simple ? (
              <div className="flex items-center gap-2 p-2">
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-sage" aria-hidden />
                {sub.map((s) => (
                  <input key={s.key} aria-label={s.label} placeholder={s.label} className="a-input py-2"
                    value={item[s.key] ?? ""} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, [s.key]: e.target.value } : x)))} />
                ))}
                <ItemTools i={i} n={value.length} move={move} remove={() => onChange(value.filter((_, j) => j !== i))} />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 p-2 pl-3">
                  <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-sage" aria-hidden />
                  <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-semibold">
                    <span className="truncate">{summary(item)}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 text-sage transition", open === i && "rotate-180")} />
                  </button>
                  <ItemTools i={i} n={value.length} move={move} remove={() => onChange(value.filter((_, j) => j !== i))} />
                </div>
                {open === i && (
                  <div className="border-t border-cream-300 bg-white p-4">
                    <FieldEditor fields={sub} value={item} folder={folder} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => { onChange([...value, Object.fromEntries(sub.map((s) => [s.key, s.type === "list" ? [] : ""]))]); setOpen(value.length); }}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-forest hover:bg-mint-200">
        <Plus className="h-4 w-4" /> Add {f.itemLabel?.toLowerCase() ?? "item"}
      </button>
    </div>
  );
}

function ItemTools({ i, n, move, remove }: { i: number; n: number; move: (a: number, b: number) => void; remove: () => void }) {
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-8 w-7 place-items-center text-sage hover:text-forest disabled:opacity-30" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
      <button type="button" onClick={() => move(i, i + 1)} disabled={i === n - 1} className="grid h-8 w-7 place-items-center text-sage hover:text-forest disabled:opacity-30" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
      <button type="button" onClick={remove} className="grid h-8 w-8 place-items-center text-sage hover:text-coral-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
