import Link from "next/link";
import type { ReactNode } from "react";
import ScriptText, { plainText } from "@/components/blog/ScriptText";
import type { GattEvent } from "@/lib/api";
import { eventBadge } from "@/lib/event-time";
import { mediaUrl } from "@/lib/media";

// Piezas y estilos que comparten la pagina de un evento, su editor, el
// listado y la landing.

export const EVENT = {
  // Titulos de seccion: oscuros en modo claro, morados en modo oscuro.
  heading: "font-heading text-[24px] leading-tight text-texto dark:text-morado 2xl:text-[28px]",
  // break-words: los textos pegados con espacios que no cortan no se salen.
  body: "font-serif text-[15px] leading-relaxed text-texto/85 break-words [overflow-wrap:anywhere] xl:text-[16px] 2xl:text-[17px]",
  // Titulo sobre la foto de cabecera.
  heroTitle: "font-heading text-[46px] leading-[1.02] text-white sm:text-[68px] lg:text-[88px]",
};

// Los textos pegados (Figma, Word) traen espacios que no cortan linea; al
// mostrarlos se cambian por espacios normales para que el texto se acomode.
export function normalSpaces(text: string) {
  return text.replace(/[\u00a0\u2007\u202f]/g, " ");
}

// Foto de cabecera del evento (por defecto el Capitolio), en blanco y negro.
export const DEFAULT_EVENT_IMAGE = "/images/landing/discover-gatt/capitolio.png";

export function eventImage(path: string | null | undefined) {
  return mediaUrl(path) ?? DEFAULT_EVENT_IMAGE;
}

export function HeroBackground({ src }: { src: string }) {
  return (
    // Imagen del bucket de S3 o local: sin optimizar.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover grayscale" />
  );
}

// Titulo sobre la foto: la parte en *cursiva* va en una segunda linea, como
// en "Monthly Networking / mixer".
export function HeroTitle({ text }: { text: string }) {
  return (
    <h1 className={`${EVENT.heroTitle} text-center`}>
      <ScriptText text={text} className="font-script block text-[0.95em] leading-[0.7] sm:-mt-1" />
    </h1>
  );
}

// Fecha en la esquina de una tarjeta: dia y mes.
export function DateBadge({ value, className = "" }: { value: string; className?: string }) {
  const { day, month } = eventBadge(value);
  return (
    <div className={`flex w-12 flex-col items-center rounded-[3px] py-1 text-white ${className}`}>
      <span className="font-serif text-[22px] font-semibold leading-none">{day}</span>
      <span className="font-ui text-[11px] leading-tight">{month}</span>
    </div>
  );
}

// Icono de ubicacion (pin).
export function PinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

// Lugar corto para las tarjetas ("WASHINGTON D.C.", "ONLINE").
export function shortPlace(event: Pick<GattEvent, "venueName" | "location" | "isOnline">) {
  if (event.isOnline) return "Online";
  return event.venueName ?? event.location ?? "";
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

// Tarjeta de un evento (listado y landing): foto, fecha, titulo y lugar.
export function EventCard({ event, badges }: { event: GattEvent; badges?: ReactNode }) {
  // Sin foto (o sin S3 configurado) la tarjeta queda lisa.
  const photo = mediaUrl(event.imageUrl);
  return (
    <Link href={`/events/${event.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-[4px] bg-superficie">
      {photo && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </>
      )}
      <DateBadge value={event.startsAt} className="absolute left-0 top-0 bg-[#6b6b6b] shadow-[0_0_0_5px_var(--color-fondo)]" />
      {badges && <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1.5">{badges}</div>}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-5 pb-4">
        <div className="min-w-0">
          <span className={`block font-heading text-[18px] leading-tight ${photo ? "text-white" : "text-texto"}`}>
            {plainText(event.name)}
          </span>
          <span className={`mt-1 flex items-center gap-1 truncate pl-1 font-ui text-[11px] uppercase tracking-[0.12em] ${photo ? "text-white/85" : "text-texto/85"}`}>
            <PinIcon className="h-3 w-3 shrink-0" />
            {shortPlace(event)}
          </span>
        </div>
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primario text-white transition-transform group-hover:-translate-y-0.5">
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

// Mapa de Google a partir de la direccion (sin API key). Un poco apagado
// para que combine con el sitio.
export function EventMap({ query }: { query: string }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  return (
    <iframe
      title={`Map of ${query}`}
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="h-full w-full border-0 [filter:grayscale(0.35)_contrast(0.95)]"
    />
  );
}

export function mapsLink(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
