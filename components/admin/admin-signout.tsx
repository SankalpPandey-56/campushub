"use client";

import { Icon } from "@/components/icons";

export function AdminSignOut() {
  return (
    <form action="/api/auth/signout" method="post">
      <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium text-white/50 transition hover:bg-white/5 hover:text-white/85">
        <Icon.logout size={15} /> Sign out
      </button>
    </form>
  );
}
