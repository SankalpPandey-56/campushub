import Link from "next/link";
import { requireMember } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { SideNav } from "@/components/shell/side-nav";
import { MobileNav } from "@/components/shell/mobile-nav";
import { TopSearch } from "@/components/shell/top-search";
import { CreateFab } from "@/components/shell/create-fab";
import { Toaster } from "@/components/ui/toaster";
import { NAV_ITEMS } from "@/lib/constants";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const viewer = await requireMember();

  const [unreadNotifications, unreadMessages] = await Promise.all([
    db.notification.count({ where: { userId: viewer.id, readAt: null } }),
    db.conversationMember.count({ where: { userId: viewer.id, lastReadAt: null } }),
  ]);

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-[color:var(--color-line)] bg-[color:var(--color-card)] px-4 py-5 lg:flex">
        <div className="px-2">
          <LogoLink />
        </div>
        <SideNav
          items={NAV_ITEMS}
          counts={{ "/notifications": unreadNotifications, "/messages": unreadMessages }}
          viewer={{ name: viewer.name, image: viewer.image, course: viewer.course }}
        />
      </aside>

      {/* Main column */}
      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-20 border-b border-[color:var(--color-line)] bg-[color:var(--color-paper)]/90 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
            <div className="lg:hidden">
              <MobileLogoLink />
            </div>
            <div className="hidden flex-1 lg:block">
              <TopSearch />
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--color-ink-soft)] transition hover:bg-[color:var(--color-paper-deep)]"
              >
                <Icon.bell size={19} />
                {unreadNotifications > 0 ? <Dot /> : null}
              </Link>
              <Link
                href="/messages"
                aria-label="Messages"
                className="relative inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--color-ink-soft)] transition hover:bg-[color:var(--color-paper-deep)]"
              >
                <Icon.message size={19} />
                {unreadMessages > 0 ? <Dot /> : null}
              </Link>
              <Link href="/profile" className="ml-1 rounded-full" aria-label="Your profile">
                <Avatar name={viewer.name} image={viewer.image} size={30} />
              </Link>
            </div>
          </div>
          <div className="border-t border-[color:var(--color-line)] px-4 pb-3 pt-2 lg:hidden">
            <TopSearch />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 sm:px-6 lg:pb-14">{children}</main>
      </div>

      <MobileNav />
      <div className="hidden lg:block">
        <CreateFab />
      </div>
      <Toaster />
    </div>
  );
}

function Dot() {
  return <span className="absolute right-1.5 top-1.5 size-2 rounded-[3px] bg-[color:var(--color-marigold)]" aria-hidden />;
}

function LogoLink() {
  return (
    <Link href="/feed" aria-label="CampusHub home" className="rounded-md">
      <Logo />
    </Link>
  );
}

function MobileLogoLink() {
  return (
    <Link href="/feed" aria-label="CampusHub home" className="rounded-md">
      <Logo size="sm" />
    </Link>
  );
}
