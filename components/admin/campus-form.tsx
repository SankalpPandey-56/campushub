"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { addCampusAction } from "@/app/(admin)/admin/actions";
import { Icon } from "@/components/icons";

export function AdminCampusForm({
  campuses,
}: {
  campuses: Array<{ id: string; name: string; city: string | null; users: number }>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <h2 className="text-[14px] font-bold">Campuses</h2>
      <p className="mt-0.5 text-[12px] text-white/45">Students pick their campus during verification.</p>

      {campuses.length > 0 ? (
        <ul className="mt-3 divide-y divide-white/10 rounded-lg border border-white/10">
          {campuses.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-3.5 py-2.5 text-[13px]">
              <Icon.building size={15} className="text-white/40" />
              <span className="font-medium">{c.name}</span>
              {c.city ? <span className="text-white/40">· {c.city}</span> : null}
              <span className="ml-auto text-[11.5px] text-white/40">{c.users} members</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[12.5px] text-white/45">No campuses yet — add the first one below.</p>
      )}

      <form
        action={(fd) => startTransition(() => addCampusAction(fd).then((r) => {
          if (r.ok) {
            toast.success("Campus added");
            router.refresh();
          } else toast.error(r.error ?? "Could not add campus");
        }))}
        className="mt-3 flex flex-wrap gap-2"
      >
        <input
          name="name"
          required
          placeholder="Campus name"
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-[13px] text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
        />
        <input
          name="city"
          placeholder="City (optional)"
          className="w-40 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-[13px] text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
        />
        <button disabled={pending} className="rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#141a17] disabled:opacity-50">
          Add campus
        </button>
      </form>
    </div>
  );
}
