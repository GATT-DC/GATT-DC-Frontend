import Link from "next/link";
import ScriptText from "@/components/blog/ScriptText";
import { PinIcon, normalSpaces, shortPlace } from "@/components/events/EventParts";
import PhotoPlaceholder from "@/components/layout/PhotoPlaceholder";
import type { GattEvent } from "@/lib/api";
import { eventBadge } from "@/lib/event-time";
import { mediaUrl } from "@/lib/media";

// Solapa de carpeta en el borde superior derecho de la foto.
export const FOLDER_CLIP =
  "polygon(0 22px, 56% 22px, calc(56% + 22px) 0, calc(97% - 22px) 0, 97% 22px, 100% 22px, 100% 100%, 0 100%)";

// Primer parrafo de la descripcion, cortado si es muy largo.
export function excerpt(text: string, max = 240) {
  const first = normalSpaces(text).split(/\n\s*\n/)[0].trim();
  return first.length > max ? `${first.slice(0, max - 3).trimEnd()}…` : first;
}

// Evento destacado (el mas proximo): titulo con la parte en cursiva, lugar,
// el inicio de la descripcion, un boton y su foto con la fecha. Lo usan la
// landing y la carpeta "Coming events".
export default function FeaturedEvent({
  event,
  cta,
  size = "large",
}: {
  event: GattEvent;
  // Texto del boton (p. ej. "Registration" o "Event Details").
  cta: string;
  size?: "large" | "compact";
}) {
  const photo = mediaUrl(event.imageUrl);
  const { day, month } = eventBadge(event.startsAt);
  const large = size === "large";
  return (
    <div className={`grid items-center ${large ? "gap-12 lg:grid-cols-2 lg:gap-16" : "gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-12"}`}>
      <div className="min-w-0">
        <h2 className={`font-heading font-normal leading-none text-texto ${large ? "text-[40px] lg:text-[52px]" : "text-[34px] lg:text-[44px]"}`}>
          <ScriptText text={event.name} className="font-script block pl-1 text-[1.3em] leading-[1.05]" />
        </h2>
        <p className={`flex items-center gap-1.5 pl-1 font-ui uppercase tracking-[0.12em] ${large ? "mt-6 text-[14px] text-verde lg:mt-8" : "mt-4 text-[13px] text-morado"}`}>
          <PinIcon />
          {shortPlace(event)}
        </p>
        <p
          className={`max-w-[480px] break-words font-serif font-light leading-[1.3] text-texto [overflow-wrap:anywhere] ${
            large ? "mt-6 text-[17px] lg:mt-8 lg:text-[19px]" : "mt-4 text-[16px]"
          }`}
        >
          {excerpt(event.description)}
        </p>
        <div className={large ? "mt-10" : "mt-6"}>
          <Link
            href={`/events/${event.slug}`}
            className={`inline-flex items-center gap-2 rounded-full bg-primario text-white transition-colors hover:bg-primario-hover ${
              large ? "px-5 py-2.5 font-ui text-[16px]" : "px-4 py-1.5 font-ui text-[14px]"
            }`}
          >
            {cta}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>

      <Link href={`/events/${event.slug}`} className="relative block aspect-[5/4] w-full overflow-hidden" style={{ clipPath: FOLDER_CLIP }}>
        {photo ? (
          // Foto del bucket de S3: sin optimizar.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-full w-full object-cover grayscale" />
        ) : (
          <PhotoPlaceholder label="Event photo" className="h-full w-full" />
        )}
        <div className="absolute right-[3%] top-[10%] flex w-11 flex-col items-center rounded-[3px] bg-white/35 py-1 text-white backdrop-blur-sm">
          <span className="font-serif text-[22px] font-semibold leading-none">{day}</span>
          <span className="font-ui text-[11px] leading-tight">{month}</span>
        </div>
      </Link>
    </div>
  );
}
