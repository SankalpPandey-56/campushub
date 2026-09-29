import { requireMember } from "@/lib/auth/guard";
import { AppShell } from "@/components/shell/app-shell";

export default async function FeedLayout({ children }: { children: React.ReactNode }) {
  // Auth + status checks run here; the shell renders once for all community pages.
  await requireMember();
  return <AppShell>{children}</AppShell>;
}
