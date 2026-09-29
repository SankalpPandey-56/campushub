/**
 * Flag metadata shared by server and client code. Kept free of server-only
 * imports so client components can render labels/types.
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
