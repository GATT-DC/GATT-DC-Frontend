"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { MemberProfile, ProfileLogo } from "@/components/sections/board-profiles";
import {
  MEMBER_PHOTO_SIZES,
  flyFrom,
  prefersReducedMotion,
  riseIn,
} from "@/components/sections/board-transition";

const IMAGE_DIR = "/images/landing/discover-gatt";
// Marcos claros (amarillo, blanco): la flecha de volver va oscura para leerse.
const LIGHT_FRAMES = new Set(["var(--color-amarillo)", "#ffffff"]);

// Logo de la organizacion o universidad; sin logo, su inicial en un circulo.
function Logo({ name, logo }: { name: string; logo?: ProfileLogo }) {
  if (logo) {
    return (
      <Image
        src={logo.src}
        alt=""
        width={logo.width}
        height={logo.height}
        className="h-10 w-10 shrink-0 object-contain"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="font-heading flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[18px] text-white"
    >
      {name.charAt(0)}
    </span>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section data-profile-enter>
      <h4 className="font-heading text-[18px] font-normal text-white lg:text-[20px]">
        {number}. {title}
      </h4>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

const PARAGRAPH = "font-serif text-[15px] font-light leading-[1.45] text-white/90 lg:text-[16px]";

// Vista de un miembro dentro de The gatt Board: foto y datos de contacto a la
// izquierda, y su perfil por secciones a la derecha.
export default function BoardMemberProfile({
  name,
  photo,
  frame,
  linkedin,
  profile,
  fromRect,
  onBack,
}: {
  name: string;
  photo: string;
  frame: string;
  linkedin: string;
  profile: MemberProfile;
  // Donde estaba la foto en la tarjeta: desde ahi viaja hasta el perfil.
  fromRect: DOMRect | null;
  // Recibe donde esta la foto en el perfil, para que vuelva a su tarjeta.
  onBack: (photoRect: DOMRect) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const firstName = name.split(" ")[0];

  // Al abrir el perfil (antes de pintarlo): la carpeta vuelve al principio,
  // con su espaciado de arriba; la foto viaja desde la tarjeta, lo demas entra
  // escalonado y el foco queda en "volver".
  useLayoutEffect(() => {
    let scroller = rootRef.current?.parentElement ?? null;
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) {
      scroller = scroller.parentElement;
    }
    scroller?.scrollTo({ top: 0 });
    backRef.current?.focus({ preventScroll: true });

    if (!prefersReducedMotion() && rootRef.current) {
      if (fromRect && frameRef.current) flyFrom(frameRef.current, fromRect);
      riseIn([...rootRef.current.querySelectorAll("[data-profile-enter]")], 160, 60);
    }
    // Solo al abrir: fromRect no cambia mientras el perfil esta abierto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sections: { title: string; content: ReactNode }[] = [
    {
      title: "Professional Background",
      content: (
        <div className="space-y-3">
          {profile.background.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className={PARAGRAPH}>
              {paragraph}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: "Areas of Expertise",
      content: (
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {profile.expertise.map((area) => (
            <li
              key={area}
              className="rounded-full border px-4 py-1.5 text-center font-serif text-[14px] font-light text-white lg:text-[15px]"
              style={{ borderColor: `color-mix(in srgb, ${frame} 55%, transparent)` }}
            >
              {area}
            </li>
          ))}
        </ul>
      ),
    },
  ];
  if (profile.education.length > 0) {
    sections.push({
      title: "Education",
      content: (
        <ul className="space-y-4">
          {profile.education.map((school) => (
            <li key={school.school} className="flex items-start gap-3">
              <Logo name={school.school} logo={school.logo} />
              <div className={PARAGRAPH}>
                <p>{school.school}</p>
                {school.degrees.map((degree) => (
                  <p key={degree}>{degree}</p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (profile.beyondTheOffice) {
    sections.push({
      title: "Beyond the Office",
      content: <p className={PARAGRAPH}>{profile.beyondTheOffice}</p>,
    });
  }
  if (profile.moreAbout) {
    sections.push({
      title: `More About ${firstName}`,
      content: <p className={PARAGRAPH}>{profile.moreAbout}</p>,
    });
  }

  return (
    <div
      ref={rootRef}
      className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,30%)_minmax(0,1fr)] lg:gap-[5%]"
    >
      {/* Foto, cargo y contacto. */}
      <div className="mx-auto w-full max-w-[340px] lg:max-w-none">
        <div
          ref={frameRef}
          className="relative rounded-[16px] p-[5px]"
          style={{ backgroundColor: frame }}
        >
          <div className="relative aspect-[984/1264] overflow-hidden rounded-[11px]">
            <Image
              src={`${IMAGE_DIR}/${photo}`}
              alt={`Portrait of ${name}`}
              fill
              sizes={MEMBER_PHOTO_SIZES}
              className="object-cover"
            />
          </div>
          <button
            ref={backRef}
            type="button"
            onClick={() => {
              const rect = frameRef.current?.getBoundingClientRect();
              if (rect) onBack(rect);
            }}
            aria-label="Back to the board"
            className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-transform hover:scale-110 focus-visible:scale-110"
            style={{ backgroundColor: frame, color: LIGHT_FRAMES.has(frame) ? "#111111" : "#ffffff" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>
        </div>

        <div data-profile-enter>
        <p className="mt-4 font-serif text-[14px]" style={{ color: frame }}>
          {profile.title}
        </p>
        <h3 className="font-heading text-[28px] font-normal uppercase leading-none text-white lg:text-[32px]">
          {name}
        </h3>

        <hr className="my-4 border-white/25" />
        <p className="font-serif text-[15px] font-light leading-snug text-white/90">
          {profile.position}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Logo name={profile.organization.name} logo={profile.organization.logo} />
          <div>
            <p className="font-serif text-[16px] leading-tight text-white">
              {profile.organization.name}
            </p>
            <p className="font-serif text-[12px] font-light text-white/60">
              {profile.organization.caption ?? "current role"}
            </p>
          </div>
        </div>

        <hr className="my-4 border-white/25" />
        <div className="flex items-center justify-between gap-4">
          <p className="font-serif text-[15px] text-white">Connect with {firstName}</p>
          <div className="flex items-center gap-3 text-white">
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on LinkedIn`}
              className="transition-opacity hover:opacity-80"
            >
              <LinkedInIcon />
            </a>
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                aria-label={`Email ${name}`}
                className="transition-opacity hover:opacity-80"
              >
                <MailIcon />
              </a>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Perfil por secciones. */}
      <div className="space-y-6">
        <p data-profile-enter className="font-serif text-[13px]" style={{ color: frame }}>
          Meet the Board
        </p>
        {sections.map((section, i) => (
          <Section key={section.title} number={i + 1} title={section.title}>
            {section.content}
          </Section>
        ))}
      </div>
    </div>
  );
}
