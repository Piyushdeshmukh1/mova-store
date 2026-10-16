"use client";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, registerAction } from "@/app/(store)/account/actions";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary mt-2 w-full">{pending ? "Please wait…" : children}</button>;
}

export function AuthForms() {
  const [login, loginAct] = useFormState(loginAction, undefined);
  const [reg, regAct] = useFormState(registerAction, undefined);
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2">
      <form action={loginAct} className="space-y-4 rounded-[2rem] bg-white p-6 md:p-8">
        <h2 className="text-xl uppercase">Sign in</h2>
        <div><label className="label" htmlFor="l-email">Email</label><input id="l-email" name="email" type="email" autoComplete="email" required className="input" /></div>
        <div><label className="label" htmlFor="l-pass">Password</label><input id="l-pass" name="password" type="password" autoComplete="current-password" required className="input" /></div>
        {login?.error && <p className="text-sm text-coral-600" role="alert">{login.error}</p>}
        <Submit>Sign in</Submit>
      </form>
      <form action={regAct} className="space-y-4 rounded-[2rem] bg-mint-200 p-6 md:p-8">
        <h2 className="text-xl uppercase">Create account</h2>
        <div><label className="label" htmlFor="r-name">Name</label><input id="r-name" name="name" autoComplete="name" required className="input" /></div>
        <div><label className="label" htmlFor="r-email">Email</label><input id="r-email" name="email" type="email" autoComplete="email" required className="input" /></div>
        <div><label className="label" htmlFor="r-pass">Password</label><input id="r-pass" name="password" type="password" autoComplete="new-password" minLength={8} required className="input" /></div>
        {reg?.error && <p className="text-sm text-coral-600" role="alert">{reg.error}</p>}
        <Submit>Create account</Submit>
      </form>
    </div>
  );
}
