"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { CreateButton } from "@/components/shell/create-button";
import { isActive } from "@/components/shell/side-nav";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PRIMARY = NAV_ITEMS.filter((n) => n.href !== "/groups");

export function MobileNav() {
  const pathname = usePathname();
  // Insert the create button in the middle slot.
  const left = PRIMARY.slice(0, 2);
  const right = PRIMARY.slice(2);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--color-line)] bg-[color:var(--color-card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
    >
      <div className="grid grid-cols-5">
        {left.map((item) => (
          <MobileTab key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
        <div className="flex items-end justify-center pb-1">
          <CreateButton variant="fab" />
        </div>
        {right.map((item) => (
          <MobileTab key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </div>
    </nav>
  );
}

function MobileTab({ item, active }: { item: { href: string; label: string; icon: string }; active: boolean }) {
  const Ico = Icon[item.icon as IconName] ?? Icon.compass;
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-medium transition-colors",
        active ? "text-[color:var(--color-pine-deep)]" : "text-[color:var(--color-ink-faint)]",
      )}
    >
      <Ico size={21} />
      {item.label}
      {active ? (
        <motion.span
          layoutId="mobile-tab"
          className="absolute -top-px h-0.5 w-8 rounded-full bg-[color:var(--color-pine)]"
        />
      ) : null}
    </Link>
  );
}
