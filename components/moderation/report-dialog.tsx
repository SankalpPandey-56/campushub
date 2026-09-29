"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { reportAction, type ReportState } from "@/components/moderation/actions";
import { Icon } from "@/components/icons";
import { FieldError, SubmitButton } from "@/components/ui/primitives";
import { REPORT_REASONS } from "@/lib/constants";

export function ReportDialog({
  open,
  onClose,
  targetType,
  targetId,
}: {
  open: boolean;
  onClose: () => void;
  targetType: "POST" | "DEAL" | "EVENT" | "RESOURCE" | "LISTING" | "USER" | "LOST_FOUND";
  targetId: string;
}) {
  const [state, action, pending] = useActionState(wrapAction, {} as ReportState);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-[#1f2a24]/45" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Report content"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="relative w-full max-w-sm rounded-t-2xl border border-[color:var(--color-line)] bg-[color:var(--color-card)] p-5 pb-[max(env(safe-area-inset-bottom),20px)] sm:rounded-2xl"
          >
            {state.ok ? (
              <div className="py-6 text-center">
                <span className="mx-auto mb-3 inline-flex size-10 items-center justify-center rounded-full bg-[color:var(--color-pine-soft)] text-[color:var(--color-pine-deep)]">
                  <Icon.check size={18} />
                </span>
                <p className="text-[14px] font-semibold">Thanks — report received</p>
                <p className="mt-1 text-[12.5px] text-[color:var(--color-ink-soft)]">
                  The moderation team will take a look.
                </p>
                <button onClick={onClose} className="btn-outline mt-5">
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-[15px] font-bold">Report this</h2>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-[color:var(--color-ink-faint)] hover:bg-[color:var(--color-paper-deep)]"
                  >
                    <Icon.x size={16} />
                  </button>
                </div>
                <form action={action} className="mt-3 space-y-3">
                  <input type="hidden" name="targetType" value={targetType} />
                  <input type="hidden" name="targetId" value={targetId} />
                  <fieldset className="space-y-1.5">
                    <legend className="mb-1 text-[13px] font-semibold">Why are you reporting it?</legend>
                    {REPORT_REASONS.map((reason, i) => (
                      <label
                        key={reason}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[color:var(--color-line)] px-3 py-2 text-[13.5px] has-checked:border-[color:var(--color-pine)] has-checked:bg-[color:var(--color-pine-soft)]"
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={reason}
                          defaultChecked={i === 0}
                          className="accent-[color:var(--color-pine)]"
                        />
                        {reason}
                      </label>
                    ))}
                  </fieldset>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-semibold">
                      Details <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
                    </span>
                    <textarea name="details" rows={2} className="input-base resize-y" placeholder="Anything the moderators should know" />
                  </label>
                  <FieldError>{state.error}</FieldError>
                  <SubmitButton pending={pending} pendingLabel="Sending…">
                    Submit report
                  </SubmitButton>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function wrapAction(_prev: ReportState, formData: FormData) {
  return reportAction(_prev, formData).then((r) => ({ ...r, closed: true }));
}
