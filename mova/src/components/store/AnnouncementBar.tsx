import Link from "next/link";
import type { AnnouncementSettings } from "@/lib/defaults";

export function AnnouncementBar({ a }: { a: AnnouncementSettings }) {
  if (!a.enabled || !a.text) return null;
  const inner = <span className="font-medium">{a.text}</span>;
  return (
    <div className="bg-forest px-4 py-2.5 text-center text-[13px] text-cream">
      {a.link ? <Link href={a.link} className="underline-offset-4 hover:underline">{inner}</Link> : inner}
    </div>
  );
}
