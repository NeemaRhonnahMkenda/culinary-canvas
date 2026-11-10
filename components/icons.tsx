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
  Calendar: (p: P) => (
    <I {...p}>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </I>
  ),
  Menu: (p: P) => (
    <I {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </I>
  ),
  Pin: (p: P) => (
    <I {...p}>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </I>
  ),
  Mail: (p: P) => (
    <I {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </I>
  ),
  Phone: (p: P) => (
    <I {...p}>
      <path d="M5 3.5h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.6 6.6l1.4-2.3 4.5 1.8V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5Z" />
    </I>
  ),
  LinkedIn: ({ className = "size-5" }: P) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4V9.5Z" />
    </svg>
  ),
  GitHub: ({ className = "size-5" }: P) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  ),
};
export type IconName = keyof typeof Icon;
