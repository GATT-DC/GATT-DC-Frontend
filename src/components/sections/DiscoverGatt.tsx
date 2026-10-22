"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import FolderTab from "@/components/layout/FolderTab";
import Paperclip from "@/components/layout/Paperclip";
import PaperTexture from "@/components/layout/PaperTexture";
import PhotoPlaceholder from "@/components/layout/PhotoPlaceholder";
import AboutUsOverlay from "@/components/sections/AboutUsOverlay";
import WhatWeDoOverlay, {
  type BackFolderOrigin,
} from "@/components/sections/WhatWeDoOverlay";
import {
  SHEET_BACKGROUND,
  type FolderOrigin,
} from "@/components/sections/AboutUsOverlay";

type BackFolder = {
  id: string;
  lead: string;
  accent: string;
  trail?: string;
  color: string;
  shade: string;
  offset: string;
};

// Carpetas de atras: pestaña oscura con la etiqueta en su color de la paleta.
// El orden es de atras hacia adelante. Solo "What We do" tiene contenido por
// ahora; las demas son visuales.
const BACK_FOLDERS: BackFolder[] = [
  { id: "community", lead: "Our", accent: "community", color: "var(--color-rojo)", shade: "#1f1f1f", offset: "0%" },
  { id: "board", lead: "The", accent: "gatt", trail: "Board", color: "var(--color-naranja)", shade: "#232323", offset: "10%" },
  { id: "mission", lead: "Our", accent: "mission", color: "var(--color-verde)", shade: "#272727", offset: "0%" },
  { id: "what-we-do", lead: "What We", accent: "do", color: "var(--color-amarillo)", shade: "#2b2b2b", offset: "14%" },
];

function TabLabel({
  lead,
  accent,
  trail,
  color,
}: {
  lead: string;
  accent: string;
  trail?: string;
  color: string;
}) {
  return (
    <span className="font-heading text-[18px] lg:text-[22px]" style={{ color }}>
      {lead}{" "}
      <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
        {accent}
      </span>
      {trail && <> {trail}</>}
    </span>
  );
}

export default function DiscoverGatt() {
  const [openFolder, setOpenFolder] = useState<"about" | "what-we-do" | null>(
    null,
  );
  const open = openFolder === "about";
  const whatWeDoOpen = openFolder === "what-we-do";
  const openerRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const whatWeDoTabRef = useRef<HTMLButtonElement>(null);
  const whatWeDoBodyRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpenFolder(null), []);
  const origin = useMemo<FolderOrigin>(
    () => ({ body: bodyRef, sheet: sheetRef, tab: openerRef, photo: photoRef }),
    [],
  );
  const whatWeDoOrigin = useMemo<BackFolderOrigin>(
    () => ({
      body: whatWeDoBodyRef,
      tab: whatWeDoTabRef,
      coveredBy: bodyRef,
      coveredByTab: openerRef,
    }),
    [],
  );

  return (
    <section id="discover-gatt" className="relative bg-fondo py-24 lg:py-32">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
        <h2 className="font-heading px-6 text-[48px] font-normal leading-none text-white lg:flex lg:w-[13%] lg:shrink-0 lg:justify-center lg:px-0 lg:text-[72px]">
          <span className="lg:rotate-180 lg:[writing-mode:vertical-rl]">
            Discover{" "}
            <span className="font-script inline-block px-1 text-[1.3em] leading-normal">
              gatt
            </span>
          </span>
        </h2>

        {/* Stack de carpetas: cada una se superpone a la anterior y deja ver
            su pestaña. --step es la separacion entre carpetas y --front el
            alto del cuerpo de la carpeta del frente. */}
        <div
          className="relative w-full lg:w-auto lg:flex-1 [--front:360px] [--step:64px] lg:[--front:290px] lg:[--step:88px]"
          style={{ height: "calc(var(--step) * 4 + 2.5rem + var(--front))" }}
        >
          {BACK_FOLDERS.map((folder, i) => {
            const isWhatWeDo = folder.id === "what-we-do";
            const tab = (
              <FolderTab fill={folder.shade}>
                <TabLabel {...folder} />
              </FolderTab>
            );
            return (
              <div
                key={folder.id}
                aria-hidden={isWhatWeDo ? undefined : true}
                className="absolute inset-x-0 bottom-0 flex flex-col"
                style={{
                  top: `calc(var(--step) * ${i})`,
                  zIndex: i,
                  // Mientras esta abierta, la vista abierta toma su lugar.
                  visibility: isWhatWeDo && whatWeDoOpen ? "hidden" : undefined,
                }}
              >
                <div style={{ paddingLeft: folder.offset }}>
                  {isWhatWeDo ? (
                    <button
                      ref={whatWeDoTabRef}
                      type="button"
                      onClick={() => setOpenFolder("what-we-do")}
                      aria-haspopup="dialog"
                      aria-expanded={whatWeDoOpen}
                      className="block transition-[filter] duration-300 hover:brightness-125 focus-visible:brightness-125"
                    >
                      {tab}
                    </button>
                  ) : (
                    tab
                  )}
                </div>
                <div
                  ref={isWhatWeDo ? whatWeDoBodyRef : undefined}
                  className="flex-1 rounded-tl-lg"
                  style={{ backgroundColor: folder.shade }}
                />
              </div>
            );
          })}

          {/* Carpeta del frente: About us. Mientras esta abierta se oculta: la
              vista abierta toma su lugar con copias en la misma posicion. */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex flex-col"
            style={{
              top: "calc(var(--step) * 4)",
              visibility: open ? "hidden" : undefined,
            }}
          >
            <div className="pl-[1%]">
              <button
                ref={openerRef}
                type="button"
                onClick={() => setOpenFolder("about")}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="block transition-[filter] duration-300 hover:brightness-110 focus-visible:brightness-110"
              >
                <FolderTab fill="var(--color-azul)">
                  <TabLabel lead="About" accent="us" color="#ffffff" />
                </FolderTab>
              </button>
            </div>

            <div
              ref={bodyRef}
              className="relative flex-1 rounded-b-md rounded-tr-md bg-azul"
            >
              {/* Foto metida en la carpeta: queda detras de la hoja. */}
              <div
                ref={photoRef}
                className={`absolute left-[52%] top-[-120px] w-[17%] min-w-[140px] shadow-lg transition-[opacity,translate,rotate] lg:left-[42%] ${
                  whatWeDoOpen
                    ? "translate-y-[150px] -rotate-12 opacity-0 duration-400 ease-in"
                    : "-rotate-12 opacity-100 duration-600 ease-out"
                }`}
              >
                <PhotoPlaceholder
                  label="Foto: Capitolio de EE. UU."
                  className="aspect-[7/5] w-full"
                />
              </div>

              <div
                ref={sheetRef}
                className="absolute inset-x-0 bottom-0 top-3 z-10 overflow-hidden rounded-b-md"
                style={{ background: SHEET_BACKGROUND }}
              >
                <PaperTexture />
                <div className="relative flex h-full flex-col justify-center px-6 pb-10 sm:px-10 lg:pl-[24%] lg:pr-10">
                  <p className="max-w-[560px] font-serif text-[17px] font-light leading-[1.3] text-white lg:text-[19px]">
                    GATT DC is a non-profit, non-partisan organization designed
                    to facilitate education, networking, and professional
                    development among lesbian, gay, bisexual, transgender, and
                    queer (LGBTQ+) professionals and allies in international
                    trade.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenFolder("about")}
                  className="absolute bottom-4 right-6 flex items-center gap-1.5 font-ui text-[15px] text-white/90 transition-colors hover:text-white"
                >
                  Learn More
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>

              {/* La foto y el clip sobresalen de la carpeta: al abrir What We do la
                  foto se guarda dentro (baja detras de la hoja) para no quedar
                  encima, y al cerrarla vuelve a salir y el clip se engancha. */}
              <Paperclip
                className={`absolute left-[calc(52%+100px)] top-[-34px] z-20 h-24 w-8 rotate-6 transition-[opacity,translate] lg:left-[calc(42%+min(12%,180px))] ${
                  whatWeDoOpen
                    ? "translate-y-6 opacity-0 duration-200 ease-in"
                    : "opacity-100 delay-350 duration-300 ease-out"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <AboutUsOverlay open={open} onClose={close} origin={origin} />
      <WhatWeDoOverlay
        open={whatWeDoOpen}
        onClose={close}
        origin={whatWeDoOrigin}
      />
    </section>
  );
}
