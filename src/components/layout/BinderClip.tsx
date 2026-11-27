// Pinza de papeleria (binder clip) vista de frente: cuerpo de color y dos
// alambres plateados que se juntan arriba. Dibujada en SVG, como el clip.
export default function BinderClip({
  className = "",
  color = "#1d1d1d",
}: {
  className?: string;
  // Color del cuerpo de la pinza (negro por defecto).
  color?: string;
}) {
  const wire = "M14 40 L16 12 Q17 4 24 4 Q31 4 32 12 L34 40";
  const innerWire = "M18 40 L19.5 16 Q20.5 10 24 10 Q27.5 10 28.5 16 L30 40";
  return (
    <svg viewBox="0 0 48 64" fill="none" className={className} aria-hidden="true">
      {/* Contorno oscuro bajo los alambres para que se lean sobre cualquier fondo. */}
      <path d={wire} stroke="#1a1a1a" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={innerWire} stroke="#1a1a1a" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={wire} stroke="#e4e6ea" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={innerWire} stroke="#e4e6ea" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {/* Cuerpo de la pinza, con el borde de arriba mas claro y una sombra
          al medio que le dan volumen sobre cualquier color. */}
      <path d="M5 62 L9 38 H39 L43 62 Z" fill={color} />
      <path d="M9 38 H39 L39.6 41.5 H8.4 Z" fill="#ffffff" fillOpacity={0.18} />
      <path d="M7 50 H41" stroke="#000000" strokeOpacity={0.2} strokeWidth={1} />
    </svg>
  );
}
