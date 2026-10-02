export function LogoMark({ className = "logo-mark" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M6 1.5h8.6l6.4 6.4V20a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 20V4A2.5 2.5 0 0 1 6 1.5Z"
        fill="#2f54e8"
      />
      <path d="M14.6 1.5v4.4a2 2 0 0 0 2 2H21" fill="#a9b8f5" />
      <path d="M7.6 13.2h7.6M7.6 17h4.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-word">
        Resume<span>AI</span>
      </span>
    </span>
  );
}
