// Pinza de papeleria (binder clip) vista de frente: cuerpo negro y dos
// alambres plateados que se juntan arriba. Dibujada en SVG, como el clip.
export default function BinderClip({ className = "" }: { className?: string }) {
  const wire = "M14 40 L16 12 Q17 4 24 4 Q31 4 32 12 L34 40";
  const innerWire = "M18 40 L19.5 16 Q20.5 10 24 10 Q27.5 10 28.5 16 L30 40";
  return (
    <svg viewBox="0 0 48 64" fill="none" className={className} aria-hidden="true">
      {/* Contorno oscuro bajo los alambres para que se lean sobre cualquier fondo. */}
      <path d={wire} stroke="#1a1a1a" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={innerWire} stroke="#1a1a1a" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={wire} stroke="#e4e6ea" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={innerWire} stroke="#e4e6ea" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {/* Cuerpo de la pinza. */}
      <path d="M5 62 L9 38 H39 L43 62 Z" fill="#1d1d1d" />
      <path d="M9 38 H39 L39.6 41.5 H8.4 Z" fill="#3a3a3a" />
      <path d="M7 50 H41" stroke="#2c2c2c" strokeWidth={1} />
    </svg>
  );
}
