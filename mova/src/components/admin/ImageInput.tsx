"use client";
import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";

export async function uploadFile(file: File, folder = "media"): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Upload failed");
  return d.url as string;
}

export function ImageInput({ value, onChange, folder }: { value: string; onChange: (v: string) => void; folder?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showUrl, setShowUrl] = useState(false);

  async function pick(f?: File | null) {
    if (!f) return;
    setBusy(true); setErr("");
    try { onChange(await uploadFile(f, folder)); } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => ref.current?.click()}
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
          className="group relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-cream-300 bg-cream-200 transition hover:border-forest"
          aria-label={value ? "Replace image" : "Upload image"}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : busy ? <Loader2 className="h-5 w-5 animate-spin text-sage" /> : <ImagePlus className="h-6 w-6 text-sage" />}
          {value && <span className="absolute inset-0 grid place-items-center bg-charcoal/50 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">{busy ? "Uploading…" : "Replace"}</span>}
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => ref.current?.click()} className="a-btn-ghost px-3 py-1.5 text-xs" disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />} Upload
            </button>
            <button type="button" onClick={() => setShowUrl((s) => !s)} className="a-btn-ghost px-3 py-1.5 text-xs"><Link2 className="h-3.5 w-3.5" /> URL</button>
            {value && <button type="button" onClick={() => onChange("")} className="a-btn-ghost px-3 py-1.5 text-xs"><X className="h-3.5 w-3.5" /> Remove</button>}
          </div>
          {(showUrl || (value && !value.startsWith("/uploads") && !value.includes("supabase"))) && (
            <input className="a-input text-xs" value={value} placeholder="https://… or /path.jpg" onChange={(e) => onChange(e.target.value)} />
          )}
          <p className="text-[11px] text-sage">JPG, PNG, WebP, AVIF or SVG · max 5 MB · drag & drop supported</p>
          {err && <p className="text-xs font-medium text-coral-600">{err}</p>}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}
