// Recuadro temporal en lugar de una foto que aun no esta en el proyecto.
export default function PhotoPlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center justify-center bg-gradient-to-br from-neutral-500 to-neutral-700 ${className}`}
    >
      <span className="px-2 text-center font-ui text-xs text-white/70">
        {label}
      </span>
    </div>
  );
}
