type P = { className?: string };

function I({ className = "size-5", children }: P & { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {children}
    </svg>
  );
}

export const Icon = {
  Hat: (p: P) => (
    <I {...p}>
      <path d="M6 13.9a4 4 0 0 1 .8-7.9 5 5 0 0 1 9.4 0 4 4 0 0 1 .8 7.9V20H6v-6.1Z" />
      <path d="M6 17h12" />
    </I>
  ),
  Search: (p: P) => (
    <I {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </I>
  ),
  Plus: (p: P) => (
    <I {...p}>
      <path d="M12 5v14M5 12h14" />
    </I>
  ),
  Pencil: (p: P) => (
    <I {...p}>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </I>
  ),
  Trash: (p: P) => (
    <I {...p}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </I>
  ),
  ArrowLeft: (p: P) => (
    <I {...p}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </I>
  ),
  User: (p: P) => (
    <I {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </I>
  ),
  LogOut: (p: P) => (
    <I {...p}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h12" />
    </I>
  ),
  Image: (p: P) => (
    <I {...p}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-9 9" />
    </I>
  ),
  Clock: (p: P) => (
    <I {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </I>
  ),
  X: (p: P) => (
    <I {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </I>
  ),
  Check: (p: P) => (
    <I {...p}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </I>
  ),
  /* cooking methods */
  Baked: (p: P) => (
    <I {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      <rect x="7" y="12" width="10" height="5" rx="1" />
    </I>
  ),
  Boiled: (p: P) => (
    <I {...p}>
      <path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5ZM2 10h2M20 10h2" />
      <path d="M9 3c-1 1 1 2 0 3M13 3c-1 1 1 2 0 3" />
    </I>
  ),
  Fried: (p: P) => (
    <I {...p}>
      <circle cx="10" cy="13" r="7" />
      <path d="m15 8 6-6" />
      <circle cx="10" cy="13" r="2.5" />
    </I>
  ),
};
export type IconName = keyof typeof Icon;
