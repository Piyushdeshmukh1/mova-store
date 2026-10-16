"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("busy");
    const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, name: f.get("name"), title: f.get("title"), body: f.get("body") }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { setState("done"); setMsg("Thanks! Your review will appear once it's approved."); }
    else { setState("error"); setMsg(d.error || "Please check the form and try again."); }
  }

  if (state === "done") return <p className="rounded-2xl bg-mint-200 p-5 font-medium text-forest">{msg}</p>;
  if (!open) return <button onClick={() => setOpen(true)} className="btn-ghost">Write a review</button>;
  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[2rem] bg-white p-6 md:p-8">
      <div>
        <span className="label">Your rating</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} role="radio" aria-checked={rating === n} aria-label={`${n} stars`}>
              <Star className={cn("h-8 w-8 transition", n <= rating ? "fill-coral text-coral" : "text-sage-200")} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="label" htmlFor="rv-name">Name</label><input id="rv-name" name="name" required maxLength={60} className="input" /></div>
        <div><label className="label" htmlFor="rv-title">Headline</label><input id="rv-title" name="title" maxLength={80} className="input" /></div>
      </div>
      <div><label className="label" htmlFor="rv-body">Review</label><textarea id="rv-body" name="body" required minLength={10} maxLength={1500} rows={4} className="input" /></div>
      {state === "error" && <p className="text-sm text-coral-600" role="alert">{msg}</p>}
      <div className="flex gap-3"><button disabled={state === "busy"} className="btn-primary">Submit review</button><button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button></div>
    </form>
  );
}
