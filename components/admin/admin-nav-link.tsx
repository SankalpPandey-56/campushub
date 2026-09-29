"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/lib/utils";

export function AdminNavLink({ href, label, icon }: { href: string; label: string; icon: IconName }) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  const Ico = Icon[icon];

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition",
        active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white/85",
      )}
    >
      <Ico size={16} />
      {label}
    </Link>
  );
}
