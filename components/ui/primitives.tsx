import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";

export function Chip({
  children,
  bg,
  color,
  className,
}: {
  children: React.ReactNode;
  bg?: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("chip", className)}
      style={bg && color ? { background: bg, color } : undefined}
    >
      {children}
    </span>
  );
}

export function SectionHeader({
  title,
  action,
  sub,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-[17px] font-bold tracking-tight">{title}</h2>
        {sub ? <p className="mt-0.5 text-[13px] text-[color:var(--color-ink-soft)]">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-14 text-center">
      {icon ? (
        <span className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-[color:var(--color-paper-deep)] text-[color:var(--color-ink-faint)]">
          {icon}
        </span>
      ) : null}
      <p className="font-display text-[15px] font-bold">{title}</p>
      {body ? (
        <p className="mt-1.5 max-w-xs text-[13.5px] leading-relaxed text-[color:var(--color-ink-soft)]">{body}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-[12.5px] font-medium text-[color:var(--color-danger)]" role="alert">
      {children}
    </p>
  );
}

export function FormBanner({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-[13px] font-medium",
        kind === "error"
          ? "border-[#ecc8c0] bg-[#faeeea] text-[color:var(--color-danger)]"
          : "border-[#bfdccf] bg-[#eaf4ef] text-[color:var(--color-pine-deep)]",
      )}
    >
      {kind === "error" ? <Icon.flag size={15} className="mt-0.5 shrink-0" /> : <Icon.check size={15} className="mt-0.5 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
  pendingLabel,
  className,
}: {
  pending: boolean;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  return (
    <button type="submit" disabled={pending} className={cn("btn-solid", pending && "opacity-70", className)}>
      {pending ? (
        <>
          <Spinner />
          {pendingLabel ?? "Working…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Spinner({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" fill="none" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
