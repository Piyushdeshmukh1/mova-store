"use client";
import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import type { Field } from "@/lib/schemas";
import { saveSettings } from "@/app/admin/actions";
import { FieldEditor } from "./FieldEditor";
import { useFlash } from "./Flash";

export function SettingsForm({ group, fields, initial }: { group: string; fields: Field[]; initial: Record<string, unknown> }) {
  const [value, setValue] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const { flash, node } = useFlash();
  return (
    <form onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await saveSettings(group, value); if (r.error) flash(r.error, false); else { flash("Saved — live on the site"); setDirty(false); } }); }}>
      <div className="a-card"><FieldEditor fields={fields} value={value} onChange={(v) => { setValue(v); setDirty(true); }} folder="brand" /></div>
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-end gap-3 border-t border-cream-300 bg-cream/90 px-4 py-4 backdrop-blur md:mx-0 md:rounded-2xl md:border">
        {dirty && <span className="text-xs font-medium text-sage">Unsaved changes</span>}
        <button className="a-btn" disabled={pending}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes</button>
      </div>
      {node}
    </form>
  );
}
