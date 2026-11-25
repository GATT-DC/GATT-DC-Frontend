import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// Piezas y estilos que comparten la vista del blog y su editor, para que lo
// que el admin edita se vea igual a lo que se publica.

export const BLOG = {
  eyebrow: "font-ui text-[15px] text-amarillo text-center sm:text-[17px]",
  title: "text-center font-heading text-[36px] leading-[1.05] text-texto sm:text-[48px] lg:text-[58px]",
  subtitle: "text-center font-heading text-[28px] leading-tight text-texto sm:text-[38px] lg:text-[44px]",
  meta: "font-ui text-[16px] text-amarillo sm:text-[18px]",
  author: "font-script text-[22px] leading-tight text-texto sm:text-[24px]",
  summary: "font-serif text-[18px] leading-relaxed text-texto",
  sectionTitle: "font-heading text-[26px] leading-tight text-amarillo sm:text-[30px]",
  sectionBody: "font-serif text-[16px] leading-relaxed text-texto/85",
  panelistGrid: "grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4",
  // Tarjeta de panelista: la foto ocupa todo y el amarillo es solo el marco;
  // nombre, "Panelist" y LinkedIn van encima de la foto.
  panelistCard: "rounded-[18px] bg-amarillo p-1 text-[#141414] shadow-[0_4px_12px_rgba(0,0,0,0.2)] sm:p-1.5",
  panelistPhoto: "relative aspect-square overflow-hidden rounded-[14px] bg-white",
  panelistShade: "pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-white/90 via-white/50 to-transparent",
  panelistText: "absolute inset-x-3 bottom-2.5 sm:inset-x-4 sm:bottom-3.5",
  panelistName: "font-heading text-[17px] leading-tight text-[#141414] sm:text-[22px]",
  panelistRole: "font-serif text-[13px] text-[#141414]/85 sm:text-[16px]",
  // Los textos van sobre un bloque liso; la cuadricula se ve entre bloques.
  textPanel: "-mx-3 bg-papel-blog px-3 py-5 sm:-mx-5 sm:px-5",
  byLabel: "font-script text-[22px] leading-tight text-texto sm:text-[24px]",
  // Botones de accion del blog (Edit, New post, Publish): amarillos.
  button:
    "inline-flex items-center rounded-full bg-amarillo px-5 py-1.5 font-ui text-[13px] font-medium text-[#141414] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
  buttonOutline:
    "inline-flex items-center rounded-full border border-amarillo px-5 py-1.5 font-ui text-[13px] text-amarillo transition-colors hover:bg-amarillo/10 disabled:cursor-not-allowed disabled:opacity-50",
};

// Hoja cuadriculada sobre la que va el blog: borde recto y una fila de
// puntos por fuera (arriba y a la izquierda), alineados con la cuadricula.
const GRID = 40; // lado de cada cuadro, en px
const BORDER = 3;
const DOT = "radial-gradient(circle, var(--color-borde-blog) 5px, transparent 5.5px)";

export function BlogSheet({ children }: { children: ReactNode }) {
  return (
    // Margen de arriba amplio: los puntos no deben quedar pegados a los
    // botones de encima (Blog Gallery, Edit).
    <div className="relative mx-7 mb-7 mt-14 sm:mx-9 sm:mb-9 sm:mt-16">
      {/* Puntos arriba y abajo (alineados con las lineas verticales) y a los
          lados (con las horizontales); no llegan a las esquinas. */}
      {["-top-7 sm:-top-9", "-bottom-7 sm:-bottom-9"].map((side) => (
        <div
          key={side}
          aria-hidden="true"
          className={`absolute h-3 ${side}`}
          style={{ left: BORDER + GRID / 2, right: GRID / 2, backgroundImage: DOT, backgroundSize: `${GRID}px 12px`, backgroundRepeat: "repeat-x" }}
        />
      ))}
      {["-left-7 sm:-left-9", "-right-7 sm:-right-9"].map((side) => (
        <div
          key={side}
          aria-hidden="true"
          className={`absolute w-3 ${side}`}
          style={{ top: BORDER + GRID / 2, bottom: GRID / 2, backgroundImage: DOT, backgroundSize: `12px ${GRID}px`, backgroundRepeat: "repeat-y" }}
        />
      ))}
      <article
        className="border-borde-blog bg-papel-blog px-5 py-8 sm:px-10 sm:py-12 lg:px-14"
        style={{
          borderWidth: BORDER,
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--color-texto) 8%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-texto) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: `${GRID}px ${GRID}px`,
        }}
      >
        {children}
      </article>
    </div>
  );
}

// Collage de la cabecera: fotos con marco blanco, inclinadas y encimadas,
// como impresas sobre la mesa. Posicion de cada foto segun cuantas hay
// (left, top y width en % del collage; rotacion en grados; ar = proporcion).
type Spot = { l: number; t: number; w: number; r: number; z: number; ar: string };
const COLLAGE: Record<number, Spot[]> = {
  1: [{ l: 18, t: 4, w: 64, r: -2, z: 1, ar: "16/9" }],
  2: [
    { l: 10, t: 8, w: 42, r: -5, z: 1, ar: "4/3" },
    { l: 47, t: 22, w: 42, r: 4, z: 2, ar: "4/3" },
  ],
  3: [
    { l: 6, t: 10, w: 38, r: -6, z: 1, ar: "4/3" },
    { l: 38, t: 30, w: 33, r: 2, z: 3, ar: "4/3" },
    { l: 69, t: 6, w: 22, r: 7, z: 2, ar: "3/4" },
  ],
  4: [
    { l: 5, t: 14, w: 35, r: -6, z: 2, ar: "4/3" },
    { l: 33, t: 34, w: 31, r: 0, z: 3, ar: "4/3" },
    { l: 60, t: 6, w: 17, r: 0, z: 1, ar: "3/4" },
    { l: 76, t: 36, w: 16, r: 8, z: 2, ar: "3/4" },
  ],
  5: [
    { l: 3, t: 14, w: 33, r: -6, z: 2, ar: "4/3" },
    { l: 31, t: 38, w: 30, r: 0, z: 4, ar: "4/3" },
    { l: 40, t: 0, w: 18, r: 4, z: 1, ar: "4/3" },
    { l: 60, t: 6, w: 16, r: -2, z: 2, ar: "3/4" },
    { l: 76, t: 34, w: 16, r: 8, z: 3, ar: "3/4" },
  ],
};

// En celular van en dos columnas, alternando la inclinacion; si son
// impares, la primera ocupa todo el ancho. Desde sm, cada foto toma su lugar
// en el collage. renderPhoto pinta el contenido de cada marco (la imagen, o
// en el editor la imagen con sus botones).
export function HeroCollage({ count, renderPhoto }: { count: number; renderPhoto: (index: number) => ReactNode }) {
  const spots = COLLAGE[Math.min(Math.max(count, 1), 5)];
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5 px-1 sm:relative sm:block sm:aspect-[1000/440] sm:px-0">
      {spots.slice(0, count).map((spot, i) => (
        <div
          key={i}
          style={
            {
              "--l": `${spot.l}%`,
              "--t": `${spot.t}%`,
              "--w": `${spot.w}%`,
              "--r": `${spot.r}deg`,
              "--mr": `${i % 2 === 0 ? -3 : 3}deg`,
              "--z": spot.z,
              "--ar": spot.ar,
            } as CSSProperties
          }
          className={`relative aspect-[4/3] rotate-(--mr) bg-white p-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.3)] transition-transform focus-within:z-20 hover:z-20 sm:absolute sm:left-(--l) sm:top-(--t) sm:z-(--z) sm:aspect-(--ar) sm:w-(--w) sm:rotate-(--r) lg:p-2 ${
            count % 2 === 1 && i === 0 ? "col-span-2" : ""
          }`}
        >
          <div className="relative h-full w-full overflow-hidden">{renderPhoto(i)}</div>
        </div>
      ))}
    </div>
  );
}

// Logo de LinkedIn en cuadro, para ir sobre la foto del panelista.
export function LinkedInBoxIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2.5 7.5V18h3V9.5h-3Zm1.5-4a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Zm4 4V18h3v-4.4c0-1.2.5-2 1.6-2 1 0 1.4.8 1.4 2V18h3v-5.1c0-2.6-1.3-3.6-3.2-3.6-1.4 0-2.3.7-2.8 1.4V9.5h-3Z" />
    </svg>
  );
}

export function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-5.02c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65V21h-4V9.75Z" />
    </svg>
  );
}

// Borde dentado de estampilla en los cuatro lados: circulos transparentes
// a lo largo de cada borde.
const STAMP_MASK = [
  "radial-gradient(circle 4px at 50% 0, #0000 98%, #000) 50% 0 / 12px 51% repeat-x",
  "radial-gradient(circle 4px at 50% 100%, #0000 98%, #000) 50% 100% / 12px 51% repeat-x",
].join(", ");
const STAMP_MASK_SIDES = [
  "radial-gradient(circle 4px at 0 50%, #0000 98%, #000) 0 50% / 51% 12px repeat-y",
  "radial-gradient(circle 4px at 100% 50%, #0000 98%, #000) 100% 50% / 51% 12px repeat-y",
].join(", ");

// Estampilla de un blog en "From the Archive": numero, titulo, subtitulo y
// la portada abajo (en blanco y negro; a color al pasar el mouse). Sin href
// (vista previa del editor) no es un enlace.
export function StampCard({
  number,
  title,
  subtitle,
  draft,
  cover,
  href,
}: {
  number: number;
  title: string;
  subtitle: string | null;
  draft: boolean;
  cover: ReactNode;
  href?: string;
}) {
  const card = (
    // La sombra va por fuera de las mascaras (si no, la recortan); dos capas
    // para perforar los cuatro lados (una mascara por eje).
    <div className="h-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]">
    <div className="h-full" style={{ WebkitMask: STAMP_MASK_SIDES, mask: STAMP_MASK_SIDES }}>
      <article
        className="flex h-full flex-col bg-[#ececec] p-2.5 text-[#141414]"
        style={{ WebkitMask: STAMP_MASK, mask: STAMP_MASK }}
      >
        <div className="flex min-h-[112px] flex-col px-1.5 pb-3 pt-2">
          <div className="flex items-start justify-between gap-2">
            {draft ? (
              <span className="rounded-full bg-[#141414] px-2.5 py-0.5 font-ui text-[10px] uppercase tracking-wide text-white">Draft</span>
            ) : (
              <span />
            )}
            <span className="font-heading text-[18px] leading-none">{String(number).padStart(2, "0")}</span>
          </div>
          <h2 className="font-heading mt-auto pt-3 text-[16px] leading-tight">{title || "Untitled post"}</h2>
          {subtitle && <p className="mt-1 line-clamp-2 font-ui text-[12px] leading-snug text-[#141414]/70">{subtitle}</p>}
        </div>
        <div className="relative aspect-square overflow-hidden grayscale transition-[filter] duration-300 group-hover:grayscale-0">{cover}</div>
      </article>
    </div>
    </div>
  );
  if (!href) return card;
  return (
    <Link href={href} className="group block h-full transition-transform duration-300 hover:-translate-y-1.5">
      {card}
    </Link>
  );
}
