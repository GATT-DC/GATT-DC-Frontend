"use client";

import Image from "next/image";
import { useRef } from "react";
import type { RefObject } from "react";
import FolderTab from "@/components/layout/FolderTab";
import Navbar from "@/components/layout/Navbar";
import PaperTexture from "@/components/layout/PaperTexture";
import {
  placeAt,
  useFolderSequence,
  type FolderStep,
} from "@/components/layout/useFolderSequence";

// Tono de la carpeta abierta segun el mockup (amarillo mas claro que el de la
// paleta, que se usa en el borde y la pestaña).
const OPEN_FOLDER_COLOR = "#fce48c";
// Tapa de la carpeta cerrada (un poco mas intensa que el interior).
const COVER_COLOR = "#fbd960";

const PILLARS = [
  {
    title: "Knowledge & Dialogue",
    text: "We host discussions with leading professionals on international trade, policy, and emerging industry developments, encouraging the exchange of knowledge and perspectives.",
  },
  {
    title: "Professional Connections",
    text: "We connect professionals across government, law, business, and international institutions, creating opportunities to exchange ideas and build meaningful relationships.",
  },
  {
    title: "Career Development",
    text: "We support professional growth through mentorship, shared experience, and connections that help members navigate and advance their careers in international trade.",
  },
  {
    title: "Community & Belonging",
    text: "We foster a welcoming community where LGBTQ+ professionals and allies can connect, share experiences, and find a sense of belonging beyond the workplace.",
  },
];

// Carpeta cerrada (de atras en el stack) desde donde parte la animacion, y el
// cuerpo de la carpeta del frente, detras del cual esta escondida.
export type BackFolderOrigin = {
  body: RefObject<HTMLDivElement | null>;
  tab: RefObject<HTMLButtonElement | null>;
  coveredBy: RefObject<HTMLDivElement | null>;
  // Pestaña de la carpeta del frente: queda por encima mientras esta sale.
  coveredByTab: RefObject<HTMLButtonElement | null>;
};

// Momento en que la carpeta termina de crecer y la tapa empieza a abrirse.
const EXPAND_END = 1000;
const TOTAL_MS = 1600;
const PULL_PX = 48;
const NOTEBOOK_HOLES = 9;

function WhatWeDoLabel({ className = "" }: { className?: string }) {
  return (
    <span className={`font-heading ${className}`}>
      What We{" "}
      <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
        do
      </span>
    </span>
  );
}

export default function WhatWeDoOverlay({
  open,
  onClose,
  origin,
}: {
  open: boolean;
  onClose: () => void;
  origin: BackFolderOrigin;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tabCloneRef = useRef<HTMLDivElement>(null);
  const tabCloneOpenRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const coverTitleRef = useRef<HTMLDivElement>(null);
  const frontTabCloneRef = useRef<HTMLDivElement>(null);

  // Apertura: la carpeta se saca del stack hacia arriba (su parte de abajo
  // sigue escondida detras de la carpeta del frente), pasa de gris a amarillo,
  // crece cerrada hasta la vista abierta y su tapa se abre como un libro.
  const requestClose = useFolderSequence({
    open,
    onClose,
    totalMs: TOTAL_MS,
    closeRef,
    returnFocusRef: origin.tab,
    buildSteps: () => {
      const body = origin.body.current;
      const tab = origin.tab.current;
      const coveredBy = origin.coveredBy.current;
      const coveredByTab = origin.coveredByTab.current;
      const frontTabClone = frontTabCloneRef.current;
      const backdrop = backdropRef.current;
      const nav = navRef.current;
      const panel = panelRef.current;
      const strip = stripRef.current;
      const sheet = sheetRef.current;
      const photos = photosRef.current;
      const closeTab = closeRef.current;
      const tabClone = tabCloneRef.current;
      const tabCloneOpen = tabCloneOpenRef.current;
      const cover = coverRef.current;
      const coverTitle = coverTitleRef.current;
      if (
        !body || !tab || !coveredBy || !backdrop || !nav || !panel ||
        !strip || !sheet || !photos || !closeTab || !tabClone ||
        !tabCloneOpen || !cover || !coverTitle || !coveredByTab || !frontTabClone
      ) {
        return null;
      }

      const first = body.getBoundingClientRect();
      const last = panel.getBoundingClientRect();
      const sx = first.width / last.width;
      const sy = first.height / last.height;
      const tx = first.left - last.left;
      const ty = first.top - last.top;
      const scale = `scale(${sx}, ${sy})`;

      // Parte del cuerpo escondida detras de la carpeta del frente, en
      // unidades del panel sin escalar (el clip-path se aplica antes del
      // transform). El recorte solo actua abajo: hacia los otros lados
      // deja margen para no cortar la pestaña vertical, que sobresale.
      const cut = coveredBy.getBoundingClientRect().top;
      const hidden = Math.max(0, first.bottom - cut) / sy;
      const hiddenPulled = Math.max(0, first.bottom - PULL_PX - cut) / sy;

      placeAt(tabClone, tab.getBoundingClientRect());
      placeAt(frontTabClone, coveredByTab.getBoundingClientRect());
      const closedColor = getComputedStyle(body).backgroundColor;

      const steps: FolderStep[] = [
        {
          el: panel,
          keyframes: [
            {
              transform: `translate(${tx}px, ${ty}px) ${scale}`,
              clipPath: `inset(-200px -200px ${hidden}px -200px)`,
            },
            {
              transform: `translate(${tx}px, ${ty - PULL_PX}px) ${scale}`,
              clipPath: `inset(-200px -200px ${hiddenPulled}px -200px)`,
              offset: 0.3,
            },
            { transform: "none", clipPath: "inset(-200px -200px 0px -200px)" },
          ],
          start: 0,
          duration: EXPAND_END,
        },
        // Mientras sale y crece, la carpeta esta cerrada: la tapa pasa de gris
        // a amarillo junto con el borde.
        {
          el: cover,
          keyframes: [
            { backgroundColor: closedColor },
            { backgroundColor: COVER_COLOR },
          ],
          start: 0,
          duration: 450,
        },
        {
          el: coverTitle,
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
          start: 750,
          duration: 250,
        },
        {
          el: strip,
          keyframes: [{ backgroundColor: closedColor }, { backgroundColor: "var(--color-amarillo)" }],
          start: 0,
          duration: 450,
        },
        // La tapa se abre como la de un libro (gira desde su lado izquierdo).
        {
          el: cover,
          keyframes: [
            { transform: "perspective(2400px) rotateY(0deg)", opacity: 1 },
            { transform: "perspective(2400px) rotateY(70deg)", opacity: 1, offset: 0.7 },
            { transform: "perspective(2400px) rotateY(100deg)", opacity: 0 },
          ],
          start: EXPAND_END - 50,
          duration: 550,
          easing: "cubic-bezier(0.55, 0, 0.6, 1)",
        },
        // La pestaña pasa de gris a amarillo, acompaña la esquina y se
        // desvanece; al final aparece la pestaña vertical.
        {
          el: tabCloneOpen,
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
          start: 0,
          duration: 450,
        },
        {
          el: tabClone,
          keyframes: [
            { transform: "translate(0, 0)", opacity: 1 },
            { transform: `translate(0, -${PULL_PX}px)`, opacity: 1, offset: 0.3 },
            { transform: `translate(${-tx * 0.5}px, ${-ty * 0.5}px)`, opacity: 0, offset: 0.65 },
            { transform: `translate(${-tx}px, ${-ty}px)`, opacity: 0 },
          ],
          start: 0,
          duration: EXPAND_END,
        },
        // La pestaña de la carpeta del frente sigue adelante mientras esta
        // carpeta sale (o vuelve a entrar) y se desvanece cuando empieza a
        // crecer.
        {
          el: frontTabClone,
          keyframes: [{ opacity: 1 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }],
          start: 0,
          duration: 550,
          easing: "linear",
        },
        { el: backdrop, keyframes: [{ opacity: 0 }, { opacity: 1 }], start: 250, duration: 500 },
        { el: nav, keyframes: [{ opacity: 0 }, { opacity: 1 }], start: 700, duration: 400 },
        // Al abrirse la tapa, los papeles se acomodan.
        {
          el: sheet,
          keyframes: [
            { opacity: 0.6, transform: "translateY(16px)" },
            { opacity: 1, transform: "none" },
          ],
          start: EXPAND_END + 50,
          duration: 450,
        },
        {
          el: photos,
          keyframes: [
            { opacity: 0, transform: "translate(40px, 24px) rotate(6deg)" },
            { opacity: 1, transform: "none" },
          ],
          start: EXPAND_END + 200,
          duration: 400,
        },
        {
          el: closeTab,
          keyframes: [
            { opacity: 0, transform: "translateX(-24px)" },
            { opacity: 1, transform: "none" },
          ],
          start: EXPAND_END + 250,
          duration: 350,
        },
      ];

      return steps;
    },
  });

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="what-we-do-title"
      className="fixed inset-0 z-50"
    >
      <div ref={backdropRef} className="absolute inset-0 bg-black" />

      <div ref={navRef}>
        <Navbar />
      </div>

      <div
        ref={panelRef}
        className="absolute bottom-0 left-0 top-24 w-[calc(100%-3rem)] origin-top-left lg:top-28 lg:w-[83%]"
      >
        <div className="relative flex h-full">
          <div
            className="relative flex-1 overflow-y-auto"
            style={{ backgroundColor: OPEN_FOLDER_COLOR }}
          >
            <PaperTexture />
            <div className="relative px-4 py-8 sm:px-8 lg:py-[3%] lg:pl-[3.5%] lg:pr-0">
              {/* Hoja de cuaderno con los agujeros de la carpeta. */}
              <div
                ref={sheetRef}
                className="relative bg-[#f7f6f6] py-10 pl-16 pr-6 shadow-[0_4px_12px_rgba(0,0,0,0.18)] sm:pl-24 sm:pr-10 lg:w-[73%] lg:py-[clamp(1.25rem,3.5vh,3rem)] lg:pr-[4%]"
              >
                <div
                  aria-hidden="true"
                  className="absolute bottom-6 left-3 top-6 flex flex-col justify-between sm:left-4"
                >
                  {Array.from({ length: NOTEBOOK_HOLES }, (_, i) => (
                    <span
                      key={i}
                      className="block h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: OPEN_FOLDER_COLOR }}
                    />
                  ))}
                </div>
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-10 w-px bg-neutral-400/70 sm:left-14"
                />

                <h2
                  id="what-we-do-title"
                  className="font-heading text-[30px] font-normal leading-none text-primario lg:text-[length:clamp(26px,3.5vh,34px)]"
                >
                  What We{" "}
                  <span className="font-script inline-block pr-1 text-[1.3em] leading-normal">
                    do
                  </span>
                </h2>
                <p className="font-heading text-[16px] text-[#262626] lg:text-[length:clamp(15px,2vh,19px)]">
                  Connecting people | Sharing knowledge | Building community.
                </p>
                <p className="mt-6 font-serif text-[16px] leading-[1.35] text-[#1f1f1f] lg:mt-[clamp(0.75rem,2vh,1.5rem)] lg:text-[length:clamp(14px,1.7vh,17px)]">
                  We bring together LGBTQ+ professionals and allies in
                  international trade through conversations, professional
                  connections, and opportunities to learn and grow. Our programs
                  create space to exchange ideas, advance careers, and build
                  lasting relationships across Washington’s trade community.
                </p>

                <ol className="mt-12 divide-y divide-neutral-400/70 lg:mt-[clamp(0.75rem,3vh,3rem)]">
                  {PILLARS.map((pillar, i) => (
                    <li key={pillar.title} className="py-6 first:pt-0 last:pb-0 lg:py-[clamp(0.5rem,1.6vh,1.5rem)]">
                      <h3 className="font-heading pl-1 text-[17px] text-[#262626] lg:text-[length:clamp(15px,2vh,19px)]">
                        {i + 1}.&nbsp; {pillar.title}
                      </h3>
                      <p className="mt-2 font-serif text-[16px] leading-[1.35] text-[#1f1f1f] lg:text-[length:clamp(14px,1.7vh,17px)]">
                        {pillar.text}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tarjeta con las fotos, encima del borde de la hoja. */}
              <div
                ref={photosRef}
                className="relative mx-auto mt-8 w-[55%] max-w-[260px] lg:absolute lg:right-[3%] lg:top-[8%] lg:mt-0 lg:w-[21%] lg:max-w-none"
              >
                <Image
                  src="/images/landing/discover-gatt/whoweare.png"
                  alt="Photos of GATT members collaborating at meetings and workshops"
                  width={1152}
                  height={3020}
                  sizes="(min-width: 1024px) 18vw, 55vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>

          {/* Tapa de la carpeta: cubre el interior mientras la carpeta sale y
              crece, y luego se abre como la de un libro. */}
          <div
            ref={coverRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 right-5 origin-left shadow-[6px_0_18px_rgba(0,0,0,0.25)]"
            style={{ backgroundColor: COVER_COLOR }}
          >
            <PaperTexture />
            <div
              ref={coverTitleRef}
              className="absolute inset-0 flex items-center justify-center"
            >
              <WhatWeDoLabel className="text-[48px] text-white lg:text-[72px]" />
            </div>
          </div>

          {/* Borde de la carpeta con la pestaña vertical, que cierra la vista. */}
          <div ref={stripRef} className="relative w-5 shrink-0 bg-amarillo">
            <PaperTexture />
            <button
              ref={closeRef}
              type="button"
              onClick={requestClose}
              aria-label="Cerrar What We do"
              className="absolute left-full top-[3%] h-10"
            >
              <span
                className="block origin-top-left"
                style={{ transform: "rotate(90deg) translateY(-100%)" }}
              >
                <FolderTab fill="var(--color-amarillo)">
                  <WhatWeDoLabel className="text-[20px] text-white" />
                </FolderTab>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Copia de la pestaña "About us" de la carpeta del frente. */}
      <div
        ref={frontTabCloneRef}
        aria-hidden="true"
        className="pointer-events-none fixed"
      >
        <FolderTab fill="var(--color-azul)">
          <span className="font-heading text-[18px] text-white lg:text-[22px]">
            About{" "}
            <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
              us
            </span>
          </span>
        </FolderTab>
      </div>

      {/* Copia de la pestaña cerrada: de gris con letra amarilla a amarillo. */}
      <div
        ref={tabCloneRef}
        aria-hidden="true"
        className="pointer-events-none fixed"
      >
        <FolderTab fill="#2b2b2b">
          <WhatWeDoLabel className="text-[18px] text-amarillo lg:text-[22px]" />
        </FolderTab>
        <div ref={tabCloneOpenRef} className="absolute inset-0">
          <FolderTab fill="var(--color-amarillo)">
            <WhatWeDoLabel className="text-[18px] text-white lg:text-[22px]" />
          </FolderTab>
        </div>
      </div>
    </div>
  );
}
