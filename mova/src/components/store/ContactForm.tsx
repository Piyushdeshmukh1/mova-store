"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy"); setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => null);
    if (r?.ok) return setState("done");
    setError((await r?.json().catch(() => null))?.error ?? "Couldn't send your message. Please try again.");
    setState("idle");
  }
  if (state === "done") {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] bg-mint-200 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-forest" />
        <p className="mt-4 font-display text-2xl font-extrabold uppercase text-forest">Message received.</p>
        <p className="mt-2 text-charcoal/70">Thanks for writing in — we&apos;ll get back to you soon.</p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[2rem] bg-white p-6 md:grid-cols-2 md:p-8">
      <div><label className="label" htmlFor="c-name">Name</label><input id="c-name" name="name" required minLength={2} autoComplete="name" className="input" /></div>
      <div><label className="label" htmlFor="c-phone">Phone (optional)</label><input id="c-phone" name="phone" type="tel" autoComplete="tel" className="input" /></div>
      <div className="md:col-span-2"><label className="label" htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" required autoComplete="email" className="input" /></div>
      <div className="md:col-span-2"><label className="label" htmlFor="c-msg">How can we help?</label><textarea id="c-msg" name="message" required minLength={10} rows={6} className="input" /></div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {error && <p className="text-sm text-coral-600 md:col-span-2" role="alert">{error}</p>}
      <button disabled={state === "busy"} className="btn-primary md:col-span-2 md:justify-self-start">{state === "busy" ? "Sending…" : "Send message"}</button>
    </form>
  );
}
