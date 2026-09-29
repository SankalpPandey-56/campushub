import { Icon } from "@/components/icons";

export function BackHeader({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <a
        href="javascript:history.back()"
        aria-label="Go back"
        className="inline-flex size-9 items-center justify-center rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-card)] text-[color:var(--color-ink-soft)]"
      >
        <Icon.arrowLeft size={16} />
      </a>
      <h1 className="font-display text-[19px] font-bold tracking-tight">{title}</h1>
    </div>
  );
}
