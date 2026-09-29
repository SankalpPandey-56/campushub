"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Toast = { id: number; kind: "success" | "error"; text: string };

let push: ((t: Omit<Toast, "id">) => void) | null = null;
let seq = 0;

/** Tiny sonner-free toaster. Exposed via toast.success / toast.error. */
export const toast = {
  success: (text: string) => push?.({ kind: "success", text }),
  error: (text: string) => push?.({ kind: "error", text }),
};

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    push = (t) => {
      const id = ++seq;
      setItems((prev) => [...prev.slice(-2), { ...t, id }]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 3200);
    };
    return () => {
      push = null;
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-8"
    >
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className={`pointer-events-auto rounded-xl border px-4 py-2.5 text-[13px] font-medium shadow-[0_12px_32px_-12px_rgba(31,42,36,0.35)] ${
              t.kind === "success"
                ? "border-[#bfdccf] bg-[#eaf4ef] text-[color:var(--color-pine-deep)]"
                : "border-[#ecc8c0] bg-[#faeeea] text-[color:var(--color-danger)]"
            }`}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
