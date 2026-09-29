"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { CreateButton } from "@/components/shell/create-button";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: string };

export function SideNav({
  items,
  counts,
  viewer,
}: {
  items: readonly NavItem[];
  counts: Record<string, number>;
  viewer: { name: string; image: string | null; course: string | null };
}) {
  const pathname = usePathname();

  const secondary = [
    { href: "/deals", label: "Deals", icon: "tag" },
    { href: "/resources", label: "Resources", icon: "book" },
    { href: "/marketplace", label: "Marketplace", icon: "box" },
    { href: "/lost-found", label: "Lost & Found", icon: "pin" },
  ];

  return (
    <nav className="mt-6 flex min-h-0 flex-1 flex-col">
      <CreateButton />

      <ul className="mt-5 space-y-0.5">
        {items.map((item) => (
          <NavItemLink key={item.href} item={item} active={isActive(pathname, item.href)} count={counts[item.href] ?? 0} />
        ))}
      </ul>

      <p className="mb-1 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-ink-faint)]">
        More
      </p>
      <ul className="space-y-0.5">
        {secondary.map((item) => (
          <NavItemLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </ul>

      <div className="mt-auto border-t border-[color:var(--color-line)] pt-3">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-[color:var(--color-paper-deep)]"
        >
          <Avatar name={viewer.name} image={viewer.image} size={30} />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold">{viewer.name}</span>
            <span className="block truncate text-[11.5px] text-[color:var(--color-ink-faint)]">
              {viewer.course ?? "Student"}
            </span>
          </span>
        </Link>
        <form action="/api/auth/signout" method="post">
          <button className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[color:var(--color-ink-soft)] transition hover:bg-[color:var(--color-paper-deep)]">
            <Icon.logout size={16} /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}

function NavItemLink({ item, active, count = 0 }: { item: NavItem; active: boolean; count?: number }) {
  const Ico = Icon[item.icon as IconName] ?? Icon.compass;
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition",
          active
            ? "bg-[color:var(--color-pine-soft)] text-[color:var(--color-pine-deep)]"
            : "text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-deep)]",
        )}
      >
        <Ico size={17} />
        {item.label}
        {count > 0 ? (
          <span className="ml-auto inline-flex min-w-5 justify-center rounded-[5px] bg-[color:var(--color-marigold)] px-1 text-[10.5px] font-bold leading-[16px] text-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

export function isActive(pathname: string, href: string) {
  if (href === "/feed") return pathname === "/feed" || pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
