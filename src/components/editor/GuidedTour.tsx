"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

// Recorrido guiado de un editor: resalta cada parte (marcada con
// data-tour="...") y explica que es, con flechas para avanzar y X para salir.
// Se abre solo la primera vez (se recuerda en este navegador con storageKey).

export type TourStep = { target: string; title: string; body: ReactNode };

const PAD = 8;

export default function GuidedTour({ steps, storageKey }: { steps: TourStep[]; storageKey: string }) {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // La primera vez que alguien abre el editor, el recorrido empieza solo.
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(storageKey) === "1";
    } catch {}
    if (!seen) {
      const timer = setTimeout(() => setStep(0), 600);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const close = useCallback(() => {
    setStep(null);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
  }, [storageKey]);

  const go = useCallback(
    (delta: number) => setStep((s) => (s === null ? s : Math.min(Math.max(s + delta, 0), steps.length - 1))),
    [steps.length],
  );

  // Lleva la parte resaltada a la vista y sigue su posicion al desplazar.
  useLayoutEffect(() => {
    if (step === null) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${steps[step].target}"]`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRect(el.getBoundingClientRect()));
    };
    measure();
    const settle = setTimeout(measure, 450);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    cardRef.current?.focus();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [step, steps]);

  useEffect(() => {
    if (step === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step, close, go]);

  const start = (
    <button
      type="button"
      onClick={() => setStep(0)}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amarillo font-ui text-[16px] font-semibold text-[#141414] transition-opacity hover:opacity-85"
      aria-label="How to use the editor"
      title="How to use the editor"
    >
      ?
    </button>
  );

  if (step === null) return start;

  const current = steps[step];
  const last = step === steps.length - 1;
  // Tarjeta debajo de lo resaltado si cabe; si no, encima. En celular, abajo.
  const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const width = Math.min(380, vw - 32);
  let cardStyle: CSSProperties = { left: 16, right: 16, bottom: 16 };
  if (rect && vw >= 640) {
    const below = rect.bottom + PAD + 12;
    const top = below + 240 < vh ? below : Math.max(16, rect.top - PAD - 12 - 240);
    const left = Math.min(Math.max(16, rect.left), vw - width - 16);
    cardStyle = { top, left, width };
  }

  return (
    <>
      {start}
      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-40 rounded-[14px] ring-2 ring-amarillo transition-all duration-200"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
          }}
        />
      )}
      <div
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="blog-tour-title"
        className="fixed z-50 rounded-[18px] bg-[#1f1f1f] p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] outline-none"
        style={cardStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="font-ui text-[12px] uppercase tracking-wide text-amarillo">
            Step {step + 1} of {steps.length}
          </p>
          <button type="button" onClick={close} className="-mr-1 -mt-1 rounded-full p-1 text-white/70 hover:text-white" aria-label="Close the guide">
            ✕
          </button>
        </div>
        <h2 id="blog-tour-title" className="font-heading mt-1 text-[20px] leading-tight">
          {current.title}
        </h2>
        <div className="mt-2 font-ui text-[14px] leading-relaxed text-white/85">{current.body}</div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            {steps.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-amarillo" : "w-1.5 bg-white/30"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={step === 0}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 hover:bg-white/10 disabled:opacity-30"
              aria-label="Previous step"
            >
              ←
            </button>
            {last ? (
              <button type="button" onClick={close} className="rounded-full bg-amarillo px-4 font-ui text-[13px] font-medium text-[#141414] hover:opacity-90">
                Got it
              </button>
            ) : (
              <button
                type="button"
                onClick={() => go(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-amarillo text-[#141414] hover:opacity-90"
                aria-label="Next step"
              >
                →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
