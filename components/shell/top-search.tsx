"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";

export function TopSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
      }}
      className="relative"
      role="search"
    >
      <Icon.search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-ink-faint)]" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search your campus…"
        className="w-full rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-card)] py-[7px] pl-9 pr-3 text-[13.5px] placeholder:text-[color:var(--color-ink-faint)] focus:border-[color:var(--color-pine)] focus:outline-none"
      />
    </form>
  );
}
