import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/cms";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function AdminLogin({ searchParams }: { searchParams: { next?: string } }) {
  if (await getAdmin()) redirect("/admin");
  const { site } = await getSettings();
  return (
    <main className="grid min-h-screen bg-forest lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-mint/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-coral/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-14">
          <p className="font-display text-2xl font-extrabold text-cream">{site.brandName}</p>
          <p className="font-display text-[clamp(3rem,6vw,5.5rem)] font-extrabold uppercase leading-[0.9] tracking-tighter text-cream">Run the<br />whole store<br /><span className="text-mint">from here.</span></p>
          <p className="text-sm text-cream/60">Products, content, orders and settings — no code required.</p>
        </div>
      </div>
      <div className="grid place-items-center bg-cream p-6">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-extrabold text-forest">Admin sign in</h1>
          <p className="mt-2 text-sm text-sage">Use the admin email and password set during setup.</p>
          <LoginForm next={searchParams.next || "/admin"} />
        </div>
      </div>
    </main>
  );
}
