"use client";

import Image from "next/image";
import type { ReactNode, RefObject } from "react";
import FolderTab from "@/components/layout/FolderTab";
import PaperTexture from "@/components/layout/PaperTexture";

// Foto que asoma desde dentro de la carpeta (detras del bolsillo del frente).
export type CardPhoto = { src: string; alt: string };

// Posicion y giro de cada foto en abanico, de izquierda a derecha.
const FAN = [
  "left-[6%] -rotate-[8deg]",
  "left-[34%] z-[1] rotate-[1deg]",
  "left-[61%] rotate-[7deg]",
];

// Carpeta de Discover gatt en celular: en vez del stack, cada carpeta es una
// tarjeta con su pestaña, fotos que asoman del cuerpo y un bolsillo de vidrio
// esmerilado al frente. Al tocarla se abre la misma vista de carpeta del
// desktop, animada desde la tarjeta (de ahi los refs).
export default function DiscoverCard({
  color,
  label,
  title,
  tagline,
  photos = [],
  leadPhoto,
  onOpen,
  isOpen = false,
  tabRef,
  bodyRef,
  sheetRef,
}: {
  color: string;
  label: ReactNode;
  title: ReactNode;
  tagline: string;
  photos?: CardPhoto[];
  // Primera foto propia (About us usa la del Capitolio con su ref).
  leadPhoto?: ReactNode;
  // Sin onOpen la carpeta aun no tiene contenido y no se abre.
  onOpen?: () => void;
  isOpen?: boolean;
  tabRef?: RefObject<HTMLButtonElement | null>;
  bodyRef?: RefObject<HTMLDivElement | null>;
  sheetRef?: RefObject<HTMLDivElement | null>;
}) {
  const tab = (
    <FolderTab fill={color}>
      <span className="text-white">{label}</span>
    </FolderTab>
  );

  return (
    <article
      // Mientras esta abierta, la vista abierta toma su lugar.
      style={{ visibility: isOpen ? "hidden" : undefined }}
    >
      <div className="pl-3">
        {onOpen ? (
          <button
            ref={tabRef}
            type="button"
            onClick={onOpen}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            className="block"
          >
            {tab}
          </button>
        ) : (
          tab
        )}
      </div>

      <div
        ref={bodyRef}
        onClick={onOpen}
        className={`relative -mt-px h-52 rounded-b-2xl rounded-tr-2xl ${onOpen ? "cursor-pointer" : ""}`}
        style={{ backgroundColor: color }}
      >
        <PaperTexture />

        {leadPhoto}
        {photos.map((photo, i) => (
          <div
            key={photo.src}
            className={`absolute top-5 aspect-[4/5] w-[32%] overflow-hidden rounded-lg bg-black/20 shadow-md ${FAN[i + (leadPhoto ? 1 : 0)]}`}
          >
            <Image
              src={`/images/landing/discover-gatt/${photo.src}`}
              alt={photo.alt}
              fill
              sizes="120px"
              className="object-cover grayscale"
            />
          </div>
        ))}

        {/* Bolsillo del frente: vidrio esmerilado que deja intuir las fotos. */}
        <div
          ref={sheetRef}
          className="absolute inset-x-0 bottom-0 z-10 h-[52%] overflow-hidden rounded-b-2xl border-t border-white/30 bg-white/20 backdrop-blur-md"
        >
          <PaperTexture />
          {onOpen && (
            <span
              aria-hidden="true"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md"
              style={{ color }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          )}
        </div>
      </div>

      <h3 className="font-heading mt-4 text-center text-[28px] font-normal leading-none text-texto">
        {title}
      </h3>
      <p className="mt-1.5 text-center font-serif text-[15px] font-light text-texto/60">
        {tagline}
      </p>
    </article>
  );
}
