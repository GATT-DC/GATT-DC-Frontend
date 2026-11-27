"use client";

import Image from "next/image";
import BackFolderOverlay, {
  type BackFolderOrigin,
} from "@/components/layout/BackFolderOverlay";
import BinderClip from "@/components/layout/BinderClip";
import FolderTab from "@/components/layout/FolderTab";

// Interior gris oscuro de la carpeta abierta (segun el mockup); el borde, la
// pestaña y la hoja del frente usan el verde de la paleta.
const INTERIOR_COLOR = "#2d2d2d";
// Verde oscuro de la pinza que sujeta la ilustracion.
const CLIP_GREEN = "#1d7a45";

const PARAGRAPH =
  "mx-auto max-w-[520px] font-serif text-[16px] font-light leading-[1.35] text-white lg:max-w-[560px] lg:text-[18px]";

function MissionLabel({ className = "" }: { className?: string }) {
  return (
    <span className={`font-heading ${className}`}>
      Our{" "}
      <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
        mission
      </span>
    </span>
  );
}

export default function MissionOverlay({
  open,
  onClose,
  origin,
  highlighted,
}: {
  open: boolean;
  onClose: () => void;
  origin: BackFolderOrigin;
  highlighted: boolean;
}) {
  return (
    <BackFolderOverlay
      open={open}
      onClose={onClose}
      origin={origin}
      highlighted={highlighted}
      titleId="mission-title"
      closeLabel="Cerrar Our mission"
      renderLabel={(className) => <MissionLabel className={className} />}
      closedTabFill="#272727"
      accent="var(--color-verde)"
      texture="about-us"
      coverColor="var(--color-verde)"
      interiorColor={INTERIOR_COLOR}
      coveringTab={
        <FolderTab fill="#2b2b2b">
          <span className="font-heading text-[18px] text-amarillo lg:text-[22px]">
            What We{" "}
            <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
              do
            </span>
          </span>
        </FolderTab>
      }
      topEdge
      scroll
    >
      <div className="relative px-6 pb-16 pt-10 sm:px-10 lg:px-[5%] lg:pb-20 lg:pt-14">
        <h2
          id="mission-title"
          data-folder-enter="rise"
          className="font-heading text-center text-[40px] font-normal leading-none text-white lg:text-[length:clamp(48px,4.5vw,64px)]"
        >
          Our{" "}
          <span className="font-script inline-block px-1 text-[1.3em] leading-normal">
            mission
          </span>
        </h2>

        <p data-folder-enter="rise" data-folder-delay={80} className={`mt-6 ${PARAGRAPH}`}>
          To bring together LGBTQ+ professionals and allies in international
          trade, fostering a community built on meaningful connections,
          professional development, and the exchange of knowledge.
        </p>

        {/* Ilustracion con su marco blanco, sujeta por una pinza en el borde
            izquierdo. */}
        <div
          data-folder-enter="slide"
          data-folder-delay={180}
          className="relative mx-auto mt-10 w-[86%] max-w-[620px] sm:w-full lg:mt-12"
        >
          <Image
            src="/images/landing/discover-gatt/our-mission.jpg"
            alt="Illustration of LGBTQ+ professionals and allies talking over drinks at a lounge bar"
            width={1600}
            height={1065}
            sizes="(min-width: 1024px) 620px, 90vw"
            className="h-auto w-full shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
          />
          <BinderClip
            color={CLIP_GREEN}
            className="absolute -left-[28px] top-1/2 h-[46px] w-[34px] -translate-y-1/2 -rotate-90 sm:-left-[46px] sm:h-[76px] sm:w-[57px]"
          />
        </div>

        <p data-folder-enter="rise" data-folder-delay={280} className={`mt-10 ${PARAGRAPH} lg:mt-12`}>
          Through education, networking, and collaboration, GATT DC creates
          opportunities for members to grow, engage, and contribute to a more
          connected and inclusive international trade community.
        </p>
      </div>
    </BackFolderOverlay>
  );
}
