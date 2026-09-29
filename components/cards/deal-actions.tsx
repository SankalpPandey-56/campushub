"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/ui/toaster";
import { Icon } from "@/components/icons";
import { toggleDealLikeAction, toggleDealSaveAction } from "@/components/cards/deal-actions-server";
import { ReportDialog } from "@/components/moderation/report-dialog";
import type { DealCardData } from "@/components/cards/deal-card";
import { cn } from "@/lib/utils";

export function DealActions({ deal, saved }: { deal: DealCardData; saved?: boolean }) {
  const [liked, setLiked] = useState(deal.liked);
  const [isSaved, setIsSaved] = useState(Boolean(saved));
  const [reportOpen, setReportOpen] = useState(false);
  const [, startTransition] = useTransition();

  function like() {
    setLiked(!liked);
    startTransition(async () => {
      const res = await toggleDealLikeAction(deal.id);
      if (!res.ok) {
        setLiked(liked);
        toast.error(res.error);
      }
    });
  }

  function save() {
    setIsSaved(!isSaved);
    startTransition(async () => {
      const res = await toggleDealSaveAction(deal.id);
      if (!res.ok) {
        setIsSaved(isSaved);
        toast.error(res.error);
      } else {
        toast.success(isSaved ? "Removed from saved" : "Saved — find it under Saved");
      }
    });
  }

  async function share() {
    const url = `${location.origin}/deals`;
    try {
      if (navigator.share) await navigator.share({ title: deal.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* dismissed */
    }
  }

  const base =
    "inline-flex flex-1 items-center justify-center gap-1.5 border-t border-[color:var(--color-line)] py-2.5 text-[12.5px] font-medium text-[color:var(--color-ink-soft)] transition first:border-t-0 hover:bg-[color:var(--color-paper-deep)]";

  return (
    <div className="flex items-stretch border-t border-[color:var(--color-line)] text-[13px]">
      <button onClick={like} aria-pressed={liked} className={cn(base, liked && "text-[color:var(--color-pine-deep)]")}>
        {liked ? <Icon.heartFilled size={15} /> : <Icon.heart size={15} />}
        {deal.likeCount + (liked && !deal.liked ? 1 : 0) - (!liked && deal.liked ? 1 : 0) > 0 ? deal.likeCount : "Like"}
      </button>
      <button onClick={save} aria-pressed={isSaved} className={cn(base, isSaved && "text-[color:var(--color-pine-deep)]")}>
        {isSaved ? <Icon.bookmarkFilled size={15} /> : <Icon.bookmark size={15} />}
        {isSaved ? "Saved" : "Save"}
      </button>
      <button onClick={share} className={base}>
        <Icon.share size={15} /> Share
      </button>
      <button onClick={() => setReportOpen(true)} className={cn(base, "text-[color:var(--color-ink-faint)]")}>
        <Icon.flag size={15} /> <span className="sr-only">Report</span>
      </button>
      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="DEAL" targetId={deal.id} />
    </div>
  );
}
