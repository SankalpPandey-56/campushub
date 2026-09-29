"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/icons";
import { CREATE_MENU } from "@/lib/constants";

export function CreateButton({ variant }: { variant?: "fab" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the sheet after navigation completes (e.g. picking a create target
  // in one tab, or navigating with the sheet still open).
  useEffect(() => {
    return () => setOpen(false);
  }, [pathname]);

  if (variant === "fab") {
    return (
      <>
        <button
          aria-label="Create"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex size-12 items-center justify-center rounded-full bg-[color:var(--color-pine)] text-white shadow-[0_6px_16px_-6px_rgba(34,107,87,0.55)] transition active:scale-95"
        >
          <Icon.plus size={22} />
        </button>
        <CreateSheet open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-solid w-full justify-center py-2.5 text-[14px]"
      >
        <Icon.plus size={16} /> Create
      </button>
      <CreateSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function CreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-[#1f2a24]/45" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Create something"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="relative w-full max-w-md rounded-t-2xl border border-[color:var(--color-line)] bg-[color:var(--color-card)] pb-[max(env(safe-area-inset-bottom),12px)] sm:rounded-2xl"
          >
            <div className="flex items-center justify-between px-5 pb-1 pt-4">
              <h2 className="font-display text-[15px] font-bold">Share something</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="inline-flex size-8 items-center justify-center rounded-lg text-[color:var(--color-ink-faint)] hover:bg-[color:var(--color-paper-deep)]"
              >
                <Icon.x size={17} />
              </button>
            </div>
            <ul className="px-2 pb-2 pt-1">
              {CREATE_MENU.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3.5 rounded-xl px-3 py-3 transition hover:bg-[color:var(--color-paper-deep)]"
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[color:var(--color-paper-deep)] text-[color:var(--color-ink-soft)]">
                      <Icon.plus size={16} />
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold">{item.label}</span>
                      <span className="block text-[12.5px] text-[color:var(--color-ink-faint)]">{item.desc}</span>
                    </span>
                    <Icon.chevronRight size={15} className="ml-auto text-[color:var(--color-ink-faint)]" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
