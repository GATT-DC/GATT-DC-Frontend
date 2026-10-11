// Clip metalico dibujado en SVG (placeholder hasta tener el asset final).
export default function Paperclip({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 72"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 20 V54 a6 6 0 0 1 -12 0 V12 a8 8 0 0 1 16 0 V50 a2 2 0 0 1 -4 0 V22"
        stroke="#d4d7dc"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M16 20 V54 a6 6 0 0 1 -12 0 V12 a8 8 0 0 1 16 0 V50 a2 2 0 0 1 -4 0 V22"
        stroke="#7c8089"
        strokeWidth={0.8}
        strokeLinecap="round"
        transform="translate(0.6 0.6)"
        opacity={0.6}
      />
    </svg>
  );
}
