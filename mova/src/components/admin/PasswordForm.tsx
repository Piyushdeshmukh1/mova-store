"use client";
import { useFormState, useFormStatus } from "react-dom";
import { changePassword } from "@/app/admin/actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="a-btn">{pending ? "Saving…" : "Update password"}</button>;
}

export function PasswordForm() {
  const [state, action] = useFormState(changePassword, undefined);
  return (
    <form action={action} className="a-card max-w-md space-y-4">
      <div><label className="a-label" htmlFor="cur">Current password</label><input id="cur" name="current" type="password" autoComplete="current-password" required className="a-input" /></div>
      <div><label className="a-label" htmlFor="new">New password (10+ characters)</label><input id="new" name="next" type="password" autoComplete="new-password" minLength={10} required className="a-input" /></div>
      {state?.error && <p className="text-sm text-coral-600">{state.error}</p>}
      {state?.ok && <p className="text-sm font-semibold text-forest">Password updated.</p>}
      <Submit />
    </form>
  );
}
