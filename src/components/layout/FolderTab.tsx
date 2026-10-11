import type { ReactNode } from "react";

// Pestaña de carpeta: lado izquierdo con curva corta, centro recto y lado
// derecho con pendiente larga. Los extremos son SVG para que las curvas no se
// deformen sin importar el ancho del texto.
export default function FolderTab({
  fill,
  children,
  className = "",
}: {
  fill: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex h-10 w-fit ${className}`}>
      <svg
        viewBox="0 0 16 40"
        preserveAspectRatio="none"
        className="-mr-px h-full w-4 shrink-0"
        aria-hidden="true"
      >
        <path d="M0 40 C8 40 8 0 16 0 V40 Z" fill={fill} />
      </svg>
      <div
        className="flex items-center whitespace-nowrap px-5"
        style={{ backgroundColor: fill }}
      >
        {children}
      </div>
      <svg
        viewBox="0 0 32 40"
        preserveAspectRatio="none"
        className="-ml-px h-full w-8 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M0 0 C8 0 10 4 13 12 L19 28 C22 36 25 40 32 40 H0 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
