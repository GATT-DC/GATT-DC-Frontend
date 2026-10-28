"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type TitleLayout = "right" | "bottom-left" | "bottom-right" | "center" | "top";

type Slide = {
  image: string;
  alt: string;
  title: string;
  accent: string;
  layout: TitleLayout;
  text: string;
};

// Posicion del titulo sobre la imagen. En las disposiciones de dos lineas la
// palabra en cursiva va debajo del titulo.
const TITLE_LAYOUTS: Record<TitleLayout, { position: string; stacked: boolean }> = {
  right: {
    position: "items-center justify-center text-center sm:justify-end sm:pr-[6%] sm:text-right",
    stacked: false,
  },
  "bottom-left": {
    position: "items-end justify-start pb-[4%] pl-[4%] text-left",
    stacked: true,
  },
  "bottom-right": {
    position: "items-end justify-end pb-[3%] pr-[4%] text-right",
    stacked: true,
  },
  center: {
    position: "items-center justify-center text-center",
    stacked: true,
  },
  top: {
    position: "items-start justify-center pt-[6%] text-center",
    stacked: false,
  },
};

const SLIDES: Slide[] = [
  {
    image: "/images/landing/where-it-all-began/1.png",
    alt: "Members of GATT gathered around a table in the early days of the group",
    title: "Where It All",
    accent: "began",
    layout: "right",
    text: "In 1986, at a time when being openly gay in the workplace was not acceptable, a group of LGBTQ+ professionals in international trade decided to meet outside of work for a drink. Not surprisingly, much of the conversation centered on current events in international trade and impacts on peoples’ jobs and organizations. The evening was so enjoyable that the group decided to meet again and, eventually, these meet ups became regular occurrences. Over time, the group grew as individuals invited friends and acquaintances from government and the private sector to join in on the industry gossip.",
  },
  {
    image: "/images/landing/where-it-all-began/2.png",
    alt: "GATT members socializing at a holiday party in a private home",
    title: "From Gathering to",
    accent: "community",
    layout: "bottom-left",
    text: "The group had gotten sufficiently large that it was dominating the bar at the restaurant where it was meeting. This prompted someone to propose that the group’s holiday party be hosted at a private residence. The change in venue inaugurated a new era for the group, where meetings were held in members’ private homes. It also spurred the creation of the group’s name.",
  },
  {
    image: "/images/landing/where-it-all-began/3.png",
    alt: "Desk with an office phone, an address book, handwritten notes and a newspaper",
    title: "The Name That",
    accent: "connected us",
    layout: "bottom-right",
    text: "As there was no internet or texting at the time, the group had to figure out a way to notify members of upcoming meetings without “outing” them at work. This prompted someone to come up with the name “the GATT Group,” with GATT standing for “Gay Attracted To Trade” (and also cleverly standing for the General Agreement on Tariffs and Trade). The group’s new name allowed members to be notified about upcoming events without concerns about leaving messages with secretaries or members’ offices. Prior to each event, volunteers formed phone trees to notify the membership about where and when the group would next be meeting.",
  },
  {
    image: "/images/landing/where-it-all-began/4.png",
    alt: "A guest speaker addressing GATT members gathered in a living room",
    title: "A Community Built",
    accent: "on connection",
    layout: "center",
    text: "Over time, GATT meetings began to feature guest speakers, who would discuss ongoing trade negotiations and other trade matters. Members also used these meetings to network, exchange useful professional information, and help one another secure new professional opportunities. Not surprisingly, the group also fostered many close personal friendships (and even a marriage). Through its regularly held meetings, GATT became known as a safe space for LGBTQ+ professionals to meet up, network, and socialize.",
  },
  {
    image: "/images/landing/where-it-all-began/5.png",
    alt: "GATT members networking at a present-day event",
    title: "From Legacy to",
    accent: "leadership",
    layout: "top",
    text: "Through the years, GATT has helped many of its members shape their careers through networking, educational, and other opportunities. Although GATT initially kept a low-profile because of the risks associated with being openly gay in the workplace, today, the group has come to embrace its place among other trade-focused organizations in Washington, D.C. GATT now offers monthly events featuring a “trade talk” and networking opportunities, often times co-hosted with other organizations. In 2021, GATT became a 501(c)(3) non-profit organization. As GATT continues to grow and expand its offerings, it will always be proud of its heritage.",
  },
];

// Ancho de la imagen en desktop; la barra de progreso lo comparte.
const IMAGE_WIDTH = "lg:w-[min(72vw,120vh)]";

// Separacion horizontal entre slides mientras se desplazan.
const SLIDE_GAP_PX = 160;

// Recorrido vertical por cada transicion entre slides.
const SLIDE_SCROLL_VH = 1;

// Paso de un slide al siguiente: duracion y pausa sin rueda que se exige
// antes de aceptar otro paso (la inercia del trackpad no encadena slides).
const SNAP_MS = 1200;
const WHEEL_QUIET_MS = 160;
// Al acercarse a la seccion (desde History o desde Discover gatt) la pagina
// se desliza sola hasta dejarla fija en el primer o ultimo slide, y hace
// tope: para avanzar hay que soltar la rueda este tiempo y volver a girarla.
const ENTRY_ZONE_VH = 0.6;
const ENTRY_QUIET_MS = 300;
// Espera tras el ultimo scroll (barra, teclado, touch) para acomodar el slide.
const SETTLE_MS = 140;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export default function WhereItAllBegan() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Mientras la seccion esta fija, cada gesto pasa un slide completo con un
  // desplazamiento suave: nunca queda a medio camino entre dos slides. El
  // scroll vertical (animado) mueve los slides en horizontal.
  useEffect(() => {
    const last = SLIDES.length - 1;
    let animation = 0;
    let animating = false;
    let lastWheelAt = 0;
    let settleTimer = 0;
    let entryLocked = false;

    // Posiciones de scroll de la seccion: inicio y alto de cada slide.
    function metrics() {
      const wrapper = wrapperRef.current;
      if (!wrapper) return null;
      const top = wrapper.getBoundingClientRect().top + window.scrollY;
      const stepY = (wrapper.offsetHeight - window.innerHeight) / last;
      return { top, stepY, end: top + stepY * last };
    }

    function scrollToSlide(index: number) {
      const m = metrics();
      if (!m) return;
      scrollToY(m.top + Math.max(0, Math.min(last, index)) * m.stepY, m.stepY);
    }

    // Desplazamiento animado de la pagina; la duracion es proporcional a la
    // distancia (un slide completo dura SNAP_MS).
    function scrollToY(to: number, stepY: number) {
      const from = window.scrollY;
      if (Math.abs(to - from) < 1) return;
      cancelAnimationFrame(animation);
      animating = true;
      const start = performance.now();
      const duration =
        SNAP_MS * Math.min(1, Math.max(0.45, Math.abs(to - from) / stepY));
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        window.scrollTo(0, from + (to - from) * easeInOutCubic(t));
        if (t < 1) {
          animation = requestAnimationFrame(tick);
        } else {
          animating = false;
        }
      };
      animation = requestAnimationFrame(tick);
    }

    // Slide actual (fraccionario) o null si la seccion no esta fija.
    function position() {
      const m = metrics();
      if (!m) return null;
      const y = window.scrollY;
      if (y < m.top - 1 || y > m.end + 1) return null;
      return (y - m.top) / m.stepY;
    }

    function handleWheel(e: WheelEvent) {
      const now = performance.now();
      const previousWheelAt = lastWheelAt;
      const quiet = now - lastWheelAt > WHEEL_QUIET_MS;
      lastWheelAt = now;
      // Mientras la pagina se desliza sola no entra scroll nativo.
      if (animating) {
        e.preventDefault();
        return;
      }
      const m = metrics();
      if (!m || Math.abs(e.deltaY) < 1) return;
      const down = e.deltaY > 0;
      const y = window.scrollY;
      const zone = window.innerHeight * ENTRY_ZONE_VH;

      // Entrada: la seccion ya asoma y se sigue hacia ella.
      if ((down && y < m.top - 1 && y >= m.top - zone) || (!down && y > m.end + 1 && y <= m.end + zone)) {
        e.preventDefault();
        entryLocked = true;
        scrollToY(down ? m.top : m.end, m.stepY);
        return;
      }

      const pos = position();
      if (pos === null) return;
      // En los extremos el scroll sigue normal hacia fuera de la seccion.
      if ((down && pos >= last - 0.01) || (!down && pos <= 0.01)) {
        entryLocked = false;
        return;
      }
      e.preventDefault();
      if (entryLocked) {
        if (now - previousWheelAt < ENTRY_QUIET_MS) return;
        entryLocked = false;
      }
      if (!quiet) return;
      scrollToSlide(down ? Math.floor(pos + 0.01) + 1 : Math.ceil(pos - 0.01) - 1);
    }

    // Barra de scroll, teclado o touch: al terminar, acomoda el slide mas
    // cercano.
    function settle() {
      if (animating) return;
      const pos = position();
      if (pos === null) return;
      const nearest = Math.round(pos);
      if (Math.abs(pos - nearest) > 0.005) scrollToSlide(nearest);
    }

    let frame = 0;

    function update() {
      frame = 0;
      const wrapper = wrapperRef.current;
      const track = trackRef.current;
      const bar = barRef.current;
      if (!wrapper || !track || !bar) return;
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      const offset = progress * last;
      const step = wrapper.clientWidth + SLIDE_GAP_PX;
      track.style.transform = `translate3d(${-offset * step}px, 0, 0)`;
      bar.style.width = `${((1 + offset) / SLIDES.length) * 100}%`;
    }

    function requestUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function handleScroll() {
      requestUpdate();
      window.clearTimeout(settleTimer);
      if (!animating) settleTimer = window.setTimeout(settle, SETTLE_MS);
    }

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", requestUpdate);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(animation);
      window.clearTimeout(settleTimer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <section
      id="where-it-all-began"
      ref={wrapperRef}
      className="relative bg-fondo"
      style={{ height: `${(1 + (SLIDES.length - 1) * SLIDE_SCROLL_VH) * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ gap: SLIDE_GAP_PX }}
        >
          {SLIDES.map((slide) => {
            const layout = TITLE_LAYOUTS[slide.layout];
            return (
              <div
                key={slide.image}
                className="flex w-full shrink-0 flex-col gap-8 lg:flex-row lg:items-center lg:gap-0"
              >
                <div className={`w-full lg:shrink-0 ${IMAGE_WIDTH}`}>
                  <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]">
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      sizes="(min-width: 1024px) 72vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <h2
                      className={`font-heading absolute inset-0 flex px-6 text-[32px] font-normal leading-none text-white sm:text-[40px] lg:text-[48px] ${layout.position}`}
                    >
                      {layout.stacked ? (
                        <span>
                          <span className="block">{slide.title}</span>
                          <span className="font-script -mt-[0.2em] block px-1 text-[1.3em] leading-[1.1] text-morado">
                            {slide.accent}
                          </span>
                        </span>
                      ) : (
                        <span>
                          {slide.title}{" "}
                          <span className="font-script inline-block pl-2 pr-1 text-[1.3em] leading-normal text-morado">
                            {slide.accent}
                          </span>
                        </span>
                      )}
                    </h2>
                  </div>
                </div>

                {/* El parrafo se centra en el espacio restante para que la
                    separacion con la imagen sea igual a la del borde derecho. */}
                <div className="flex justify-center px-6 lg:flex-1 lg:px-10">
                  <p className="font-serif text-[16px] font-light leading-[1.3] text-texto sm:text-[18px] lg:max-w-[300px]">
                    {slide.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`mt-3 h-px w-full bg-texto/15 ${IMAGE_WIDTH}`}>
          <div ref={barRef} className="h-full bg-morado" />
        </div>
      </div>
    </section>
  );
}
