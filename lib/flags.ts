import "server-only";
import { db } from "@/lib/db";

/**
 * Platform feature flags, stored in the database so the admin can toggle
 * features without a redeploy. Reads are cheap and uncached — these are
 * single-row lookups on a primary key.
 *
 * Flags:
 *  - signups        → new users can start the join flow (login + verify)
 *  - marketplace    → marketplace listings visible/creatable
 *  - public_landing → guests see the marketing landing page
 */
export const FLAG_KEYS = ["signups", "marketplace", "public_landing"] as const;
export type FlagKey = (typeof FLAG_KEYS)[number];

export const FLAG_DEFAULTS: Record<FlagKey, boolean> = {
  signups: true,
  marketplace: true,
  public_landing: true,
};

export const FLAG_LABELS: Record<FlagKey, { title: string; description: string }> = {
  signups: {
    title: "New signups",
    description: "Allow new students to start the join flow. Existing members are unaffected.",
  },
  marketplace: {
    title: "Marketplace",
    description: "Show the marketplace section and allow new listings.",
  },
  public_landing: {
    title: "Public landing page",
    description: "Guests see the marketing page; off means they land directly on sign-in.",
  },
};

export async function getFlags(): Promise<Record<FlagKey, boolean>> {
  const rows = await db.featureFlag.findMany({ where: { key: { in: [...FLAG_KEYS] } } });
  const flags = { ...FLAG_DEFAULTS };
  for (const row of rows) {
    if (row.key in flags) flags[row.key as FlagKey] = row.enabled;
  }
  return flags;
}

export async function isFlagged(key: FlagKey): Promise<boolean> {
  const row = await db.featureFlag.findUnique({ where: { key } });
  return row ? row.enabled : FLAG_DEFAULTS[key];
}

export async function setFlag(key: FlagKey, enabled: boolean) {
  await db.featureFlag.upsert({
    where: { key },
    update: { enabled },
    create: { key, enabled },
  });
}
