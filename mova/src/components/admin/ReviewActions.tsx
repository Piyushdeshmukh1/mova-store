"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, EyeOff, Trash2 } from "lucide-react";
import { deleteReview, setReviewApproved } from "@/app/admin/actions";

export function ReviewActions({ id, approved }: { id: number; approved: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex shrink-0 gap-2">
      {approved ? (
        <button disabled={pending} onClick={() => start(async () => { await setReviewApproved(id, false); router.refresh(); })} className="a-btn-ghost"><EyeOff className="h-4 w-4" /> Unpublish</button>
      ) : (
        <button disabled={pending} onClick={() => start(async () => { await setReviewApproved(id, true); router.refresh(); })} className="a-btn"><Check className="h-4 w-4" /> Approve</button>
      )}
      <button disabled={pending} onClick={() => { if (confirm("Delete this review?")) start(async () => { await deleteReview(id); router.refresh(); }); }} className="a-btn-danger" aria-label="Delete review"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
