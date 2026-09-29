import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
};

const PALETTE = [
  ["#226b57", "#e3efe9"],
  ["#8a5a13", "#faf0dd"],
  ["#3d5673", "#e7ecf2"],
  ["#8f4a2c", "#f7e8e1"],
  ["#5d4470", "#efe7f2"],
  ["#4a5d3a", "#ecefe4"],
] as const;

export function Avatar({ name, image, size = 36, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (image) {
    return (
      <span
        className={cn("relative inline-block shrink-0 overflow-hidden rounded-full", className)}
        style={{ width: size, height: size }}
      >
        <Image src={image} alt={name} fill sizes={`${size}px`} className="object-cover" />
      </span>
    );
  }

  // Deterministic tint per name so avatars feel stable, not random.
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const [fg, bg] = PALETTE[hash % PALETTE.length];

  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none", className)}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: Math.max(10, size * 0.36),
        letterSpacing: "0.02em",
      }}
    >
      {initials || "?"}
    </span>
  );
}
