import type { SVGProps } from "react";

/**
 * A small, consistent stroke icon set. 24×24 grid, 1.75 stroke,
 * round joins — quiet enough to sit next to text.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const Icon = {
  home: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5.5h4V20" />
    </Base>
  ),
  compass: (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </Base>
  ),
  calendar: (p: IconProps) => (
    <Base {...p}>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M4 10.5h16" />
    </Base>
  ),
  users: (p: IconProps) => (
    <Base {...p}>
      <circle cx="9" cy="8.5" r="3.25" />
      <path d="M3.5 19.5c.7-3.2 3-5 5.5-5s4.8 1.8 5.5 5" />
      <path d="M15.5 5.8a3.1 3.1 0 0 1 0 5.5M17.5 14.9c1.7.7 2.8 2.3 3.2 4.6" />
    </Base>
  ),
  user: (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="8.25" r="3.5" />
      <path d="M5.5 19.5c1-3.6 3.6-5.5 6.5-5.5s5.5 1.9 6.5 5.5" />
    </Base>
  ),
  plus: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 5.5v13M5.5 12h13" />
    </Base>
  ),
  search: (p: IconProps) => (
    <Base {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </Base>
  ),
  heart: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 19.5s-7-4.3-7-9A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5c0 4.7-7 9-7 9Z" />
    </Base>
  ),
  heartFilled: (p: IconProps) => (
    <Base {...p}>
      <path
        d="M12 19.5s-7-4.3-7-9A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5c0 4.7-7 9-7 9Z"
        fill="currentColor"
      />
    </Base>
  ),
  bookmark: (p: IconProps) => (
    <Base {...p}>
      <path d="M7 4.5h10V20l-5-3-5 3V4.5Z" />
    </Base>
  ),
  bookmarkFilled: (p: IconProps) => (
    <Base {...p}>
      <path d="M7 4.5h10V20l-5-3-5 3V4.5Z" fill="currentColor" />
    </Base>
  ),
  comment: (p: IconProps) => (
    <Base {...p}>
      <path d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7A2.25 2.25 0 0 1 17.25 16H9l-4.5 3.5v-12.75Z" />
    </Base>
  ),
  flag: (p: IconProps) => (
    <Base {...p}>
      <path d="M6 21V4" />
      <path d="M6 5c4-2 8 2 12 0v8c-4 2-8-2-12 0" />
    </Base>
  ),
  share: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 3.5v11" />
      <path d="m8 7 4-3.5L16 7" />
      <path d="M6 11.5v7.5A1.5 1.5 0 0 0 7.5 20.5h9A1.5 1.5 0 0 0 18 19v-7.5" />
    </Base>
  ),
  tag: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 4h7l9 9-7 7-9-9V4Z" />
      <circle cx="8.5" cy="8.5" r="1.4" />
    </Base>
  ),
  pin: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.5 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.25" />
    </Base>
  ),
  clock: (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Base>
  ),
  bell: (p: IconProps) => (
    <Base {...p}>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10Z" />
      <path d="M10.25 19a2 2 0 0 0 3.5 0" />
    </Base>
  ),
  message: (p: IconProps) => (
    <Base {...p}>
      <path d="M20 12a8 8 0 1 0-14.7 4.3L4 20l3.9-1.2A8 8 0 0 0 20 12Z" />
      <path d="M8.5 10.5h7M8.5 13.5h4.5" />
    </Base>
  ),
  book: (p: IconProps) => (
    <Base {...p}>
      <path d="M5 4.5h6a2.5 2.5 0 0 1 2.5 2.5v12A2 2 0 0 0 11.5 17H5V4.5Z" />
      <path d="M19 4.5h-5.5A2.5 2.5 0 0 0 11 7v12a2 2 0 0 1 2-2h6V4.5Z" />
    </Base>
  ),
  box: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </Base>
  ),
  shield: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6l-7-2.5Z" />
      <path d="m9.25 11.5 2 2 3.5-4" />
    </Base>
  ),
  settings: (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M18 6l-1.8 1.8M7.8 16.2 6 18" />
    </Base>
  ),
  logout: (p: IconProps) => (
    <Base {...p}>
      <path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" />
      <path d="M10.5 12H20M17 8.5l3.5 3.5-3.5 3.5" />
    </Base>
  ),
  x: (p: IconProps) => (
    <Base {...p}>
      <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
    </Base>
  ),
  check: (p: IconProps) => (
    <Base {...p}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Base>
  ),
  chevronDown: (p: IconProps) => (
    <Base {...p}>
      <path d="m6.5 9.5 5.5 5 5.5-5" />
    </Base>
  ),
  chevronRight: (p: IconProps) => (
    <Base {...p}>
      <path d="m9.5 6.5 5 5.5-5 5.5" />
    </Base>
  ),
  arrowRight: (p: IconProps) => (
    <Base {...p}>
      <path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" />
    </Base>
  ),
  arrowLeft: (p: IconProps) => (
    <Base {...p}>
      <path d="M19.5 12h-15M10 6.5 4.5 12 10 17.5" />
    </Base>
  ),
  image: (p: IconProps) => (
    <Base {...p}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9.25" cy="9.75" r="1.5" />
      <path d="m5 17 4.5-4.5L13 16l2.5-2.5L19 17" />
    </Base>
  ),
  link: (p: IconProps) => (
    <Base {...p}>
      <path d="M9.5 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2" />
      <path d="M14.5 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" />
    </Base>
  ),
  sparkles: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 4.5 13.6 9l4.4 1.6L13.6 12 12 16.5 10.4 12 6 10.6 10.4 9 12 4.5Z" />
      <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </Base>
  ),
  building: (p: IconProps) => (
    <Base {...p}>
      <path d="M5 20V6.5L12 4l7 2.5V20" />
      <path d="M4 20h16" />
      <path d="M9.5 20v-4.5h5V20" />
      <path d="M9 8.5h.01M12 8.5h.01M15 8.5h.01M9 12h.01M12 12h.01M15 12h.01" />
    </Base>
  ),
  camera: (p: IconProps) => (
    <Base {...p}>
      <path d="M4.5 8.5h3l1.5-2h6l1.5 2h3v11h-15v-11Z" />
      <circle cx="12" cy="13.5" r="3.25" />
    </Base>
  ),
  trash: (p: IconProps) => (
    <Base {...p}>
      <path d="M5 7h14M9.5 7V4.5h5V7M7 7l1 13h8l1-13" />
      <path d="M10.5 10.5v6M13.5 10.5v6" />
    </Base>
  ),
  edit: (p: IconProps) => (
    <Base {...p}>
      <path d="M4.5 19.5h4L20 8a2.1 2.1 0 0 0-3-3L5.5 16.5v3Z" />
      <path d="m14.5 6.5 3 3" />
    </Base>
  ),
  dots: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 6h.01M12 12h.01M12 18h.01" strokeWidth={2.4} />
    </Base>
  ),
  file: (p: IconProps) => (
    <Base {...p}>
      <path d="M6.5 3.5h7L18.5 8v12h-12V3.5Z" />
      <path d="M13 3.5V8h5.5" />
    </Base>
  ),
  ticket: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v1a2.5 2.5 0 0 0 0 5v1a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5v-1a2.5 2.5 0 0 0 0-5v-1Z" />
      <path d="M14 6v12" strokeDasharray="2 2.6" />
    </Base>
  ),
};

export type IconName = keyof typeof Icon;
