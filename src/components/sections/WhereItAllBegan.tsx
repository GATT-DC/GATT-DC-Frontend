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

// Recorrido vertical por cada transicion entre slides (mas alto = mas lento).
const SLIDE_SCROLL_VH = 1;

export default function WhereItAllBegan() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // El scroll vertical nativo mueve los slides en horizontal de forma lineal,
  // como un scroll normal pero de lado.
  useEffect(() => {
    const last = SLIDES.length - 1;
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

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
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
