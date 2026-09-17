export function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      className={className}
      width="1.25em"
      height="1.25em"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m19.5 8.25l-7.5 7.5l-7.5-7.5"
      />
    </svg>
  );
}

export function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}

export function SwapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M4.6 2v10M4.6 12l-2.2-2.4M9.4 12V2M9.4 2l2.2 2.4"
        stroke="#5B5EF4"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SelectChevronIcon() {
  return (
    <svg width="9" height="6" viewBox="0 0 9 6" fill="none" className="flex-none">
      <path
        d="M1 1.25L4.5 4.75L8 1.25"
        stroke="#9AA0AC"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
