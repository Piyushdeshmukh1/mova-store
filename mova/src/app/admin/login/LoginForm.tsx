"use client";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Lock } from "lucide-react";
import { adminLogin } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="a-btn w-full justify-center py-3">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Sign in</button>;
}

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useFormState(adminLogin, undefined);
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div><label className="a-label" htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required className="a-input py-3" /></div>
      <div><label className="a-label" htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="a-input py-3" /></div>
      {state?.error && <p className="rounded-xl bg-coral-100 px-3 py-2 text-sm font-medium text-coral-600" role="alert">{state.error}</p>}
      <Submit />
    </form>
  );
}
