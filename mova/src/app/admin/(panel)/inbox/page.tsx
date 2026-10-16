import { desc } from "drizzle-orm";
import { db, contactMessages, subscribers } from "@/db";
import { formatDate } from "@/lib/utils";
import { deleteMessage, deleteSubscriber, markMessage } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminShell";

export const metadata = { title: "Inbox" };
export default async function InboxPage() {
  const [msgs, subs] = await Promise.all([
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200),
    db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).limit(1000),
  ]);
  return (
    <>
      <AdminHeader title="Inbox & subscribers" description="Messages from the contact page and newsletter sign-ups." />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="mb-3 font-display text-lg font-bold">Messages ({msgs.length})</h2>
          <ul className="space-y-3">
            {msgs.map((m) => (
              <li key={m.id} className={`a-card ${m.isRead ? "opacity-70" : "border-forest"}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{m.name} {!m.isRead && <span className="badge ml-1 bg-coral text-charcoal">New</span>}</p>
                  <span className="text-xs text-sage">{formatDate(m.createdAt)}</span>
                </div>
                <p className="text-xs text-sage"><a href={`mailto:${m.email}`} className="underline">{m.email}</a>{m.phone && ` · ${m.phone}`}</p>
                <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
                <div className="mt-4 flex gap-2">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`} className="a-btn py-2">Reply</a>
                  <form action={markMessage.bind(null, m.id, !m.isRead)}><button className="a-btn-ghost py-2">{m.isRead ? "Mark unread" : "Mark read"}</button></form>
                  <form action={deleteMessage.bind(null, m.id)}><button className="a-btn-danger py-2">Delete</button></form>
                </div>
              </li>
            ))}
            {!msgs.length && <li className="a-card text-center text-sm text-sage">No messages yet.</li>}
          </ul>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Subscribers ({subs.length})</h2>
            <a href="/api/admin/subscribers" className="text-xs font-semibold text-forest underline">Download CSV</a>
          </div>
          <ul className="a-card divide-y divide-cream-200 p-0 md:p-0">
            {subs.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
                <span className="truncate">{s.email}</span>
                <span className="flex items-center gap-2 text-xs text-sage">{formatDate(s.createdAt)}
                  <form action={deleteSubscriber.bind(null, s.id)}><button className="text-coral-600 hover:underline" aria-label={`Remove ${s.email}`}>Remove</button></form>
                </span>
              </li>
            ))}
            {!subs.length && <li className="p-6 text-center text-sm text-sage">No subscribers yet.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
