"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/media";

// Imagen de un blog a partir de su ruta relativa en S3. Si no hay ruta, no
// hay bucket configurado o la imagen no carga, se muestra un marcador.
// onLight: la imagen va sobre un fondo blanco fijo (estampillas, tarjetas
// amarillas), asi que el marcador no sigue el tema.
export default function BlogImage({
  path,
  alt,
  className = "",
  onLight = false,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  onLight?: boolean;
}) {
  const url = mediaUrl(path);
  const [failed, setFailed] = useState<string | null>(null);

  if (!url || url === failed) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} (image not available)` : "Image not available"}
        className={`flex items-center justify-center ${onLight ? "bg-[#141414]/[0.07] text-[#141414]/30" : "bg-texto/[0.08] text-texto/35"} ${className}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-1/3 max-h-12 w-1/3 max-w-12" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="m21 16-5-5-9 9" />
        </svg>
      </div>
    );
  }
  return (
    // Imagenes del bucket de S3: sin optimizar por Next.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} onError={() => setFailed(url)} className={`object-cover ${className}`} />
  );
}
