"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

// Un paso de la secuencia de apertura de una carpeta: una animacion (Web
// Animations API) sobre un elemento, ubicada en la linea de tiempo total.
export type FolderStep = {
  el: HTMLElement;
  keyframes: Keyframe[];
  start: number;
  duration: number;
  easing?: string;
};

export const FOLDER_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

function playSteps(
  steps: FolderStep[],
  totalMs: number,
  reverse: boolean,
  speed: number,
) {
  return steps.map((step) =>
    step.el.animate(step.keyframes, {
      delay:
        (reverse ? totalMs - step.start - step.duration : step.start) * speed,
      duration: step.duration * speed,
      easing: step.easing ?? FOLDER_EASE,
      fill: "both",
      direction: reverse ? "reverse" : "normal",
    }),
  );
}

// Apertura desde las tarjetas de celular: en vez de sacar la carpeta del stack
// y doblar su hoja (estilo desktop), la tarjeta crece hasta ocupar la vista
// abierta, pasa a su color y luego entra el contenido. Al cerrar se encoge de
// vuelta a la tarjeta.
export const CARD_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
export const CARD_EXPAND_MS = 550;
// Momento en que empieza a entrar el contenido.
export const CARD_CONTENT_AT = 380;
export const CARD_TOTAL_MS = 900;

export function cardExpandSteps({
  card,
  panel,
  fill,
  toColor,
  content,
  backdrop,
  nav,
  closeTab,
}: {
  card: HTMLElement;
  panel: HTMLElement;
  // Elemento con el color de fondo de la vista abierta.
  fill: HTMLElement;
  toColor: string;
  content: HTMLElement;
  backdrop: HTMLElement;
  nav: HTMLElement;
  closeTab: HTMLElement;
}): FolderStep[] {
  const first = card.getBoundingClientRect();
  const last = panel.getBoundingClientRect();
  const tx = first.left - last.left;
  const ty = first.top - last.top;
  const scale = `scale(${first.width / last.width}, ${first.height / last.height})`;
  const fromColor = getComputedStyle(card).backgroundColor;

  return [
    {
      el: panel,
      keyframes: [{ transform: `translate(${tx}px, ${ty}px) ${scale}` }, { transform: "none" }],
      start: 0,
      duration: CARD_EXPAND_MS,
      easing: CARD_EASE,
    },
    {
      el: fill,
      keyframes: [{ backgroundColor: fromColor }, { backgroundColor: toColor }],
      start: 0,
      duration: CARD_EXPAND_MS,
    },
    // El contenido no se ve mientras el panel esta escalado (se veria aplastado).
    {
      el: content,
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      start: CARD_CONTENT_AT,
      duration: 300,
    },
    { el: backdrop, keyframes: [{ opacity: 0 }, { opacity: 1 }], start: 0, duration: 400 },
    { el: nav, keyframes: [{ opacity: 0 }, { opacity: 1 }], start: 300, duration: 300 },
    {
      el: closeTab,
      keyframes: [
        { opacity: 0, transform: "translateX(-24px)" },
        { opacity: 1, transform: "none" },
      ],
      start: CARD_EXPAND_MS - 50,
      duration: 300,
    },
  ];
}

// Pone el foco en un elemento. Sin teclado de por medio el anillo de foco no
// debe verse, pero Chrome ignora la opcion focusVisible y lo pinta igual: se
// oculta con data-quiet-focus (ver globals.css) mientras dure ese foco.
function focusQuietly(el: HTMLElement | null, visible: boolean) {
  if (!el) return;
  if (!visible) {
    el.dataset.quietFocus = "";
    el.addEventListener("blur", () => delete el.dataset.quietFocus, { once: true });
  }
  // (focusVisible aun no esta en los tipos DOM de TypeScript.)
  const options: FocusOptions & { focusVisible: boolean } = { focusVisible: visible };
  el.focus(options);
}

// Coloca un elemento `position: fixed` exactamente sobre un rectangulo.
export function placeAt(el: HTMLElement, rect: DOMRect) {
  el.style.left = `${rect.left}px`;
  el.style.top = `${rect.top}px`;
  el.style.width = `${rect.width}px`;
  el.style.height = `${rect.height}px`;
}

// Secuencia comun de las carpetas que se abren a pantalla completa:
// - Al abrir, con el layout final ya renderizado, `buildSteps` mide y arma los
//   pasos, y se arrancan antes del primer pintado (FLIP, sin parpadeo).
// - `requestClose` recorre la misma secuencia al reves y luego llama onClose.
// - Mientras esta abierta bloquea el scroll de la pagina, cierra con Esc y
//   pone el foco en el boton de cerrar; al cerrar lo devuelve a la carpeta.
// Con "reducir movimiento" la secuencia es practicamente instantanea.
export function useFolderSequence({
  open,
  onClose,
  totalMs,
  buildSteps,
  closeRef,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  totalMs: number;
  buildSteps: () => FolderStep[] | null;
  closeRef: RefObject<HTMLButtonElement | null>;
  returnFocusRef: RefObject<HTMLElement | null>;
}) {
  const buildRef = useRef(buildSteps);
  const stepsRef = useRef<FolderStep[]>([]);
  const animationsRef = useRef<Animation[]>([]);
  const closingRef = useRef(false);
  const speedRef = useRef(1);

  useLayoutEffect(() => {
    buildRef.current = buildSteps;
  });

  useLayoutEffect(() => {
    if (!open) return;
    closingRef.current = false;
    speedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0.01
      : 1;
    const steps = buildRef.current();
    if (!steps) return;
    stepsRef.current = steps;
    animationsRef.current = playSteps(steps, totalMs, false, speedRef.current);
    return () => animationsRef.current.forEach((a) => a.cancel());
  }, [open, totalMs]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    animationsRef.current.forEach((a) => a.cancel());
    const animations = playSteps(
      stepsRef.current,
      totalMs,
      true,
      speedRef.current,
    );
    animationsRef.current = animations;
    Promise.all(animations.map((a) => a.finished))
      .then(onClose)
      .catch(() => {});
  }, [onClose, totalMs]);

  useEffect(() => {
    if (!open) return;
    const returnTo = returnFocusRef.current;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    // El anillo de foco solo se muestra si la carpeta se abrio con teclado.
    const keyboard = returnTo?.matches(":focus-visible") ?? false;
    focusQuietly(closeRef.current, keyboard);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      focusQuietly(returnTo, keyboard);
    };
  }, [open, requestClose, closeRef, returnFocusRef]);

  return requestClose;
}
