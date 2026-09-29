const IST = "Asia/Kolkata";

export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d`;
  return formatDate(d);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: IST });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: IST,
  });
}

/** "Sat, 14 Feb · 5:30 PM" style for events */
export function formatEventDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return (
    d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: IST }) +
    " · " +
    d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST })
  );
}

export function formatINR(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return "₹" + amount.toLocaleString("en-IN");
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

export function pluralize(n: number, one: string, many?: string): string {
  return `${n} ${n === 1 ? one : (many ?? one + "s")}`;
}
