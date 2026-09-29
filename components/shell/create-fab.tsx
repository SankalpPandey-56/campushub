"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { CreateSheet } from "@/components/shell/create-button";

export function CreateFab() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-12 items-center gap-2 rounded-full bg-[color:var(--color-pine)] px-5 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(34,107,87,0.6)] transition hover:bg-[color:var(--color-pine-deep)] active:scale-[0.98]"
      >
        <Icon.plus size={17} /> Create
      </button>
      <CreateSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
