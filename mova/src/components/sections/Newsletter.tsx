"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";


export function Newsletter({ c }: { c: Record<string, any> }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { setState("done"); setMsg(c.successMessage || "You're subscribed."); setEmail(""); }
    else { setState("error"); setMsg(d.error || "Enter a valid email address."); }
  }

  return (
    <section className="container pb-20 md:pb-28">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-mint px-6 py-16 text-center sm:px-12 md:py-24">
        <div aria-hidden className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-mint-600/40" />
        <div aria-hidden className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-coral/30" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-display-lg uppercase">{c.heading}</h2>
          {c.text && <p className="mx-auto mt-5 max-w-lg text-lg text-forest/80">{c.text}</p>}
          <form onSubmit={submit} className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row sm:rounded-full sm:bg-white sm:p-2 sm:shadow-lg">
            <label htmlFor="nl-email" className="sr-only">{c.placeholder || "Email"}</label>
            <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={c.placeholder}
              className="h-14 flex-1 rounded-full bg-white px-6 text-[15px] text-charcoal placeholder:text-sage focus:outline-none sm:h-auto sm:bg-transparent" />
            <button disabled={state === "busy"} className="btn-primary">
              {state === "busy" && <Loader2 className="h-4 w-4 animate-spin" />}{c.buttonLabel}
            </button>
          </form>
          <p aria-live="polite" className={`mt-4 min-h-6 text-sm font-medium ${state === "error" ? "text-coral-600" : "text-forest"}`}>{msg}</p>
        </div>
      </div>
    </section>
  );
}
