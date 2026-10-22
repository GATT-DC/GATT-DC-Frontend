"use client";

import Image from "next/image";
import { useRef } from "react";
import type { RefObject } from "react";
import CloseIcon from "@/components/layout/CloseIcon";
import FolderTab from "@/components/layout/FolderTab";
import Navbar from "@/components/layout/Navbar";
import Paperclip from "@/components/layout/Paperclip";
import PaperTexture from "@/components/layout/PaperTexture";
import { useFitContent } from "@/components/layout/useFitContent";
import CapitolPhoto, { CAPITOL_ASPECT } from "@/components/layout/CapitolPhoto";
import {
  FOLDER_EASE,
  placeAt,
  useFolderSequence,
  type FolderStep,
} from "@/components/layout/useFolderSequence";

// Tono de la carpeta abierta segun el mockup (mas oscuro que el azul de la
// paleta, que se usa en el borde y la pestaña).
const OPEN_FOLDER_COLOR = "#4472C4";

// Hoja del frente de la carpeta cerrada: opaca para que la foto quede "dentro".
export const SHEET_BACKGROUND =
  "linear-gradient(rgb(200 204 216 / 0.25), rgb(200 204 216 / 0.25)), var(--color-azul)";

const PREVIEW =
  "GATT DC is a non-profit, non-partisan organization designed to facilitate education, networking, and professional development among lesbian, gay, bisexual, transgender, and queer (LGBTQ+) professionals and allies in international trade.";

const PARAGRAPHS = [
  PREVIEW,
  "Since its inception in 1986, GATT DC has provided a safe, welcoming, and professionally nurturing space for LGBTQ+ professionals and allies in international trade to learn more about legal, policy, and technical issues in this field, gain access to a network of other professionals, discover employment opportunities, and seek career advice from peers and mentors. GATT DC hosts monthly meetings in which prominent international trade professionals brief members and engage in Q&A on selected international trade and related topics. GATT DC regularly spearheads events with other trade-focused professional organizations in Washington, D.C., including the Association of Women in International Trade (WIIT), the Washington International Trade Association (WITA), and the Customs and International Trade Bar Association (CITBA). GATT DC also provides members with additional networking and community service opportunities throughout the year.",
  "GATT DC is a 501(c)(3) non-profit organization, incorporated in the District of Columbia.",
];

// Elementos de la carpeta cerrada (en el stack) desde donde parte la animacion.
export type FolderOrigin = {
  body: RefObject<HTMLDivElement | null>;
  sheet: RefObject<HTMLDivElement | null>;
  tab: RefObject<HTMLButtonElement | null>;
  photo: RefObject<HTMLDivElement | null>;
};

// Duracion total de la secuencia de apertura (el cierre la recorre al reves).
const TOTAL_MS = 1400;
const LIFT_PX = 24;

export default function AboutUsOverlay({
  open,
  onClose,
  origin,
}: {
  open: boolean;
  onClose: () => void;
  origin: FolderOrigin;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelFillRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const photo1Ref = useRef<HTMLDivElement>(null);
  const photo2Ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const coverCloneRef = useRef<HTMLDivElement>(null);
  const tabCloneRef = useRef<HTMLDivElement>(null);
  const photoCloneRef = useRef<HTMLDivElement>(null);

  // Apertura (FLIP): con el layout final ya renderizado se mide la carpeta
  // del stack y la vista abierta, y antes del primer pintado se arranca la
  // secuencia desde la posicion de la carpeta cerrada.
  // Antes que la secuencia: el contenido ya ajustado al alto de la carpeta.
  useFitContent(open, panelFillRef, contentRef);

  const requestClose = useFolderSequence({
    open,
    onClose,
    totalMs: TOTAL_MS,
    closeRef,
    returnFocusRef: origin.tab,
    buildSteps: () => {
      const body = origin.body.current;
      const sheet = origin.sheet.current;
      const tab = origin.tab.current;
      const photo = origin.photo.current;
      const backdrop = backdropRef.current;
      const nav = navRef.current;
      const panel = panelRef.current;
      const panelFill = panelFillRef.current;
      const text = textRef.current;
      const photo1 = photo1Ref.current;
      const photo2 = photo2Ref.current;
      const closeTab = closeRef.current;
      const clip = clipRef.current;
      const coverClone = coverCloneRef.current;
      const tabClone = tabCloneRef.current;
      const photoClone = photoCloneRef.current;
      if (
        !body || !sheet || !tab || !photo || !backdrop || !nav || !panel || !panelFill ||
        !text || !photo1 || !photo2 || !closeTab || !clip || !coverClone ||
        !tabClone || !photoClone
      ) {
        return null;
      }

      // Cuerpo de la carpeta -> panel abierto.
      const first = body.getBoundingClientRect();
      const last = panel.getBoundingClientRect();
      const tx = first.left - last.left;
      const ty = first.top - last.top;
      const scale = `scale(${first.width / last.width}, ${first.height / last.height})`;

      // Las copias (tapa, pestaña horizontal y foto) arrancan exactamente donde
      // estan en el stack.
      placeAt(coverClone, sheet.getBoundingClientRect());
      const tabRect = tab.getBoundingClientRect();
      placeAt(tabClone, tabRect);
      // La pestaña va pegada al borde superior de la carpeta: su esquina
      // inferior izquierda se desplaza igual que ese punto de la carpeta al
      // crecer (el panel crece desde su esquina superior izquierda).
      const tabEndX =
        -tx + (tabRect.left - first.left) * (last.width / first.width - 1);
      const photoLast = photo1.getBoundingClientRect();
      placeAt(photoClone, photoLast);
      const photoFirst = photo.getBoundingClientRect();
      const dx =
        photoFirst.left + photoFirst.width / 2 - (photoLast.left + photoLast.width / 2);
      const dy =
        photoFirst.top + photoFirst.height / 2 - (photoLast.top + photoLast.height / 2);
      const photoScale = `scale(${photo.offsetWidth / photoLast.width}, ${photo.offsetHeight / photoLast.height})`;

      // El interior arranca con el azul de la carpeta cerrada.
      const folderColor = getComputedStyle(body).backgroundColor;

      const steps: FolderStep[] = [
        // 1. La carpeta se levanta del stack y crece hasta la vista abierta.
        {
          el: panel,
          keyframes: [
            { transform: `translate(${tx}px, ${ty}px) ${scale}` },
            { transform: `translate(${tx}px, ${ty - LIFT_PX}px) ${scale}`, offset: 0.25 },
            { transform: "none" },
          ],
          start: 0,
          duration: 1100,
        },
        {
          el: panelFill,
          keyframes: [
            { backgroundColor: folderColor },
            { backgroundColor: folderColor, offset: 0.3 },
            { backgroundColor: OPEN_FOLDER_COLOR },
          ],
          start: 0,
          duration: 1000,
        },
        // 2. La tapa se dobla hacia el frente desde su borde inferior.
        {
          el: coverClone,
          keyframes: [
            { transform: "perspective(1400px) translateY(0) rotateX(0deg)", opacity: 1 },
            { transform: `perspective(1400px) translateY(-${LIFT_PX}px) rotateX(-55deg)`, opacity: 1, offset: 0.55 },
            { transform: `perspective(1400px) translateY(-${LIFT_PX}px) rotateX(-100deg)`, opacity: 0 },
          ],
          start: 0,
          duration: 600,
          easing: "cubic-bezier(0.45, 0, 0.75, 0.4)",
        },
        // La pestaña horizontal acompaña la esquina de la carpeta y se desvanece.
        {
          el: tabClone,
          keyframes: [
            { transform: "translate(0, 0)" },
            { transform: `translate(0, -${LIFT_PX}px)`, offset: 0.25 },
            { transform: `translate(${tabEndX}px, ${-ty}px)` },
          ],
          start: 0,
          duration: 1100,
        },
        // Se desvanece al final, sin despegarse, cuando aparece la pestaña
        // vertical.
        {
          el: tabClone,
          keyframes: [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }],
          start: 550,
          duration: 550,
          easing: "linear",
        },
        // 3. La foto sale de la carpeta, se endereza y va a su lugar.
        {
          el: photoClone,
          keyframes: [
            { transform: `translate(${dx}px, ${dy}px) rotate(-12deg) ${photoScale}`, opacity: 1, easing: "ease-out" },
            { transform: `translate(${dx}px, ${dy - LIFT_PX * 2}px) rotate(-8deg) ${photoScale}`, opacity: 1, offset: 0.25, easing: FOLDER_EASE },
            { transform: "none", opacity: 1, offset: 0.98 },
            { transform: "none", opacity: 0 },
          ],
          start: 150,
          duration: 1050,
          // El easing va por tramo para que el cambio final a la foto real ocurra
          // justo al terminar.
          easing: "linear",
        },
        {
          el: photo1,
          keyframes: [{ opacity: 0 }, { opacity: 0, offset: 0.98 }, { opacity: 1 }],
          start: 150,
          duration: 1050,
          easing: "linear",
        },
        { el: backdrop, keyframes: [{ opacity: 0 }, { opacity: 1 }], start: 250, duration: 500 },
        { el: nav, keyframes: [{ opacity: 0 }, { opacity: 1 }], start: 700, duration: 400 },
        // 4. Aparece el contenido.
        {
          el: text,
          keyframes: [
            { opacity: 0, transform: "translateY(20px)" },
            { opacity: 1, transform: "none" },
          ],
          start: 950,
          duration: 450,
        },
        {
          el: photo2,
          keyframes: [
            { opacity: 0, transform: "translateY(20px)" },
            { opacity: 1, transform: "none" },
          ],
          start: 1000,
          duration: 400,
        },
        {
          el: closeTab,
          keyframes: [
            { opacity: 0, transform: "translateX(-24px)" },
            { opacity: 1, transform: "none" },
          ],
          start: 950,
          duration: 350,
        },
        {
          el: clip,
          keyframes: [
            { opacity: 0, transform: "translateY(-12px)" },
            { opacity: 1, transform: "none" },
          ],
          start: 1050,
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
      aria-labelledby="about-us-title"
      className="fixed inset-0 z-50"
    >
      <div ref={backdropRef} className="absolute inset-0 bg-fondo" />

      <div ref={navRef}>
        <Navbar onMedia={false} />
      </div>

      <div
        ref={panelRef}
        className="absolute bottom-0 left-0 top-24 w-[calc(100%-3rem)] origin-top-left lg:top-28 lg:w-[83%]"
      >
        <div className="relative flex h-full">
          <div
            ref={panelFillRef}
            className="relative flex-1 overflow-y-auto [scrollbar-width:none] lg:overflow-hidden [&::-webkit-scrollbar]:hidden"
            style={{ backgroundColor: OPEN_FOLDER_COLOR }}
          >
            <PaperTexture />
            <div
              ref={contentRef}
              className="relative flex flex-col gap-10 px-6 py-12 sm:px-12 lg:flex-row lg:gap-12 lg:py-16 lg:pl-[8%] lg:pr-0"
            >
              <div ref={textRef} className="lg:max-w-[760px] lg:flex-1">
                <h2
                  id="about-us-title"
                  className="font-heading text-[40px] font-normal leading-none text-white lg:text-[48px]"
                >
                  About{" "}
                  <span className="font-script inline-block pr-1 text-[1.3em] leading-normal">
                    us
                  </span>
                </h2>
                <div className="mt-4 space-y-6 font-serif text-[17px] font-light leading-[1.35] text-white lg:text-justify lg:text-[18px]">
                  {PARAGRAPHS.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 lg:ml-auto lg:mt-12 lg:w-[26%] lg:shrink-0 lg:flex-col lg:self-start">
                <div ref={photo1Ref} className="flex-1 lg:flex-none">
                  <CapitolPhoto
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className={`${CAPITOL_ASPECT} w-full`}
                  />
                </div>
                <div ref={photo2Ref} className="flex-1 lg:flex-none">
                  <div className={`relative w-full overflow-hidden ${CAPITOL_ASPECT}`}>
                    <Image
                      src="/images/landing/discover-gatt/eventonetworking.png"
                      alt="GATT members laughing and talking at a networking event"
                      fill
                      sizes="(min-width: 1024px) 22vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Borde de la carpeta con la pestaña vertical, que cierra la vista. */}
          <div className="relative w-5 shrink-0 bg-azul">
            <PaperTexture />
            <button
              ref={closeRef}
              type="button"
              onClick={requestClose}
              aria-label="Cerrar About us"
              className="absolute left-full top-[3%] h-10"
            >
              <span
                className="block origin-top-left"
                style={{ transform: "rotate(90deg) translateY(-100%)" }}
              >
                <FolderTab fill="var(--color-azul)">
                  <span className="flex items-center gap-2.5 text-white">
                    <CloseIcon />
                    <span className="font-heading text-[20px]">
                      About{" "}
                      <span className="font-script inline-block text-[1.3em] leading-none">
                        us
                      </span>
                    </span>
                  </span>
                </FolderTab>
              </span>
            </button>
            <div ref={clipRef} className="absolute -left-6 top-[20%] z-10">
              <Paperclip className="h-24 w-8 -rotate-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Copias de la carpeta cerrada que hacen la transicion. */}
      <div
        ref={photoCloneRef}
        aria-hidden="true"
        className="pointer-events-none fixed shadow-lg"
      >
        <CapitolPhoto
          sizes="(min-width: 1024px) 22vw, 50vw"
          className="h-full w-full"
        />
      </div>

      <div
        ref={coverCloneRef}
        aria-hidden="true"
        className="pointer-events-none fixed origin-bottom overflow-hidden rounded-b-md"
        style={{ background: SHEET_BACKGROUND }}
      >
        <PaperTexture />
        <div className="relative flex h-full flex-col justify-center px-6 pb-10 sm:px-10 lg:pl-[24%] lg:pr-10">
          <p className="max-w-[560px] font-serif text-[17px] font-light leading-[1.3] text-white lg:text-[19px]">
            {PREVIEW}
          </p>
        </div>
        <span className="absolute bottom-4 right-6 font-ui text-[15px] text-white/90">
          Learn More →
        </span>
      </div>

      <div
        ref={tabCloneRef}
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
    </div>
  );
}
