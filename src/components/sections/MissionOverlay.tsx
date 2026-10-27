"use client";

import Image from "next/image";
import BackFolderOverlay, {
  type BackFolderOrigin,
} from "@/components/layout/BackFolderOverlay";
import FolderTab from "@/components/layout/FolderTab";
import Paperclip from "@/components/layout/Paperclip";

// Interior verde oscuro de la carpeta abierta (segun el mockup); el borde, la
// pestaña y la hoja del frente usan el verde de la paleta.
const INTERIOR_COLOR = "#009a47";
// Hoja punteada (dot grid) de la tarjeta del texto.
const DOT_PAPER =
  "radial-gradient(circle, rgb(0 0 0 / 0.22) 0.8px, transparent 1.2px) 0 0 / 14px 14px, #f6f3ee";

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
      texture="mission"
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
      sideTabs={
        <span
          data-folder-enter="rise"
          data-folder-delay={250}
          className="pointer-events-none absolute -left-4 top-[16%] z-20"
        >
          <Paperclip className="h-20 w-7 -rotate-[8deg]" />
        </span>
      }
    >
      <div className="relative px-6 py-10 sm:px-10 lg:px-[5%] lg:py-[clamp(1.5rem,5vh,3rem)]">
        <h2
          id="mission-title"
          data-folder-enter="rise"
          className="font-heading text-[34px] font-normal leading-none text-white lg:text-[40px]"
        >
          Our{" "}
          <span className="font-script inline-block px-1 text-[1.3em] leading-normal">
            mission
          </span>
        </h2>

        <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-[3%]">
          <div
            data-folder-enter="sheet"
            data-folder-delay={80}
            className="rounded-lg px-7 py-12 shadow-[0_4px_14px_rgba(0,0,0,0.2)] sm:px-12 lg:w-[62%] lg:px-[8%] lg:py-[clamp(3rem,13vh,7rem)]"
            style={{ background: DOT_PAPER }}
          >
            <div className="space-y-6 font-serif text-[16px] leading-[1.3] text-[#1f1f1f] lg:text-[17px]">
              <p>
                To bring together LGBTQ+ professionals and allies in
                international trade, fostering a community built on meaningful
                connections, professional development, and the exchange of
                knowledge.
              </p>
              <p>
                Through education, networking, and collaboration, GATT DC
                creates opportunities for members to grow, engage, and
                contribute to a more connected and inclusive international
                trade community.
              </p>
            </div>
          </div>

          <div
            data-folder-enter="slide"
            data-folder-delay={180}
            className="relative mx-auto aspect-[613/756] w-[70%] max-w-[340px] overflow-hidden rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.2)] lg:mx-0 lg:mt-[clamp(2rem,7vh,4.5rem)] lg:w-[34%] lg:max-w-none"
          >
            <Image
              src="/images/landing/discover-gatt/ourmission.jpeg"
              alt="Group of GATT members posing together in a bright studio"
              fill
              sizes="(min-width: 1024px) 28vw, 70vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </BackFolderOverlay>
  );
}
