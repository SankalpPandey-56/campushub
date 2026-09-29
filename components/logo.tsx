import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Wordmark used in headers. The dot is the only flourish — everything
 * else is plain type. On dark surfaces pass variant="light".
 */
export function Logo({
  size = "md",
  variant = "dark",
  className,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  className?: string;
}) {
  const sizes = { sm: "text-base", md: "text-lg", lg: "text-2xl" } as const;
  const base = variant === "light" ? "text-white" : "text-[color:var(--color-ink)]";
  return (
    <span className={cn("font-display inline-flex items-baseline font-bold tracking-tight", sizes[size], base, className)}>
      Campus
      <span className="text-[color:var(--color-pine)]">Hub</span>
      <span className="ml-0.5 inline-block size-1.5 rounded-[2px] bg-[color:var(--color-marigold)]" aria-hidden />
    </span>
  );
}

export function LogoLink({ variant, size }: { variant?: "dark" | "light"; size?: "sm" | "md" | "lg" }) {
  return (
    <Link href="/feed" aria-label="CampusHub home" className="rounded-md">
      <Logo variant={variant} size={size} />
    </Link>
  );
}

export function IconBadge({
  children,
  tone = "pine",
}: {
  children: React.ReactNode;
  tone?: "pine" | "marigold" | "clay" | "plain";
}) {
  const tones = {
    pine: "bg-[color:var(--color-pine-soft)] text-[color:var(--color-pine-deep)]",
    marigold: "bg-[color:var(--color-marigold-soft)] text-[color:var(--color-marigold-deep)]",
    clay: "bg-[color:var(--color-clay-soft)] text-[color:var(--color-clay)]",
    plain: "bg-[color:var(--color-paper-deep)] text-[color:var(--color-ink-soft)]",
  } as const;
  return <span className={cn("inline-flex size-9 items-center justify-center rounded-lg", tones[tone])}>{children}</span>;
}

export { Icon };
