export const APP_NAME = "CampusHub";
export const APP_TAGLINE = "Your campus, connected.";

// ── Feed ─────────────────────────────────────────────────────────────────────

export const POST_CATEGORIES = [
  { key: "CAMPUS", label: "Campus", hint: "Notices, rants, wins — everything in between" },
  { key: "DEALS", label: "Deals", hint: "Offers worth sharing" },
  { key: "EVENTS", label: "Events", hint: "What's happening around campus" },
  { key: "RESOURCES", label: "Resources", hint: "Notes, guides, useful links" },
  { key: "MARKETPLACE", label: "Marketplace", hint: "Buy & sell within campus" },
  { key: "LOST_FOUND", label: "Lost & Found", hint: "Lost something? Found something?" },
] as const;

export type PostCategoryKey = (typeof POST_CATEGORIES)[number]["key"];

export const POST_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  POST_CATEGORIES.map((c) => [c.key, c.label]),
);

// ── Deals ────────────────────────────────────────────────────────────────────

export const DEAL_CATEGORIES = [
  { key: "FOOD", label: "Food" },
  { key: "FASHION", label: "Fashion" },
  { key: "ELECTRONICS", label: "Electronics" },
  { key: "ENTERTAINMENT", label: "Entertainment" },
  { key: "SERVICES", label: "Services" },
  { key: "STUDENT_DEALS", label: "Student deals" },
  { key: "OTHER", label: "Other" },
] as const;

export const DEAL_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  DEAL_CATEGORIES.map((c) => [c.key, c.label]),
);

// ── Events ───────────────────────────────────────────────────────────────────

export const EVENT_CATEGORIES = [
  { key: "TECH", label: "Tech" },
  { key: "CULTURAL", label: "Cultural" },
  { key: "SPORTS", label: "Sports" },
  { key: "ACADEMIC", label: "Academic" },
  { key: "WORKSHOP", label: "Workshop" },
  { key: "SOCIAL", label: "Social" },
  { key: "OTHER", label: "Other" },
] as const;

export const EVENT_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  EVENT_CATEGORIES.map((c) => [c.key, c.label]),
);

// ── Marketplace ──────────────────────────────────────────────────────────────

export const LISTING_CATEGORIES = [
  { key: "BOOKS", label: "Books" },
  { key: "ELECTRONICS", label: "Electronics" },
  { key: "FURNITURE", label: "Furniture" },
  { key: "ACCESSORIES", label: "Accessories" },
  { key: "OTHER", label: "Other" },
] as const;

export const LISTING_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  LISTING_CATEGORIES.map((c) => [c.key, c.label]),
);

export const LISTING_CONDITIONS = [
  { key: "NEW", label: "Brand new" },
  { key: "LIKE_NEW", label: "Like new" },
  { key: "GOOD", label: "Good" },
  { key: "FAIR", label: "Fair" },
] as const;

export const LISTING_CONDITION_LABEL: Record<string, string> = Object.fromEntries(
  LISTING_CONDITIONS.map((c) => [c.key, c.label]),
);

// ── Reports ──────────────────────────────────────────────────────────────────

export const REPORT_REASONS = [
  "Spam",
  "Misleading information",
  "Inappropriate content",
  "Scam",
  "Harassment",
  "Other",
] as const;

// ── Navigation ───────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { href: "/feed", label: "Home", icon: "home" },
  { href: "/explore", label: "Explore", icon: "compass" },
  { href: "/events", label: "Events", icon: "calendar" },
  { href: "/groups", label: "Groups", icon: "users" },
  { href: "/profile", label: "Profile", icon: "user" },
] as const;

export const CREATE_MENU = [
  { href: "/deals/new", label: "Share a deal", desc: "Spotted an offer nearby" },
  { href: "/events/new", label: "Post an event", desc: "Club fest, workshop, meetup" },
  { href: "/resources/new", label: "Add a resource", desc: "Notes, guides, links" },
  { href: "/marketplace/new", label: "List an item", desc: "Sell what you don't need" },
  { href: "/lost-found/new", label: "Lost & found", desc: "Report a lost or found item" },
  { href: "/groups/new", label: "Start a group", desc: "Find your study circle" },
] as const;

// ── Chip tints (subtle backgrounds per category) ─────────────────────────────

export const CATEGORY_TINT: Record<string, { bg: string; text: string }> = {
  CAMPUS: { bg: "#ecefe4", text: "#4a5d3a" },
  DEALS: { bg: "#faf0dd", text: "#8a5a13" },
  EVENTS: { bg: "#e7ecf2", text: "#3d5673" },
  RESOURCES: { bg: "#e3efe9", text: "#1e5c48" },
  MARKETPLACE: { bg: "#efe7f2", text: "#5d4470" },
  LOST_FOUND: { bg: "#f7e8e1", text: "#8f4a2c" },
  FOOD: { bg: "#faf0dd", text: "#8a5a13" },
  TECH: { bg: "#e7ecf2", text: "#3d5673" },
  CULTURAL: { bg: "#f7e8e1", text: "#8f4a2c" },
};
