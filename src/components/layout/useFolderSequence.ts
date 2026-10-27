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
    // El anillo de foco solo se muestra si la carpeta se abrio con teclado;
    // con el mouse el navegador lo pintaria igual en el primer foco.
    // (focusVisible aun no esta en los tipos DOM de TypeScript.)
    const focusOptions: FocusOptions & { focusVisible: boolean } = {
      focusVisible: returnTo?.matches(":focus-visible") ?? false,
    };
    closeRef.current?.focus(focusOptions);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      returnTo?.focus();
    };
  }, [open, requestClose, closeRef, returnFocusRef]);

  return requestClose;
}
