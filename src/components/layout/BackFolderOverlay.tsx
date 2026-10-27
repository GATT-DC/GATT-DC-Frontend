"use client";

import { useRef } from "react";
import type { ReactNode, RefObject } from "react";
import CloseIcon from "@/components/layout/CloseIcon";
import FolderTab from "@/components/layout/FolderTab";
import Navbar from "@/components/layout/Navbar";
import PaperTexture, { type FolderTexture } from "@/components/layout/PaperTexture";
import { useFitContent } from "@/components/layout/useFitContent";
import {
  CARD_CONTENT_AT,
  CARD_TOTAL_MS,
  FOLDER_EASE,
  cardExpandSteps,
  placeAt,
  useFolderSequence,
  type FolderStep,
} from "@/components/layout/useFolderSequence";

// Carpeta cerrada (de atras en el stack) desde donde parte la animacion, y lo
// que la tapa en el stack: el cuerpo de la carpeta siguiente y su pestaña.
// Las tarjetas de celular no estan tapadas por nada y no los llevan.
export type BackFolderOrigin = {
  body: RefObject<HTMLDivElement | null>;
  tab: RefObject<HTMLButtonElement | null>;
  coveredBy?: RefObject<HTMLDivElement | null>;
  // Pestaña de la carpeta siguiente: queda por encima mientras esta sale.
  coveredByTab?: RefObject<HTMLElement | null>;
  // Viene de una tarjeta de celular: se abre con la animacion de tarjeta.
  card?: boolean;
};

// Animacion de entrada del contenido al abrirse la tapa. Cada elemento la
// declara con data-folder-enter y, opcionalmente, data-folder-delay (ms).
const ENTER_KEYFRAMES: Record<string, Keyframe[]> = {
  sheet: [
    { opacity: 0, transform: "translateY(16px)" },
    { opacity: 1, transform: "none" },
  ],
  rise: [
    { opacity: 0, transform: "translateY(20px)" },
    { opacity: 1, transform: "none" },
  ],
  slide: [
    { opacity: 0, transform: "translate(40px, 24px) rotate(6deg)" },
    { opacity: 1, transform: "none" },
  ],
};

// Fases de la apertura (ms): la carpeta termina de salir del stack, termina
// de doblarse su hoja del frente y termina de crecer.
const PULL_END = 300;
const FOLD_END = 700;
const EXPAND_END = 1350;
const PULL_PX = 48;
const CONTENT_MS = 450;

// Carpeta de atras del stack que se abre a pantalla completa: se saca del
// stack hacia arriba (su parte de abajo sigue escondida detras de la carpeta
// siguiente), su hoja del frente se dobla hacia el frente como en About us,
// pasa del gris del stack a su color y crece hasta la vista abierta. Al
// cerrar, todo al reves.
export default function BackFolderOverlay({
  open,
  onClose,
  origin,
  titleId,
  closeLabel,
  renderLabel,
  closedTabFill,
  accent,
  coverColor,
  interiorColor,
  coveringTab,
  texture,
  sideTabs,
  highlighted = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  origin: BackFolderOrigin;
  titleId: string;
  closeLabel: string;
  renderLabel: (className: string) => ReactNode;
  closedTabFill: string;
  accent: string;
  coverColor: string;
  interiorColor: string;
  coveringTab: ReactNode;
  // Textura de la carpeta (interior, hoja del frente y borde).
  texture: FolderTexture;
  sideTabs?: ReactNode;
  // La pestaña ya estaba pintada de su color (hover) al abrir.
  highlighted?: boolean;
  children: ReactNode;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const interiorRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tabCloneRef = useRef<HTMLDivElement>(null);
  const tabCloneOpenRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const coverFillRef = useRef<HTMLDivElement>(null);
  const coverCloneRef = useRef<HTMLDivElement>(null);
  const coveringTabCloneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Antes que la secuencia: el contenido ya ajustado al alto de la carpeta.
  useFitContent(open, interiorRef, contentRef);

  const requestClose = useFolderSequence({
    open,
    onClose,
    totalMs: origin.card ? CARD_TOTAL_MS : EXPAND_END + 600,
    closeRef,
    returnFocusRef: origin.tab,
    buildSteps: () => {
      const body = origin.body.current;
      const tab = origin.tab.current;
      const coveredBy = origin.coveredBy?.current ?? null;
      const coveredByTab = origin.coveredByTab?.current ?? null;
      const coveringTabClone = coveringTabCloneRef.current;
      const backdrop = backdropRef.current;
      const nav = navRef.current;
      const panel = panelRef.current;
      const interior = interiorRef.current;
      const strip = stripRef.current;
      const closeTab = closeRef.current;
      const tabClone = tabCloneRef.current;
      const tabCloneOpen = tabCloneOpenRef.current;
      const cover = coverRef.current;
      const coverFill = coverFillRef.current;
      const coverClone = coverCloneRef.current;
      const content = contentRef.current;
      if (
        !body || !tab || !coveringTabClone ||
        !backdrop || !nav || !panel || !interior || !strip || !closeTab ||
        !tabClone || !tabCloneOpen || !cover || !coverFill || !coverClone ||
        !content
      ) {
        return null;
      }

      // Al abrirse entra el contenido.
      const enterSteps = (at: number) =>
        [...interior.querySelectorAll<HTMLElement>("[data-folder-enter]")].flatMap(
          (el): FolderStep[] => {
            const keyframes = ENTER_KEYFRAMES[el.dataset.folderEnter ?? ""];
            if (!keyframes) return [];
            return [{ el, keyframes, start: at + Number(el.dataset.folderDelay ?? 0), duration: CONTENT_MS }];
          },
        );

      if (origin.card) {
        for (const el of [cover, coverClone, tabClone, coveringTabClone]) {
          el.style.display = "none";
        }
        return [
          ...cardExpandSteps({
            card: body,
            panel,
            fill: interior,
            toColor: interiorColor,
            content,
            backdrop,
            nav,
            closeTab,
          }),
          ...enterSteps(CARD_CONTENT_AT),
        ];
      }

      const first = body.getBoundingClientRect();
      const last = panel.getBoundingClientRect();
      const sx = first.width / last.width;
      const sy = first.height / last.height;
      const tx = first.left - last.left;
      const ty = first.top - last.top;
      const scale = `scale(${sx}, ${sy})`;

      // Parte del cuerpo escondida detras de la carpeta siguiente, en unidades
      // del panel sin escalar (el clip-path se aplica antes del transform). El
      // recorte solo actua abajo: hacia los otros lados deja margen para no
      // cortar las pestañas verticales, que sobresalen.
      const cut = coveredBy ? coveredBy.getBoundingClientRect().top : first.bottom;
      const hidden = Math.max(0, first.bottom - cut) / sy;
      const hiddenPulled = Math.max(0, first.bottom - PULL_PX - cut) / sy;

      const tabRect = tab.getBoundingClientRect();
      placeAt(tabClone, tabRect);
      // La pestaña va pegada al borde superior de la carpeta: su esquina
      // inferior izquierda se desplaza igual que ese punto de la carpeta al
      // crecer (el panel crece desde su esquina superior izquierda).
      const tabEndX = -tx + (tabRect.left - first.left) * (1 / sx - 1);
      if (coveredByTab) {
        placeAt(coveringTabClone, coveredByTab.getBoundingClientRect());
      } else {
        coveringTabClone.style.display = "none";
      }
      // La copia de la hoja del frente ocupa la parte visible de la carpeta
      // ya sacada del stack, con su tamaño real (doblarla dentro del panel
      // escalado la deformaria).
      const sheetTop = first.top - PULL_PX + 12 * sy;
      placeAt(
        coverClone,
        new DOMRect(first.left, sheetTop, first.width * (1 - 20 / last.width), Math.max(0, cut - sheetTop)),
      );
      const closedColor = getComputedStyle(body).backgroundColor;

      // Fases (ms): sale del stack -> se dobla la hoja del frente con la
      // carpeta quieta -> crece hasta la vista abierta.
      const p = PULL_END / EXPAND_END;
      const f = FOLD_END / EXPAND_END;
      const steps: FolderStep[] = [
        {
          el: panel,
          keyframes: [
            {
              transform: `translate(${tx}px, ${ty}px) ${scale}`,
              clipPath: `inset(-200px -400px ${hidden}px -200px)`,
              easing: "cubic-bezier(0.3, 0, 0.2, 1)",
            },
            {
              transform: `translate(${tx}px, ${ty - PULL_PX}px) ${scale}`,
              clipPath: `inset(-200px -400px ${hiddenPulled}px -200px)`,
              offset: p,
            },
            {
              transform: `translate(${tx}px, ${ty - PULL_PX}px) ${scale}`,
              clipPath: `inset(-200px -400px ${hiddenPulled}px -200px)`,
              offset: f,
              easing: FOLDER_EASE,
            },
            { transform: "none", clipPath: "inset(-200px -400px 0px -200px)" },
          ],
          start: 0,
          duration: EXPAND_END,
          easing: "linear",
        },
        // El interior pasa del gris del stack a su color mientras se dobla la
        // hoja; la hoja y el borde toman su color al salir del stack.
        {
          el: interior,
          keyframes: [
            { backgroundColor: closedColor },
            { backgroundColor: closedColor, offset: PULL_END / FOLD_END },
            { backgroundColor: interiorColor },
          ],
          start: 0,
          duration: FOLD_END,
        },
        {
          el: coverFill,
          keyframes: [
            { backgroundColor: closedColor },
            { backgroundColor: coverColor },
          ],
          start: 0,
          duration: PULL_END,
        },
        {
          el: strip,
          keyframes: [{ backgroundColor: closedColor }, { backgroundColor: accent }],
          start: 0,
          duration: 450,
        },
        // Como en About us: ya fuera del stack, la hoja del frente (su copia a
        // tamaño real) se dobla hacia el frente desde su borde inferior y deja
        // ver el interior de la carpeta, que no se mueve hasta que termina.
        {
          el: cover,
          keyframes: [{ opacity: 1 }, { opacity: 1, offset: 0.99 }, { opacity: 0 }],
          start: 0,
          duration: PULL_END,
          easing: "linear",
        },
        {
          el: coverClone,
          keyframes: [
            { opacity: 0, transform: "perspective(1400px) rotateX(0deg)" },
            { opacity: 0, transform: "perspective(1400px) rotateX(0deg)", offset: PULL_END / FOLD_END - 0.005 },
            { opacity: 1, transform: "perspective(1400px) rotateX(0deg)", offset: PULL_END / FOLD_END, easing: "cubic-bezier(0.45, 0, 0.75, 0.4)" },
            { opacity: 1, transform: "perspective(1400px) rotateX(-55deg)", offset: 0.78, easing: "cubic-bezier(0.45, 0, 0.75, 0.4)" },
            { opacity: 0, transform: "perspective(1400px) rotateX(-100deg)" },
          ],
          start: 0,
          duration: FOLD_END,
          easing: "linear",
        },
        // La pestaña pasa del gris a su color, acompaña la esquina y se
        // desvanece; al final aparece la pestaña vertical.
        {
          el: tabCloneOpen,
          keyframes: [{ opacity: highlighted ? 1 : 0 }, { opacity: 1 }],
          start: 0,
          duration: 450,
        },
        {
          el: tabClone,
          keyframes: [
            { transform: "translate(0, 0)", easing: "cubic-bezier(0.3, 0, 0.2, 1)" },
            { transform: `translate(0, -${PULL_PX}px)`, offset: p },
            { transform: `translate(0, -${PULL_PX}px)`, offset: f, easing: FOLDER_EASE },
            { transform: `translate(${tabEndX}px, ${-ty}px)` },
          ],
          start: 0,
          duration: EXPAND_END,
          easing: "linear",
        },
        // Se desvanece al final del crecimiento, sin despegarse, cuando aparece
        // la pestaña vertical.
        {
          el: tabClone,
          keyframes: [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }],
          start: FOLD_END,
          duration: EXPAND_END - FOLD_END,
          easing: "linear",
        },
        // La pestaña de la carpeta siguiente sigue adelante mientras esta sale
        // y se dobla (o vuelve a entrar) y se desvanece cuando empieza a crecer.
        {
          el: coveringTabClone,
          keyframes: [{ opacity: 1 }, { opacity: 1, offset: FOLD_END / (FOLD_END + 150) }, { opacity: 0 }],
          start: 0,
          duration: FOLD_END + 150,
          easing: "linear",
        },
        { el: backdrop, keyframes: [{ opacity: 0 }, { opacity: 1 }], start: FOLD_END - 100, duration: 500 },
        { el: nav, keyframes: [{ opacity: 0 }, { opacity: 1 }], start: FOLD_END + 300, duration: 400 },
        {
          el: closeTab,
          keyframes: [
            { opacity: 0, transform: "translateX(-24px)" },
            { opacity: 1, transform: "none" },
          ],
          start: EXPAND_END + 150,
          duration: 350,
        },
      ];

      // Al abrirse la tapa entra el contenido.
      return [...steps, ...enterSteps(EXPAND_END - 50)];
    },
  });

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50"
    >
      <div ref={backdropRef} className="absolute inset-0 bg-fondo" />

      <div ref={navRef}>
        <Navbar onMedia={false} />
      </div>

      <div
        ref={panelRef}
        className="absolute bottom-0 left-0 top-16 w-[calc(100%-3rem)] origin-top-left sm:top-24 lg:top-28 lg:w-[83%]"
      >
        <div className="relative flex h-full">
          <div
            ref={interiorRef}
            className="relative isolate flex-1 overflow-y-auto [scrollbar-width:none] lg:overflow-hidden [&::-webkit-scrollbar]:hidden"
            style={{ backgroundColor: interiorColor }}
          >
            <PaperTexture texture={texture} />
            <div ref={contentRef}>{children}</div>
          </div>

          {/* Hoja del frente de la carpeta: cubre el interior mientras sale del
              stack y se dobla hacia el frente al abrirse (como en About us). */}
          <div
            ref={coverRef}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 right-5 top-3 origin-bottom"
          >
            <div
              ref={coverFillRef}
              className="absolute inset-0 rounded-b-md"
              style={{ backgroundColor: coverColor }}
            />
            <PaperTexture texture={texture} />
          </div>

          {/* Borde de la carpeta con la pestaña vertical, que cierra la vista. */}
          <div
            ref={stripRef}
            className="relative w-5 shrink-0"
            style={{ backgroundColor: accent }}
          >
            <PaperTexture texture={texture} />
            {sideTabs}
            <button
              ref={closeRef}
              type="button"
              onClick={requestClose}
              aria-label={closeLabel}
              className="absolute left-full top-[3%] z-10 h-10"
            >
              <span
                className="block origin-top-left"
                style={{ transform: "rotate(90deg) translateY(-100%)" }}
              >
                <FolderTab fill={accent}>
                  <span className="flex items-center gap-2.5 text-white">
                    <CloseIcon />
                    {renderLabel("text-[20px]")}
                  </span>
                </FolderTab>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Copia de la hoja del frente que se dobla al abrir. */}
      <div
        ref={coverCloneRef}
        aria-hidden="true"
        className="pointer-events-none fixed origin-bottom overflow-hidden rounded-b-md"
        style={{ backgroundColor: coverColor }}
      >
        <PaperTexture texture={texture} />
      </div>

      {/* Copia de la pestaña de la carpeta siguiente en el stack. */}
      <div
        ref={coveringTabCloneRef}
        aria-hidden="true"
        className="pointer-events-none fixed"
      >
        {coveringTab}
      </div>

      {/* Copia de la pestaña cerrada: del gris del stack a su color. */}
      <div
        ref={tabCloneRef}
        aria-hidden="true"
        className="pointer-events-none fixed"
      >
        <FolderTab fill={closedTabFill}>
          <span style={{ color: accent }}>
            {renderLabel("text-[18px] lg:text-[22px]")}
          </span>
        </FolderTab>
        <div ref={tabCloneOpenRef} className="absolute inset-0">
          <FolderTab fill={accent}>
            {renderLabel("text-[18px] text-white lg:text-[22px]")}
          </FolderTab>
        </div>
      </div>
    </div>
  );
}
