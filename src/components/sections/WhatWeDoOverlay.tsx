"use client";

import Image from "next/image";
import BackFolderOverlay, {
  type BackFolderOrigin,
} from "@/components/layout/BackFolderOverlay";
import FolderTab from "@/components/layout/FolderTab";

// Tono de la carpeta abierta segun el mockup (amarillo mas claro que el de la
// paleta, que se usa en el borde y la pestaña).
const OPEN_FOLDER_COLOR = "#fce48c";
// Tapa de la carpeta cerrada (un poco mas intensa que el interior).
const COVER_COLOR = "#fbd960";
const NOTEBOOK_HOLES = 9;

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
  highlighted,
  aboutDimmed,
}: {
  open: boolean;
  onClose: () => void;
  origin: BackFolderOrigin;
  highlighted: boolean;
  // About us esta oscura en el stack (por el hover sobre esta carpeta).
  aboutDimmed: boolean;
}) {
  return (
    <BackFolderOverlay
      open={open}
      onClose={onClose}
      origin={origin}
      highlighted={highlighted}
      titleId="what-we-do-title"
      closeLabel="Cerrar What We do"
      renderLabel={(className) => <WhatWeDoLabel className={className} />}
      closedTabFill="#2b2b2b"
      accent="var(--color-amarillo)"
      texture="what-we-do"
      coverColor={COVER_COLOR}
      interiorColor={OPEN_FOLDER_COLOR}
      coveringTab={
        <FolderTab fill={aboutDimmed ? "#2e2e2e" : "var(--color-azul)"}>
          <span
            className="font-heading text-[18px] lg:text-[22px]"
            style={{ color: aboutDimmed ? "var(--color-azul)" : "#ffffff" }}
          >
            About{" "}
            <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
              us
            </span>
          </span>
        </FolderTab>
      }
    >
      <div className="relative px-4 py-8 sm:px-8 lg:py-[3%] lg:pl-[3.5%] lg:pr-0">
        {/* Hoja de cuaderno con los agujeros de la carpeta. */}
        <div
          data-folder-enter="sheet"
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
          data-folder-enter="slide"
          data-folder-delay="150"
          className="relative mx-auto mt-8 w-[55%] max-w-[260px] lg:absolute lg:right-[3%] lg:top-[8%] lg:mt-0 lg:w-[21%] lg:max-w-[28vh]"
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
    </BackFolderOverlay>
  );
}
