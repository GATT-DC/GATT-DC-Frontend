// Chinche (alfiler de tablero) dibujada en SVG.
export default function Pushpin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 48" className={className} aria-hidden="true">
      <path d="M21 26 L27 46" stroke="#9aa0a6" strokeWidth={2} strokeLinecap="round" />
      <ellipse cx="17" cy="24" rx="12" ry="5" transform="rotate(-25 17 24)" fill="#e9e2d4" />
      <path d="M11 9 L22 4 L25 19 L14 24 Z" fill="#f4eee2" />
      <ellipse cx="16" cy="7" rx="8" ry="5" transform="rotate(-25 16 7)" fill="#fbf7ef" />
      <ellipse cx="17" cy="24" rx="12" ry="5" transform="rotate(-25 17 24)" fill="none" stroke="#d6cdbb" strokeWidth={1} />
    </svg>
  );
}
