import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guard";
import { type IconName } from "@/components/icons";
import { AdminSignOut } from "@/components/admin/admin-signout";
import { AdminNavLink } from "@/components/admin/admin-nav-link";

const NAV: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/admin", label: "Overview", icon: "home" },
  { href: "/admin/verifications", label: "Verification Requests", icon: "shield" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/posts", label: "Posts", icon: "file" },
  { href: "/admin/deals", label: "Deals", icon: "tag" },
  { href: "/admin/events", label: "Events", icon: "calendar" },
  { href: "/admin/resources", label: "Resources", icon: "book" },
  { href: "/admin/marketplace", label: "Marketplace", icon: "box" },
  { href: "/admin/reports", label: "Reports", icon: "flag" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
  { href: "/admin/dev", label: "Developer", icon: "sparkles" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireAdmin(); // hard server-side gate, 404 for non-admins

  return (
    <div className="min-h-dvh bg-[#141a17] text-[#e8ece9]">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        {/* Admin sidebar — its own identity: dark, dense, no pine-green branding */}
        <aside className="border-b border-white/10 lg:min-h-dvh lg:w-[236px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="sticky top-0 px-5 py-5">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="rounded-md">
                <span className="font-display text-[17px] font-bold tracking-tight">
                  CampusHub <span className="text-[#8fb3a5]">Admin</span>
                </span>
              </Link>
              <Link href="/feed" className="rounded-md text-[12px] text-white/50 hover:text-white lg:hidden">
                Exit
              </Link>
            </div>

            <nav aria-label="Admin" className="mt-6 hidden lg:block">
              <ul className="space-y-0.5">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <AdminNavLink href={item.href} label={item.label} icon={item.icon} />
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 hidden items-center gap-2.5 border-t border-white/10 pt-4 lg:flex">
              <span
                className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-[12px] font-bold"
                aria-hidden
              >
                {viewer.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-semibold">{viewer.name}</span>
                <span className="block text-[11px] text-white/40">{viewer.email}</span>
              </span>
            </div>
            <div className="mt-3 hidden lg:block">
              <AdminSignOut />
            </div>
          </div>
        </aside>

        {/* Mobile admin nav strip */}
        <div className="border-b border-white/10 px-4 py-2 lg:hidden">
          <nav aria-label="Admin sections">
            <ul className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="whitespace-nowrap rounded-full border border-white/15 px-3 py-1.5 text-[12px] font-medium text-white/70"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
