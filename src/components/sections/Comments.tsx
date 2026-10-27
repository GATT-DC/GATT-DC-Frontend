"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Pushpin from "@/components/layout/Pushpin";

type BubbleShape = {
  viewBox: string;
  ratio: string;
  path: string;
  // Tamaño relativo al ancho de la posicion: la nube es mas plana que las
  // otras formas y necesita ser mas ancha para que el texto quepa.
  scale: number;
  // Zona del texto dentro de la burbuja (sin la cola ni las ondas del borde),
  // como porcentaje del alto total.
  top: string;
  height: string;
  padding: string;
  // Cuanto baja la chinche para clavarse en el borde superior de la forma
  // (en la nube el borde ondula hacia abajo donde va la chinche).
  pinDrop: string;
};

// Formas de las burbujas segun el diseño. Se estiran al tamaño de la burbuja
// (el trazo no se deforma gracias a vector-effect).
const SHAPES = {
  cloud: {
    viewBox: "0 0 493 183",
    ratio: "493 / 183",
    path: "M0 95 C0 50 30 25 80 22 C140 18 190 8 250 22 C300 33 330 42 375 32 C410 22 445 20 470 40 C495 60 497 130 470 152 C445 172 400 168 370 158 C335 147 300 160 250 168 C210 175 185 160 160 152 C150 160 142 170 133 183 C130 170 126 162 118 156 C95 162 60 166 35 155 C8 143 0 120 0 95 Z",
    scale: 1.18,
    top: "17%",
    height: "64%",
    padding: "px-[8%]",
    pinDrop: "max(calc(2.3cqw + 6px), 22px)",
  },
  box: {
    viewBox: "0 0 523 235",
    ratio: "523 / 235",
    path: "M22 1 H501 Q522 1 522 22 V156 Q522 177 501 177 H446 Q434 179 440 190 L462 233 L400 196 Q375 177 350 177 H22 Q1 177 1 156 V22 Q1 1 22 1 Z",
    scale: 1,
    top: "0%",
    height: "76%",
    padding: "px-[5%]",
    pinDrop: "0px",
  },
  pill: {
    viewBox: "0 0 467 208",
    ratio: "467 / 208",
    path: "M80 1 H387 A79 79 0 0 1 387 159 H245 Q238 159 236 166 L218 207 Q206 178 175 165 Q163 159 150 159 H80 A79 79 0 0 1 80 1 Z",
    scale: 1,
    top: "0%",
    height: "77%",
    padding: "px-[8%]",
    pinDrop: "0px",
  },
} satisfies Record<string, BubbleShape>;

// Color de cada testimonio cuando esta al frente: relleno de la paleta, y
// borde y autor en un tono oscuro del mismo color.
const ACCENTS = {
  naranja: { fill: "var(--color-naranja)", stroke: "#8a2a0d", author: "#9b2c0c" },
  azul: { fill: "var(--color-azul)", stroke: "#1d3f8f", author: "#1d3f8f" },
  morado: { fill: "var(--color-morado)", stroke: "#4c1d8f", author: "#4c1d8f" },
};

type Testimonial = {
  quote: string;
  author: string;
  shape: keyof typeof SHAPES;
  accent: keyof typeof ACCENTS;
  inactiveFill: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "GATT gave me a space where I could grow professionally, build genuine friendships, and feel part of a community that truly understood both my career and my experience.",
    author: "Caroline Adams",
    shape: "box",
    accent: "naranja",
    inactiveFill: "var(--color-superficie)",
  },
  {
    quote:
      "Some of the most meaningful connections in my career began at GATT. It is a place where you can learn, connect, and genuinely feel that you belong.",
    author: "Miguel Stevens",
    shape: "pill",
    accent: "azul",
    inactiveFill: "var(--color-superficie)",
  },
  {
    quote:
      "Through GATT, I found more than a professional network I found mentors, friends, and a community that has supported me throughout my career.",
    author: "Miguel Stevens",
    shape: "cloud",
    accent: "morado",
    inactiveFill: "var(--color-superficie-2)",
  },
];

// Posiciones del carrusel en desktop (centro horizontal, borde superior y
// ancho base, en porcentajes del contenedor segun el mockup). La primera es
// la del testimonio activo, al centro y adelante.
const SLOTS = [
  { cx: 50.85, y: "40%", w: 40.7, z: 20 },
  { cx: 72.65, y: "26%", w: 36.3, z: 10 },
  { cx: 29.45, y: "22%", w: 38.7, z: 10 },
];

const AUTOPLAY_MS = 6000;
const MOVE_MS = 700;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

// Margen lateral del contenido de cada forma en celular.
const MOBILE_PADDING: Record<keyof typeof SHAPES, string> = {
  box: "px-6",
  pill: "px-11",
  cloud: "px-[11%]",
};

// Alto de las burbujas de celular y cuanto se monta cada una sobre la
// anterior (la cola de la de arriba queda encima de la siguiente).
const MOBILE_BUBBLE_PX = 170;
const MOBILE_OVERLAP_PX = 30;

// Una cara de la burbuja de celular: la forma en su color y el contenido en
// la zona de texto de la forma (fuera de la cola y de las ondas de la nube).
function BubbleFace({
  testimonial,
  back = false,
  children,
}: {
  testimonial: Testimonial;
  back?: boolean;
  children: ReactNode;
}) {
  const shape = SHAPES[testimonial.shape];
  const accent = ACCENTS[testimonial.accent];
  return (
    <div
      className="absolute inset-0 [backface-visibility:hidden]"
      style={back ? { transform: "rotateY(180deg)" } : undefined}
    >
      <svg
        viewBox={shape.viewBox}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <path
          d={shape.path}
          vectorEffect="non-scaling-stroke"
          strokeWidth={2}
          // El borde solo en modo oscuro; en claro la forma va sin borde.
          className="[stroke:transparent] dark:[stroke:var(--stroke)]"
          style={{ fill: accent.fill, "--stroke": accent.stroke } as CSSProperties}
        />
      </svg>
      <div
        className={`absolute inset-x-0 top-[var(--top)] flex h-[var(--height)] items-center ${MOBILE_PADDING[testimonial.shape]}`}
        style={{ "--top": shape.top, "--height": shape.height } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

// Testimonio en celular: burbuja de dos caras con la misma forma que en
// desktop. Al frente la persona; al tocarla gira y muestra el testimonio.
function MobileBubble({
  testimonial,
  index,
  pinned,
  flipped,
  onFlip,
}: {
  testimonial: Testimonial;
  index: number;
  pinned: boolean;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <figure
      className="relative w-full [perspective:1200px]"
      style={{
        height: MOBILE_BUBBLE_PX,
        zIndex: TESTIMONIALS.length - index,
        marginTop: index === 0 ? 0 : -MOBILE_OVERLAP_PX,
      }}
    >
      {pinned && (
        <Pushpin className="pointer-events-none absolute -top-9 left-1/2 z-10 h-12 w-10 -translate-x-1/2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.35)]" />
      )}
      <button
        type="button"
        onClick={onFlip}
        aria-pressed={flipped}
        aria-label={flipped ? `Ocultar testimonio de ${testimonial.author}` : `Leer testimonio de ${testimonial.author}`}
        className="relative block h-full w-full text-left transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        <BubbleFace testimonial={testimonial}>
          <div className="flex w-full items-center gap-4">
            <div
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-rose-400 font-ui text-xl text-white"
            >
              {initials(testimonial.author)}
            </div>
            <div className="min-w-0">
              <span className="font-heading block text-[22px] leading-tight text-white">
                {testimonial.author}
              </span>
              <span className="mt-1.5 flex items-center gap-1.5 font-ui text-[13px] text-white/80">
                Tap to read
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />
                </svg>
              </span>
            </div>
          </div>
        </BubbleFace>
        <BubbleFace testimonial={testimonial} back>
          <blockquote className="min-w-0 font-serif text-[14px] font-light leading-[1.3] text-white">
            “{testimonial.quote}”
          </blockquote>
        </BubbleFace>
      </button>
    </figure>
  );
}

export default function Comments() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Burbujas de celular volteadas (mostrando el testimonio).
  const [flipped, setFlipped] = useState<number[]>([]);
  const pinRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Avance automatico (pausado con hover/foco o si se prefiere menos movimiento).
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % TESTIMONIALS.length),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(id);
  }, [paused]);

  // La chinche queda fija en el centro: al cambiar de testimonio se despega
  // (sube e inclina), espera mientras las burbujas rotan debajo y se vuelve a
  // clavar con un pequeño rebote cuando llega la nueva.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const pin = pinRef.current;
    if (!pin) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = pin.animate(
      [
        { transform: "translateY(0) rotate(0deg)", easing: "cubic-bezier(0.3, 0, 0.2, 1)" },
        { transform: "translateY(-26px) rotate(-14deg)", offset: 0.22 },
        { transform: "translateY(-26px) rotate(-14deg)", offset: 0.62, easing: "cubic-bezier(0.6, 0, 0.9, 0.5)" },
        { transform: "translateY(3px) rotate(2deg)", offset: 0.82, easing: "ease-out" },
        { transform: "translateY(0) rotate(0deg)" },
      ],
      { duration: MOVE_MS + 300 },
    );
    return () => animation.cancel();
  }, [active]);

  const pinDrop = SHAPES[TESTIMONIALS[active].shape].pinDrop;

  return (
    <section
      id="comments"
      aria-roledescription="carrusel"
      aria-label="Testimonios de miembros"
      className="relative flex min-h-svh items-center bg-fondo py-24 lg:py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* En celular: todos los testimonios, cada uno con su forma. */}
      <div className="mx-auto flex w-full max-w-[520px] flex-col px-5 lg:hidden">
        {TESTIMONIALS.map((testimonial, i) => (
          <MobileBubble
            key={testimonial.quote}
            testimonial={testimonial}
            index={i}
            pinned={i === 0}
            flipped={flipped.includes(i)}
            onFlip={() =>
              setFlipped((list) =>
                list.includes(i) ? list.filter((n) => n !== i) : [...list, i],
              )
            }
          />
        ))}
      </div>

      {/* En desktop: carrusel con las burbujas en abanico. */}
      <div className="@container relative mx-auto hidden w-full max-w-[1440px] lg:block lg:h-[clamp(480px,40vw,620px)]">
        <div
          ref={pinRef}
          className="pointer-events-none absolute left-[48%] top-[calc(40%-2.25rem+var(--pin-drop))] z-30 origin-bottom transition-[top] delay-200 duration-400 ease-in-out"
          style={{ "--pin-drop": pinDrop } as CSSProperties}
        >
          <Pushpin className="h-14 w-12 drop-shadow-[0_4px_4px_rgba(0,0,0,0.35)]" />
        </div>

        {TESTIMONIALS.map((testimonial, i) => {
          const slot = (i - active + TESTIMONIALS.length) % TESTIMONIALS.length;
          const isActive = slot === 0;
          const shape = SHAPES[testimonial.shape];
          const accent = ACCENTS[testimonial.accent];
          const position = SLOTS[slot];
          const width = position.w * shape.scale;

          return (
            <figure
              key={testimonial.quote}
              className="absolute left-[var(--x)] top-[var(--y)] aspect-[var(--ratio)] w-[var(--w)] transition-[left,top,width] ease-in-out"
              style={
                {
                  "--x": `${position.cx - width / 2}%`,
                  "--y": position.y,
                  "--w": `${width}%`,
                  "--ratio": shape.ratio,
                  zIndex: position.z,
                  transitionDuration: `${MOVE_MS}ms`,
                } as CSSProperties
              }
            >
              <svg
                viewBox={shape.viewBox}
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-hidden="true"
              >
                <path
                  d={shape.path}
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={2}
                  className="transition-[fill,stroke]"
                  style={{
                    fill: isActive ? accent.fill : testimonial.inactiveFill,
                    stroke: isActive ? accent.stroke : "transparent",
                    transitionDuration: `${MOVE_MS}ms`,
                  }}
                />
              </svg>

              <div
                className={`absolute inset-x-0 top-[var(--top)] flex h-[var(--height)] items-center gap-[5%] ${shape.padding}`}
                style={{ "--top": shape.top, "--height": shape.height } as CSSProperties}
              >
                <div
                  aria-hidden="true"
                  className={`flex aspect-square w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-rose-400 font-ui text-lg text-white transition-[filter] duration-700 lg:w-[14%] lg:max-w-[84px] ${
                    isActive ? "" : "grayscale"
                  }`}
                >
                  {initials(testimonial.author)}
                </div>
                <div className="min-w-0">
                  <blockquote
                    className={`font-serif text-[15px] font-light leading-[1.3] transition-colors duration-700 lg:text-[clamp(14px,1.15vw,17px)] ${
                      isActive ? "text-white" : "text-texto/40"
                    }`}
                  >
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption
                    className="font-script mt-2 text-[18px] leading-none transition-colors duration-700 lg:text-[clamp(16px,1.4vw,22px)]"
                    style={{ color: isActive ? accent.author : "color-mix(in srgb, var(--color-texto) 35%, transparent)" }}
                  >
                    — {testimonial.author}
                  </figcaption>
                </div>
              </div>

              {!isActive && (
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver testimonio de ${testimonial.author}`}
                  className="absolute inset-0 cursor-pointer"
                />
              )}
            </figure>
          );
        })}

      </div>
    </section>
  );
}
