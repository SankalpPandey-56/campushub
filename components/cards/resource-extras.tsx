"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { ReportDialog } from "@/components/moderation/report-dialog";

export function ResourceReportButton({ resourceId }: { resourceId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Report resource"
        className="inline-flex size-7 items-center justify-center rounded-md text-[color:var(--color-ink-faint)] hover:bg-[color:var(--color-paper-deep)]"
      >
        <Icon.flag size={13} />
      </button>
      <ReportDialog open={open} onClose={() => setOpen(false)} targetType="RESOURCE" targetId={resourceId} />
    </>
  );
}
