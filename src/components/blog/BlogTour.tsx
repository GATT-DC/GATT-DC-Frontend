"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

// Recorrido guiado del editor de blogs: resalta cada parte (marcada con
// data-tour="...") y explica que es, con flechas para avanzar y X para salir.

type Step = { target: string; title: string; body: ReactNode };

const SCRIPT_EXAMPLE = (
  <span className="mt-2 block rounded-md bg-white/10 px-3 py-2 font-ui text-[13px]">
    The Future of *Tax* Policy → The Future of <span className="font-script text-[1.3em]">Tax</span> Policy
  </span>
);

const STEPS: Step[] = [
  {
    target: "card",
    title: "The card in the blog list",
    body: (
      <>
        This is how the post appears in <em>Our blogs</em>. Set the cover image with the image button. The title and subtitle come from
        the post itself.
      </>
    ),
  },
  {
    target: "header",
    title: "Title and subtitle",
    body: (
      <>
        Click any text to edit it. Wrap a word in <strong>*asterisks*</strong> to show it in script:
        {SCRIPT_EXAMPLE}
        <span className="mt-2 block">The small label above the title (e.g. Latest Event Highlights) is optional.</span>
      </>
    ),
  },
  {
    target: "hero",
    title: "Header photos",
    body: (
      <>
        Add up to 5 photos. The layout adjusts to how many there are. Use the image button to set each photo&apos;s path in storage
        (e.g. <code>blogs/tax-policy/photo-1.jpg</code>), ← → to change the order and ✕ to remove one. Missing images show a gray
        placeholder.
      </>
    ),
  },
  {
    target: "meta",
    title: "Extra label and author",
    body: <>A short line such as “GATT DC | Event Recap | Washington, D.C.” and the author, shown as “by: …”. Both are optional.</>,
  },
  {
    target: "summary",
    title: "Summary",
    body: <>A short introduction that appears below the header.</>,
  },
  {
    target: "blocks",
    title: "Sections and their order",
    body: (
      <>
        Each section has a title and text. Leave a <strong>blank line</strong> between paragraphs. Use <strong>↑ ↓</strong> to change the
        order and ✕ to remove a section. <em>Our Panelists</em> moves the same way, so you can put sections before or after it.
      </>
    ),
  },
  {
    target: "panelists",
    title: "Our Panelists",
    body: (
      <>
        Add a card per panelist: photo (image button), name (click it) and LinkedIn (the “in” button). ← → reorder the cards. If there are
        no panelists, the section is hidden.
      </>
    ),
  },
  {
    target: "actions",
    title: "Publish or save as draft",
    body: (
      <>
        <strong>Publish</strong> makes the post visible to all members. <strong>Save draft</strong> keeps it private: only admins can see
        drafts. If something is missing, a message here tells you what.
      </>
    ),
  },
];

const SEEN_KEY = "gatt-blog-tour-seen";
const PAD = 8;

export default function BlogTour() {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // La primera vez que alguien abre el editor, el recorrido empieza solo.
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (!seen) {
      const timer = setTimeout(() => setStep(0), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = useCallback(() => {
    setStep(null);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }, []);

  const go = useCallback(
    (delta: number) => setStep((s) => (s === null ? s : Math.min(Math.max(s + delta, 0), STEPS.length - 1))),
    [],
  );

  // Lleva la parte resaltada a la vista y sigue su posicion al desplazar.
  useLayoutEffect(() => {
    if (step === null) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${STEPS[step].target}"]`);
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
  }, [step]);

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

  const current = STEPS[step];
  const last = step === STEPS.length - 1;
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
            Step {step + 1} of {STEPS.length}
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
            {STEPS.map((_, i) => (
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
