"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function useFlash() {
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>>();
  const flash = useCallback((text: string, ok = true) => {
    setMsg({ text, ok });
    clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), ok ? 2500 : 6000);
  }, []);
  useEffect(() => () => clearTimeout(t.current), []);
  const node = msg ? (
    <div role="status" className={`fixed bottom-5 right-5 z-[80] flex max-w-sm animate-rise items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl ${msg.ok ? "bg-forest text-cream" : "bg-coral text-charcoal"}`}>
      {msg.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}{msg.text}
    </div>
  ) : null;
  return { flash, node };
}
