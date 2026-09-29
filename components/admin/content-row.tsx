"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteContentAction } from "@/app/(admin)/admin/actions";
import { Icon } from "@/components/icons";

export function ContentRow({
  targetType,
  targetId,
  label,
  meta,
  author,
  when,
}: {
  targetType: string;
  targetId: string;
  label: string;
  meta: string;
  author: string;
  when: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function remove() {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteContentAction(targetType, targetId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3 bg-white/[0.02] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium">{label}</p>
        <p className="truncate text-[12px] text-white/45">
          {meta} · by {author} · {when}
        </p>
      </div>
      <button
        disabled={pending}
        onClick={remove}
        aria-label={`Delete ${label}`}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-white/35 transition hover:bg-[#c9564a]/15 hover:text-[#e89a8a] disabled:opacity-40"
      >
        <Icon.trash size={15} />
      </button>
    </div>
  );
}
