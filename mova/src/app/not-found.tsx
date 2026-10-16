import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-6 text-center">
      <div>
        <p className="font-display text-[clamp(6rem,20vw,14rem)] font-extrabold leading-none tracking-tighter text-mint">404</p>
        <h1 className="-mt-4 text-display-md uppercase">This page wandered off.</h1>
        <p className="mx-auto mt-4 max-w-md text-sage">It might have been moved or renamed. Let&apos;s get you somewhere softer.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Back to home</Link>
          <Link href="/collection" className="btn-ghost">Browse products</Link>
        </div>
      </div>
    </main>
  );
}
