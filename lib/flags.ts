import "server-only";
import { db } from "@/lib/db";
import { FLAG_KEYS, FLAG_DEFAULTS, type FlagKey } from "@/lib/flag-constants";

export { FLAG_KEYS, FLAG_DEFAULTS, FLAG_LABELS, type FlagKey } from "@/lib/flag-constants";

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
