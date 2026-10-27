"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import BackFolderOverlay, {
  type BackFolderOrigin,
} from "@/components/layout/BackFolderOverlay";
import FolderTab from "@/components/layout/FolderTab";
import Paperclip from "@/components/layout/Paperclip";
import Pushpin from "@/components/layout/Pushpin";

const IMAGE_DIR = "/images/landing/discover-gatt";

// Interior oscuro de la carpeta abierta y tapa naranja (segun el mockup).
const INTERIOR_COLOR = "#2d2d2d";
const COVER_COLOR = "var(--color-naranja)";
// Pestañas de las juntas anteriores (aun sin contenido).
const PAST_BOARD_COLOR = "#f8a47e";
const PAST_BOARDS = ["2025-2020", "2020-2010", "2010-2000", "2000-1970", "1948-1970"];

type Member = {
  name: string;
  role: string;
  photo: string;
  frame: string;
  // Perfil de LinkedIn; mientras no exista, el boton no lleva a ningun lado.
  linkedin?: string;
  // Adorno sobre la tarjeta (chinche o clip), como en el mockup.
  decoration?: "pin" | "clip";
};

const BOARD: Member[] = [
  { name: "Alexa Burr", role: "Chair", photo: "Alexa.png", frame: "var(--color-morado)" },
  { name: "Ryan Migeed", role: "Director of Financial Affairs", photo: "Ryan.png", frame: "var(--color-rojo)", decoration: "pin" },
  { name: "Jordan Strickler", role: "Director of External Relations", photo: "Jordan.png", frame: "var(--color-azul)" },
  { name: "Santiago Gomez", role: "Director of Event Planning", photo: "Santiago.png", frame: "var(--color-amarillo)", decoration: "clip" },
];

const ADVISORS: Member[] = [
  { name: "Thomas Abrhams", role: "Senior Advisor", photo: "Thomas.png", frame: "#ffffff" },
  { name: "Zachary Simmons", role: "Senior Advisor", photo: "ZACHARY.png", frame: "#ffffff" },
];

// En desktop, --card (ancho de cada tarjeta) se ajusta al alto de la pantalla
// para que la junta y los asesores quepan sin scroll, y el bloque de contenido
// mide lo que el grupo de 4 tarjetas con su separacion.
const CARD_GAP = "1.5rem";

function BoardLabel({ className = "" }: { className?: string }) {
  return (
    <span className={`font-heading ${className}`}>
      The{" "}
      <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
        gatt
      </span>{" "}
      Board
    </span>
  );
}

function ArrowBadge({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
      style={{ backgroundColor: color }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3"
      >
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </span>
  );
}

function MemberCard({
  member,
  delay,
  advisor = false,
}: {
  member: Member;
  delay: number;
  advisor?: boolean;
}) {
  const linkedinIcon = (
    <Image
      src={`${IMAGE_DIR}/linkedin.png`}
      alt=""
      width={16}
      height={16}
      className="h-4 w-4"
    />
  );
  const linkedinClass =
    "absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded transition-transform hover:scale-110 focus-visible:scale-110";

  return (
    <li
      data-folder-enter="rise"
      data-folder-delay={delay}
      className="relative flex w-full flex-col items-center text-center lg:w-[var(--card)]"
    >
      <div
        className="relative w-full rounded-[10px] p-[5px]"
        style={{ backgroundColor: member.frame }}
      >
        <div className="relative aspect-[984/1264] overflow-hidden rounded-[7px] bg-neutral-700">
          <Image
            src={`${IMAGE_DIR}/${member.photo}`}
            alt={`Portrait of ${member.name}`}
            fill
            sizes="(min-width: 1024px) 230px, 45vw"
            className="object-cover"
          />
        </div>
        <ArrowBadge color={advisor ? "#111111" : member.frame} />
        {member.linkedin ? (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`LinkedIn de ${member.name}`}
            className={linkedinClass}
          >
            {linkedinIcon}
          </a>
        ) : (
          <button
            type="button"
            aria-label={`LinkedIn de ${member.name}`}
            className={linkedinClass}
          >
            {linkedinIcon}
          </button>
        )}
      </div>
      {member.decoration === "pin" && (
        <Pushpin className="pointer-events-none absolute -left-3 -top-6 z-10 h-10 w-9 -rotate-12 drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)]" />
      )}
      {member.decoration === "clip" && (
        <Paperclip className="pointer-events-none absolute -right-4 -top-5 z-10 h-20 w-7 rotate-[8deg]" />
      )}
      <p className="font-heading mt-2 text-[14px] uppercase leading-tight text-white lg:mt-1.5 lg:text-[15px]">
        {member.name}
      </p>
      <p className="mt-1 w-full px-1 font-serif text-[13px] font-light leading-snug text-white/90 [overflow-wrap:anywhere]">
        {member.role}
      </p>
    </li>
  );
}

export default function BoardOverlay({
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
      titleId="board-title"
      closeLabel="Cerrar The gatt Board"
      renderLabel={(className) => <BoardLabel className={className} />}
      closedTabFill="#232323"
      accent="var(--color-naranja)"
      texture="board"
      coverColor={COVER_COLOR}
      interiorColor={INTERIOR_COLOR}
      coveringTab={
        <FolderTab fill="#272727">
          <span className="font-heading text-[18px] text-verde lg:text-[22px]">
            Our{" "}
            <span className="font-script inline-block px-0.5 text-[1.3em] leading-none">
              mission
            </span>
          </span>
        </FolderTab>
      }
      sideTabs={
        <div aria-hidden="true">
          {PAST_BOARDS.map((years, i) => (
            <span
              key={years}
              className="absolute left-full h-10"
              style={{ top: `calc(3% + 15.5rem + ${i} * 9.5rem)` }}
            >
              <span
                className="block origin-top-left"
                style={{ transform: "rotate(90deg) translateY(-100%)" }}
              >
                <FolderTab fill={PAST_BOARD_COLOR}>
                  <span className="font-heading text-[17px] text-white">
                    {years}
                  </span>
                </FolderTab>
              </span>
            </span>
          ))}
        </div>
      }
    >
      <div className="relative px-6 py-10 sm:px-10 lg:px-[5%] lg:py-[clamp(1rem,3vh,2.25rem)]">
        <div
          className="lg:mx-auto lg:w-[min(100%,calc(var(--card)*4+var(--gap)*3))]"
          style={
            {
              "--card": "clamp(140px, 19.6vh, 240px)",
              "--gap": CARD_GAP,
            } as CSSProperties
          }
        >
          <div data-folder-enter="rise" className="text-center">
            <h2
              id="board-title"
              className="font-heading text-[40px] font-normal leading-none text-white lg:text-[length:clamp(36px,5vh,52px)]"
            >
              The{" "}
              <span className="font-script inline-block px-1 text-[1.25em] leading-[0.9]">
                Gatt
              </span>{" "}
              Board
            </h2>
            <p className="font-serif text-[15px] font-light text-white">2026</p>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-6 lg:mt-[clamp(0.75rem,2.5vh,1.75rem)] lg:flex lg:gap-[var(--gap)]">
            {BOARD.map((member, i) => (
              <MemberCard key={member.name} member={member} delay={80 + i * 60} />
            ))}
          </ul>

          <hr
            data-folder-enter="rise"
            data-folder-delay={300}
            className="mt-8 border-dashed border-white/25 lg:mt-[clamp(0.75rem,2.5vh,2rem)]"
          />

          <h3
            data-folder-enter="rise"
            data-folder-delay={320}
            className="font-heading mt-6 text-[22px] font-normal text-white lg:mt-[clamp(0.5rem,2vh,1.5rem)] lg:text-[24px]"
          >
            Advisors to the{" "}
            <span className="font-script inline-block px-1 text-[1.3em] leading-none">
              Board
            </span>
          </h3>

          <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 lg:mt-[clamp(0.5rem,2vh,1.25rem)] lg:flex lg:gap-[var(--gap)]">
            {ADVISORS.map((member, i) => (
              <MemberCard
                key={member.name}
                member={member}
                delay={380 + i * 60}
                advisor
              />
            ))}
          </ul>
        </div>
      </div>
    </BackFolderOverlay>
  );
}
