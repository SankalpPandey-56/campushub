import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";

export const metadata = { title: "Account suspended" };

export default function SuspendedPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo size="lg" />
      <div className="card-surface mt-8 w-full px-6 py-10">
        <span className="mx-auto mb-4 inline-flex size-11 items-center justify-center rounded-full bg-[color:var(--color-clay-soft)] text-[color:var(--color-clay)]">
          <Icon.shield size={20} />
        </span>
        <h1 className="font-display text-lg font-bold">Account suspended</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
          Your CampusHub access has been suspended by the moderation team. If you believe this is a mistake,
          reply to the decision email or reach out to the admin.
        </p>
      </div>
    </main>
  );
}
