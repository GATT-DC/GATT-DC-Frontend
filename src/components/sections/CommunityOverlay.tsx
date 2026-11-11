"use client";

import Image from "next/image";
import Link from "next/link";
import BackFolderOverlay, {
  type BackFolderOrigin,
} from "@/components/layout/BackFolderOverlay";
import BinderClip from "@/components/layout/BinderClip";
import FolderTab from "@/components/layout/FolderTab";
import Paperclip from "@/components/layout/Paperclip";
import Tape from "@/components/layout/Tape";

const IMAGE_DIR = "/images/landing/community";

// Interior oscuro de la carpeta abierta y tapa roja (segun el mockup).
const INTERIOR_COLOR = "#2d2d2d";
const COVER_COLOR = "var(--color-rojo)";
// Rojo de las etiquetas y de "people together": el tono mas intenso de la
// paleta, que se lee igual sobre el gris de la carpeta y sobre el papel.
const LABEL_RED = "#d54954";
// Tarjetas de lo que ofrece la comunidad, sujetas con pinzas.
const CARD_ORANGE = "#ff8b5e";
const BENEFITS = [
  {
    title: "Build Meaningful Connections",
    text: "Connect with LGBTQ+ professionals and allies across the international trade community.",
  },
  {
    title: "Learn & Engage",
    text: "Attend exclusive talks, discussions, and networking events with industry professionals.",
  },
  {
    title: "Expand Your Opportunities",
    text: "Discover career opportunities, exchange ideas, and become part of a welcoming professional community.",
  },
];
// Hoja de cuaderno del final.
const NOTEBOOK_PAPER = "#f1ece4";
const NOTEBOOK_HOLES = 14;

export const COMMUNITY_PREVIEW =
  "What began in 1986 as a small gathering of LGBTQ+ professionals in international trade has grown into a vibrant community built on connection, belonging, and shared opportunities.";

type CollagePhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
  // Posicion en el collage de escritorio, en % del ancho y alto del collage.
  left: string;
  top: string;
  size: string;
  z: number;
  label?: { text: string; left: string; top: string };
  decoration?: "tape" | "clip";
};

// Las fotos vienen ya giradas y recortadas (PNG con fondo transparente), tal
// como van en el mockup.
const PHOTOS: CollagePhoto[] = [
  {
    src: "holiday-party.png", width: 1313, height: 1565,
    alt: "GATT members talking around a buffet table at a holiday party",
    left: "0%", top: "6%", size: "23%", z: 1, decoration: "tape",
  },
  {
    src: "panel-discussion.png", width: 1380, height: 1089,
    alt: "Two GATT members next to a screen with the agenda of a trade policy panel",
    left: "19.5%", top: "22%", size: "29%", z: 2,
    label: { text: "Panels & Discussions", left: "2%", top: "80%" },
  },
  {
    src: "seasonal-picnic.png", width: 1124, height: 960,
    alt: "Members chatting at an outdoor picnic in a park",
    left: "39%", top: "4%", size: "23.5%", z: 1,
    label: { text: "Seasonal Events", left: "41.5%", top: "0%" },
  },
  {
    src: "community-award.png", width: 1397, height: 981,
    alt: "Four members smiling together, one holding a GATT award",
    left: "52.5%", top: "35%", size: "29%", z: 3,
    label: { text: "Community Experiences", left: "64%", top: "81%" },
  },
  {
    src: "rooftop-friends.png", width: 1470, height: 1216,
    alt: "Four friends posing together on a rooftop at sunset",
    left: "70.5%", top: "2%", size: "29.5%", z: 2, decoration: "clip",
  },
];

function CommunityLabel({ className = "" }: { className?: string }) {
  return (
    <span className={`font-heading ${className}`}>
      Our{" "}
      <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
        community
      </span>
    </span>
  );
}

function Pill({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 font-serif text-[12px] text-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] sm:px-4 sm:text-[13px] lg:px-5 lg:text-[16px] ${className}`}
      style={{ backgroundColor: LABEL_RED }}
    >
      {children}
    </span>
  );
}

function Decoration({ type }: { type?: "tape" | "clip" }) {
  if (type === "tape") {
    return <Tape className="absolute left-[34%] top-[1%] z-10 h-[9%] w-[26%] -rotate-[8deg]" />;
  }
  if (type === "clip") {
    return <Paperclip className="absolute -right-[2%] top-[4%] z-10 h-[34%] w-[8%] rotate-[10deg]" />;
  }
  return null;
}

function PhotoImage({ photo, sizes }: { photo: CollagePhoto; sizes: string }) {
  return (
    <Image
      src={`${IMAGE_DIR}/${photo.src}`}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      sizes={sizes}
      className="h-auto w-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
    />
  );
}

// Collage de escritorio: fotos superpuestas en las posiciones del mockup.
function Collage() {
  return (
    <div className="relative mx-auto hidden aspect-[61/24] w-full max-w-[1000px] md:block">
      {PHOTOS.map((photo, i) => (
        <div
          key={photo.src}
          data-folder-enter="slide"
          data-folder-delay={120 + i * 70}
          className="absolute"
          style={{ left: photo.left, top: photo.top, width: photo.size, zIndex: photo.z }}
        >
          <PhotoImage photo={photo} sizes="(min-width: 1024px) 24vw, 30vw" />
          <Decoration type={photo.decoration} />
        </div>
      ))}
      {PHOTOS.filter((photo) => photo.label).map((photo) => (
        <span
          key={photo.label!.text}
          data-folder-enter="rise"
          data-folder-delay={500}
          className="absolute z-10"
          style={{ left: photo.label!.left, top: photo.label!.top }}
        >
          <Pill>{photo.label!.text}</Pill>
        </span>
      ))}
    </div>
  );
}

// En celular el collage no se lee: las fotos van de a dos, con su etiqueta.
function MobilePhotos() {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:hidden">
      {PHOTOS.map((photo, i) => (
        <li
          key={photo.src}
          data-folder-enter="rise"
          data-folder-delay={100 + i * 60}
          className={`relative flex flex-col items-center ${i === PHOTOS.length - 1 ? "col-span-2 mx-auto w-[60%]" : ""}`}
        >
          <div className="relative w-full">
            <PhotoImage photo={photo} sizes="(min-width: 640px) 45vw, 60vw" />
            <Decoration type={photo.decoration} />
          </div>
          {photo.label && <Pill className="-mt-3 relative z-10">{photo.label.text}</Pill>}
        </li>
      ))}
    </ul>
  );
}

export default function CommunityOverlay({
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
      titleId="community-title"
      closeLabel="Cerrar Our community"
      renderLabel={(className) => <CommunityLabel className={className} />}
      closedTabFill="#1f1f1f"
      accent="var(--color-rojo)"
      texture="community"
      coverColor={COVER_COLOR}
      interiorColor={INTERIOR_COLOR}
      coveringTab={
        <FolderTab fill="#232323">
          <span className="font-heading text-[18px] text-naranja lg:text-[22px]">
            The{" "}
            <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
              gatt
            </span>{" "}
            Board
          </span>
        </FolderTab>
      }
      topEdge
      scroll
    >
      <div className="relative px-5 pb-16 pt-10 sm:px-10 lg:px-[5%] lg:pb-24 lg:pt-14">
        <h2
          id="community-title"
          data-folder-enter="rise"
          className="font-heading text-center text-[40px] font-normal leading-[0.95] text-white lg:text-[length:clamp(52px,5vw,76px)]"
        >
          Welcome{" "}
          <span className="font-script inline-block px-1 text-[1.15em] leading-none">
            to our
          </span>
          <br />
          Community
        </h2>

        <div className="mt-10 lg:mt-14">
          <Collage />
          <MobilePhotos />
        </div>

        <div
          data-folder-enter="rise"
          data-folder-delay={450}
          className="mx-auto mt-12 max-w-[760px] space-y-5 font-serif text-[16px] font-light leading-[1.4] text-white lg:mt-16 lg:text-[19px]"
        >
          <p>{COMMUNITY_PREVIEW}</p>
          <p>
            Four decades later, our community continues to evolve. Today, we
            invite you to discover who we are, the connections we’ve built, and
            the people who make GATT DC what it is.
          </p>
        </div>

        {/* Lo que ofrece la comunidad: tarjetas sujetas con pinzas. */}
        <ul className="mx-auto mt-20 grid max-w-[300px] grid-cols-1 gap-x-[2.5%] gap-y-16 sm:max-w-[920px] sm:grid-cols-3 lg:mt-24">
          {BENEFITS.map((benefit, i) => (
            <li
              key={benefit.title}
              data-folder-enter="rise"
              data-folder-delay={500 + i * 80}
              className="relative flex aspect-square flex-col justify-end rounded-[3px] px-[8%] pb-[9%] shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
              style={{ backgroundColor: CARD_ORANGE }}
            >
              <BinderClip className="absolute -top-[54px] left-1/2 h-[76px] w-[57px] -translate-x-1/2 sm:-top-[46px] sm:h-[64px] sm:w-[48px] lg:-top-[60px] lg:h-[84px] lg:w-[63px]" />
              <h3 className="font-heading text-[22px] font-normal leading-[1.05] text-white sm:text-[17px] lg:text-[length:clamp(20px,1.9vw,28px)]">
                {benefit.title}
              </h3>
              <p className="mt-3 font-serif text-[14px] font-light leading-[1.3] text-white sm:mt-2 sm:text-[12px] lg:mt-4 lg:text-[length:clamp(13px,1.1vw,16px)]">
                {benefit.text}
              </p>
            </li>
          ))}
        </ul>

        {/* Hoja de cuaderno con los agujeros de la carpeta. */}
        <div
          data-folder-enter="sheet"
          data-folder-delay={550}
          className="relative mx-auto mt-14 max-w-[820px] py-12 pl-14 pr-6 text-center shadow-[0_6px_16px_rgba(0,0,0,0.3)] sm:pl-20 sm:pr-14 lg:mt-20 lg:w-[75%] lg:py-16"
          style={{ backgroundColor: NOTEBOOK_PAPER }}
        >
          <div
            aria-hidden="true"
            className="absolute bottom-5 left-3 top-5 flex flex-col justify-between sm:left-5"
          >
            {Array.from({ length: NOTEBOOK_HOLES }, (_, i) => (
              <span
                key={i}
                className="block h-3.5 w-3.5 rounded-full sm:h-4 sm:w-4"
                style={{ backgroundColor: INTERIOR_COLOR }}
              />
            ))}
          </div>

          <h3 className="font-heading text-[28px] font-normal leading-none text-[#141414] lg:text-[44px]">
            A community that brings
            <span
              className="font-script mt-1 block text-[1.35em] leading-[0.9]"
              style={{ color: LABEL_RED }}
            >
              people together
            </span>
          </h3>

          <div className="relative mx-auto mt-8 w-full max-w-[540px] lg:mt-10">
            <Tape className="absolute -top-3 left-1/2 z-10 h-7 w-[22%] -translate-x-1/2 rotate-[-2deg]" />
            <div className="overflow-hidden rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
              <Image
                src={`${IMAGE_DIR}/group-together.jpg`}
                alt="Six GATT members smiling together on a rooftop overlooking Washington, D.C."
                width={1808}
                height={1062}
                sizes="(min-width: 1024px) 540px, 80vw"
                className="h-auto w-full"
              />
            </div>
          </div>

          <Link
            href="/register"
            className="mt-8 inline-flex rounded-full bg-primario px-5 py-2 font-ui text-[14px] text-white transition-colors hover:bg-primario-hover lg:mt-10 lg:text-[15px]"
          >
            Become a Member
          </Link>
        </div>
      </div>
    </BackFolderOverlay>
  );
}
