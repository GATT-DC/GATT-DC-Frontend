"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import type { FocusEvent, RefObject } from "react";
import FolderTab from "@/components/layout/FolderTab";
import Paperclip from "@/components/layout/Paperclip";
import PaperTexture from "@/components/layout/PaperTexture";
import CapitolPhoto, { CAPITOL_ASPECT } from "@/components/layout/CapitolPhoto";
import AboutUsOverlay from "@/components/sections/AboutUsOverlay";
import type { BackFolderOrigin } from "@/components/layout/BackFolderOverlay";
import BoardOverlay from "@/components/sections/BoardOverlay";
import MissionOverlay from "@/components/sections/MissionOverlay";
import WhatWeDoOverlay from "@/components/sections/WhatWeDoOverlay";
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
  // Inicio del contenido, que se muestra en la carpeta al resaltarla.
  preview?: string;
  // Imagen guardada en la carpeta que asoma por su borde superior al
  // resaltarla.
  peek?: { src: string; width: number; height: number; className: string };
};

// About us cuando se resalta otra carpeta: cuerpo y pestaña oscuros como las
// de atras, y la hoja un poco mas clara.
const ABOUT_DIMMED = "var(--color-carpeta-atenuada)";
const ABOUT_SHEET_DIMMED = "var(--color-hoja-atenuada)";
// Aclarado de la hoja del frente de una carpeta resaltada (el mismo de la hoja
// de About us), para que se vea el borde mas oscuro del fondo.
const SHEET_TINT = "rgb(200 204 216 / 0.25)";

// Carpetas de atras: pestaña oscura con la etiqueta en su color de la paleta.
// El orden es de atras hacia adelante. Todas se abren menos "Our community",
// que aun no tiene contenido.
const BACK_FOLDERS: BackFolder[] = [
  { id: "community", lead: "Our", accent: "community", color: "var(--color-rojo)", shade: "var(--color-carpeta-1)", offset: "0%" },
  { id: "board", lead: "The", accent: "gatt", trail: "Board", color: "var(--color-naranja)", shade: "var(--color-carpeta-2)", offset: "10%" },
  {
    id: "mission", lead: "Our", accent: "mission", color: "var(--color-verde)", shade: "var(--color-carpeta-3)", offset: "0%",
    preview: "To bring together LGBTQ+ professionals and allies in international trade, fostering a community built on meaningful connections, professional development, and the exchange of knowledge.",
    peek: { src: "ourmission.jpeg", width: 613, height: 756, className: "left-[76%] w-[11%] min-w-[100px] -rotate-[4deg] rounded-md" },
  },
  {
    id: "what-we-do", lead: "What We", accent: "do", color: "var(--color-amarillo)", shade: "var(--color-carpeta-4)", offset: "14%",
    preview: "We bring together LGBTQ+ professionals and allies in international trade through conversations, professional connections, and opportunities to learn and grow. Our programs create space to exchange ideas, advance careers, and build lasting relationships across Washington’s trade community.",
    peek: { src: "whoweare.png", width: 1152, height: 3020, className: "left-[76%] w-[12%] min-w-[110px] rotate-[5deg]" },
  },
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
    <span
      className="font-heading text-[18px] transition-colors duration-300 lg:text-[22px]"
      style={{ color }}
    >
      {lead}{" "}
      <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
        {accent}
      </span>
      {trail && <> {trail}</>}
    </span>
  );
}

export default function DiscoverGatt() {
  const [openFolder, setOpenFolder] = useState<
    "about" | "what-we-do" | "board" | "mission" | null
  >(null);
  const open = openFolder === "about";
  const whatWeDoOpen = openFolder === "what-we-do";
  const openerRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const whatWeDoTabRef = useRef<HTMLButtonElement>(null);
  const whatWeDoBodyRef = useRef<HTMLDivElement>(null);
  const boardTabRef = useRef<HTMLButtonElement>(null);
  const boardBodyRef = useRef<HTMLDivElement>(null);
  const missionTabRef = useRef<HTMLButtonElement>(null);
  const missionBodyRef = useRef<HTMLDivElement>(null);
  const bodyRefs: Record<string, RefObject<HTMLDivElement | null>> = {
    "what-we-do": whatWeDoBodyRef,
    board: boardBodyRef,
    mission: missionBodyRef,
  };
  const tabRefs = {
    "what-we-do": whatWeDoTabRef,
    board: boardTabRef,
    mission: missionTabRef,
  };
  // Carpeta bajo el mouse o con foco de teclado: se pinta de su color y About
  // us pasa a oscuro. Mouse y foco se llevan por separado para que perder el
  // foco (p. ej. al hacer clic en otra carpeta) no borre el resaltado del
  // mouse. Mientras hay una carpeta abierta no cambian, para que la animacion
  // de cierre termine sobre el mismo estado.
  const [mouseOver, setMouseOver] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const hovered = mouseOver ?? focused;
  const highlight = (id: string | null) => {
    if (!openFolder) setMouseOver(id);
  };
  // Con foco solo se resalta si viene del teclado (al cerrar una carpeta el
  // foco vuelve a su pestaña y no debe dejarla resaltada).
  const focusHighlight = (e: FocusEvent<HTMLElement>, id: string) => {
    if (!openFolder && e.currentTarget.matches(":focus-visible")) setFocused(id);
  };
  const focusClear = () => {
    if (!openFolder) setFocused(null);
  };
  const aboutDimmed = hovered !== null && hovered !== "about";
  // La foto de About us se guarda en su carpeta cuando otra carpeta esta
  // resaltada o abierta.
  const photoTucked = aboutDimmed || whatWeDoOpen;
  // Al resaltar una carpeta con texto, las de adelante bajan su borde superior
  // (--reveal) para dejar ver el inicio de su contenido.
  const revealIndex = BACK_FOLDERS.findIndex(
    (folder) => folder.id === hovered && folder.preview,
  );
  const shifted = (index: number) => revealIndex !== -1 && index > revealIndex;
  const close = useCallback(() => {
    setOpenFolder(null);
    setMouseOver(null);
    setFocused(null);
  }, []);
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
  const boardOrigin = useMemo<BackFolderOrigin>(
    () => ({
      body: boardBodyRef,
      tab: boardTabRef,
      coveredBy: missionBodyRef,
      coveredByTab: missionTabRef,
    }),
    [],
  );
  const missionOrigin = useMemo<BackFolderOrigin>(
    () => ({
      body: missionBodyRef,
      tab: missionTabRef,
      coveredBy: whatWeDoBodyRef,
      coveredByTab: whatWeDoTabRef,
    }),
    [],
  );

  return (
    <section
      id="discover-gatt"
      className="relative bg-fondo py-24 lg:py-32"
      // Las imagenes que asoman de las carpetas no deben generar scroll
      // horizontal en pantallas angostas.
      style={{ overflowX: "clip" }}
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
        <h2 className="font-heading px-6 text-[48px] font-normal leading-none text-texto lg:flex lg:w-[13%] lg:shrink-0 lg:justify-center lg:px-0 lg:text-[72px]">
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
          className="relative w-full lg:w-auto lg:flex-1 [--front:360px] [--reveal:130px] [--step:64px] lg:[--front:290px] lg:[--reveal:140px] lg:[--step:88px]"
          style={{ height: "calc(var(--step) * 4 + 2.5rem + var(--front))" }}
        >
          {BACK_FOLDERS.map((folder, i) => {
            const openable =
              folder.id === "what-we-do" ||
              folder.id === "board" ||
              folder.id === "mission"
                ? folder.id
                : null;
            const isOpen = openable !== null && openFolder === openable;
            const lit = hovered === folder.id;
            const tab = (
              <FolderTab fill={lit ? folder.color : folder.shade}>
                <TabLabel {...folder} color={lit ? "#ffffff" : folder.color} />
              </FolderTab>
            );
            const hoverProps = {
              onMouseEnter: () => highlight(folder.id),
              onMouseLeave: () => highlight(null),
            };
            return (
              <div
                key={folder.id}
                aria-hidden={openable ? undefined : true}
                {...hoverProps}
                className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col transition-[top] duration-500 ease-out"
                style={{
                  top: shifted(i)
                    ? `calc(var(--step) * ${i} + var(--reveal))`
                    : `calc(var(--step) * ${i})`,
                  zIndex: i,
                  // Mientras esta abierta, la vista abierta toma su lugar.
                  visibility: isOpen ? "hidden" : undefined,
                  // La imagen guardada puede asomar por arriba, no por abajo.
                  clipPath: "inset(-400px -80px 0 -80px)",
                }}
              >
                <div className="relative" style={{ paddingLeft: folder.offset }}>
                  {openable ? (
                    <button
                      ref={tabRefs[openable]}
                      type="button"
                      onClick={() => setOpenFolder(openable)}
                      onFocus={(e) => focusHighlight(e, folder.id)}
                      onBlur={focusClear}
                      aria-haspopup="dialog"
                      aria-expanded={isOpen}
                      className="pointer-events-auto block"
                    >
                      {tab}
                    </button>
                  ) : (
                    <div className="pointer-events-auto w-fit">
                      {tab}
                    </div>
                  )}
                </div>
                <div
                  ref={bodyRefs[folder.id]}
                  onClick={openable ? () => setOpenFolder(openable) : undefined}
                  className={`pointer-events-auto relative flex-1 rounded-tl-lg transition-colors duration-300 ${
                    openable ? "cursor-pointer" : ""
                  }`}
                  style={{ backgroundColor: lit ? folder.color : folder.shade }}
                >
                  {/* Imagen guardada en la carpeta: entre el fondo y la hoja del
                      frente; al resaltarla sube y asoma por el borde superior. */}
                  {folder.peek && (
                    <div
                      aria-hidden="true"
                      className={`absolute -top-24 overflow-hidden shadow-lg transition-[translate] ${folder.peek.className} ${
                        lit ? "translate-y-0 duration-500 ease-out" : "translate-y-[120px] duration-400 ease-in"
                      }`}
                    >
                      <Image
                        src={`/images/landing/discover-gatt/${folder.peek.src}`}
                        alt=""
                        width={folder.peek.width}
                        height={folder.peek.height}
                        sizes="(min-width: 1024px) 12vw, 110px"
                        className="h-auto w-full"
                      />
                    </div>
                  )}
                  {/* Hoja del frente: al resaltarla se aclara y deja ver el borde
                      mas oscuro del fondo de la carpeta, como en About us. */}
                  <div
                    className="absolute inset-x-0 bottom-0 top-3 overflow-hidden transition-colors duration-300"
                    style={{ backgroundColor: lit ? folder.color : folder.shade }}
                  >
                    <div
                      aria-hidden="true"
                      className={`absolute inset-0 transition-opacity duration-300 ${lit ? "opacity-100" : "opacity-0"}`}
                      style={{ backgroundColor: SHEET_TINT }}
                    />
                    {folder.preview && (
                      <p
                        aria-hidden="true"
                        className={`relative mx-auto max-w-[560px] px-6 pt-5 text-center font-serif text-[16px] font-light leading-[1.3] text-white transition-opacity sm:px-10 lg:px-0 lg:pt-7 lg:text-[18px] ${
                          lit ? "opacity-100 delay-200 duration-400" : "opacity-0 duration-200"
                        }`}
                      >
                        {folder.preview}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Carpeta del frente: About us. Mientras esta abierta se oculta: la
              vista abierta toma su lugar con copias en la misma posicion. */}
          <div
            onMouseEnter={() => highlight("about")}
            onMouseLeave={() => highlight(null)}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col transition-[top] duration-500 ease-out"
            style={{
              top: shifted(4)
                ? "calc(var(--step) * 4 + var(--reveal))"
                : "calc(var(--step) * 4)",
              visibility: open ? "hidden" : undefined,
            }}
          >
            <div className="pl-[1%]">
              <button
                ref={openerRef}
                type="button"
                onClick={() => setOpenFolder("about")}
                onFocus={(e) => focusHighlight(e, "about")}
                onBlur={focusClear}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="pointer-events-auto block"
              >
                <FolderTab fill={aboutDimmed ? ABOUT_DIMMED : "var(--color-azul)"}>
                  <TabLabel
                    lead="About"
                    accent="us"
                    color={aboutDimmed ? "var(--color-azul)" : "#ffffff"}
                  />
                </FolderTab>
              </button>
            </div>

            <div
              ref={bodyRef}
              className="pointer-events-auto relative flex-1 rounded-b-md rounded-tr-md transition-colors duration-300"
              style={{
                backgroundColor: aboutDimmed ? ABOUT_DIMMED : "var(--color-azul)",
                // La foto puede asomar por arriba, pero no salirse por abajo al
                // guardarse.
                clipPath: "inset(-400px -80px 0 -80px)",
              }}
            >
              {/* Foto metida en la carpeta: queda detras de la hoja. */}
              <div
                ref={photoRef}
                className={`absolute left-[52%] top-[-120px] w-[17%] min-w-[140px] shadow-lg transition-[opacity,translate,rotate] lg:left-[42%] ${
                  photoTucked
                    ? "translate-y-[150px] -rotate-12 opacity-0 duration-400 ease-in"
                    : "-rotate-12 opacity-100 duration-600 ease-out"
                }`}
              >
                <CapitolPhoto
                  sizes="(min-width: 1024px) 17vw, 140px"
                  className={`${CAPITOL_ASPECT} w-full`}
                />
              </div>

              <div
                ref={sheetRef}
                className="absolute inset-x-0 bottom-0 top-3 z-10 overflow-hidden rounded-b-md"
                style={{ background: SHEET_BACKGROUND }}
              >
                <PaperTexture />
                {/* Hoja oscura cuando se resalta otra carpeta. */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    aboutDimmed ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundColor: ABOUT_SHEET_DIMMED }}
                />
                {/* El texto y "Learn More" se ocultan mientras otra carpeta esta
                    resaltada. */}
                <div
                  className={`relative flex h-full flex-col justify-center px-6 pb-10 transition-opacity duration-300 sm:px-10 lg:pl-[24%] lg:pr-10 ${
                    aboutDimmed ? "opacity-0" : ""
                  }`}
                >
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
                  className={`absolute bottom-4 right-6 flex items-center gap-1.5 font-ui text-[15px] text-white/90 transition-[color,opacity] duration-300 hover:text-white ${
                    aboutDimmed ? "pointer-events-none opacity-0" : ""
                  }`}
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
                  photoTucked
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
        highlighted={hovered === "what-we-do"}
        aboutDimmed={aboutDimmed}
      />
      <BoardOverlay
        open={openFolder === "board"}
        onClose={close}
        origin={boardOrigin}
        highlighted={hovered === "board"}
      />
      <MissionOverlay
        open={openFolder === "mission"}
        onClose={close}
        origin={missionOrigin}
        highlighted={hovered === "mission"}
      />
    </section>
  );
}
