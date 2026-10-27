"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Marquee from "@/components/layout/Marquee";

// Avance de la recaudacion (0 a 100): el arco se rellena hasta aqui.
const PROGRESS = 50;
const MILESTONE_TEXT = "$4000 to Our Next Funding Milestone";

// Geometria del anillo (unidades del viewBox).
const SIZE = 520;
const CENTER = SIZE / 2;
const RADIUS = 172;
const STROKE = 34;
const TEXT_RADIUS = RADIUS + STROKE / 2 + 16;

// Circulo recorrido en sentido horario empezando arriba (para el texto curvo).
const TEXT_PATH = `M ${CENTER} ${CENTER - TEXT_RADIUS} A ${TEXT_RADIUS} ${TEXT_RADIUS} 0 1 1 ${CENTER} ${CENTER + TEXT_RADIUS} A ${TEXT_RADIUS} ${TEXT_RADIUS} 0 1 1 ${CENTER} ${CENTER - TEXT_RADIUS}`;

const TIERS = [
  { name: "Platinum", amount: "$1,500", color: "var(--color-texto)" },
  { name: "Gold", amount: "$5,000", color: "var(--color-amarillo)" },
  { name: "Bronze", amount: "$1,500", color: "#d9925f" },
  { name: "Silver", amount: "$3,000", color: "#8c8c8c" },
];

// Logos de los patrocinadores (carrusel infinito). Barnes & Thornburg tiene
// version de letras blancas (2.png, modo oscuro) y negras (1.png, modo claro).
// Falta el logo de BakerHostetler.
const SPONSORS: { logo: string; lightLogo?: string; name: string }[] = [
  { logo: "2.png", lightLogo: "1.png", name: "Barnes & Thornburg LLP" },
  { logo: "3.png", name: "Steptoe" },
  { logo: "4.png", name: "Cassidy Levy Kent" },
];

const FILL_TRANSITION =
  "stroke-dasharray 1.8s cubic-bezier(0.65, 0, 0.35, 1) 0.2s";

export default function MemberFundraiser() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

  // El anillo se rellena la primera vez que entra en pantalla.
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setFilled(true);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(ring);
    return () => observer.disconnect();
  }, []);

  const dash = `${filled ? PROGRESS : 0} 100`;

  return (
    <section
      id="member-fundraiser"
      className="relative bg-fondo px-6 py-24 sm:px-10 lg:px-[8%] lg:py-32"
    >
      <div
        ref={ringRef}
        className="relative mx-auto aspect-square w-full max-w-[600px]"
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 h-full w-full overflow-visible"
          role="img"
          aria-label={`Progreso de la recaudación: ${PROGRESS}% hacia la meta de ${MILESTONE_TEXT}`}
        >
          <defs>
            {/* Coordenadas antes de la rotacion de -90° del arco: en pantalla
                el degradado va de arriba (lima) hacia abajo (verde). */}
            <linearGradient
              id="fundraiser-fill"
              gradientUnits="userSpaceOnUse"
              x1={CENTER + RADIUS}
              y1={CENTER}
              x2={CENTER - RADIUS}
              y2={CENTER}
            >
              <stop offset="0%" stopColor="#bbff00" />
              <stop offset="100%" stopColor="#4fd400" />
            </linearGradient>
            {/* El texto curvo se revela junto con el arco. */}
            <mask id="fundraiser-reveal" maskUnits="userSpaceOnUse">
              <circle
                cx={CENTER}
                cy={CENTER}
                r={TEXT_RADIUS + 10}
                fill="none"
                stroke="white"
                strokeWidth={70}
                pathLength={100}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                className="motion-reduce:!transition-none"
                style={{ strokeDasharray: dash, transition: FILL_TRANSITION }}
              />
            </mask>
          </defs>

          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="var(--color-superficie)"
            strokeWidth={STROKE}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="url(#fundraiser-fill)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            pathLength={100}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            className={`motion-reduce:!transition-none ${filled ? "" : "opacity-0"}`}
            style={{ strokeDasharray: dash, transition: FILL_TRANSITION }}
          />

          <path id="fundraiser-text-path" d={TEXT_PATH} fill="none" />
          <g mask="url(#fundraiser-reveal)" aria-hidden="true">
            <text
              className="font-heading"
              fill="var(--color-texto)"
              fontSize={27}
              letterSpacing={0.5}
            >
              <textPath href="#fundraiser-text-path" startOffset="6%">
                {MILESTONE_TEXT}
              </textPath>
            </text>
          </g>
        </svg>

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-[opacity,transform] delay-700 duration-1000 ease-out motion-reduce:transition-none ${
            filled ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <p className="font-serif text-[14px] font-light text-texto sm:text-[16px]">
            GATT DC Member Fundraiser
          </p>
          <h2 className="font-heading mt-3 text-[30px] font-normal leading-none text-texto sm:text-[44px]">
            Shape the Next
            <span className="font-script block text-[1.3em] leading-[1.05]">
              chapter
            </span>
          </h2>
          <a
            href="#donate"
            className="mt-4 rounded-full bg-gradient-to-b from-[#bbff00] to-[#4fd400] px-6 py-2 font-ui text-[14px] font-medium text-[#102000] transition-[filter] hover:brightness-110 sm:text-[15px]"
          >
            Donate Now
          </a>
        </div>
      </div>

      <div className="mt-20 lg:mt-24">
        <h3 className="font-heading text-[22px] font-normal text-texto lg:text-[26px]">
          GATT DC welcomes interest in sponsoring our organization.
        </h3>
        <p className="mt-4 font-serif text-[17px] font-light leading-[1.35] text-texto lg:text-[19px]">
          Donations to GATT DC go toward supporting our mission of providing
          educational, networking, and career advancement opportunities to
          LGBTQ+ and allied professionals in international trade and
          development.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <li
              key={tier.name}
              className="flex items-center gap-4 rounded-md bg-superficie-2 px-5 py-4"
            >
              <span
                className="font-heading min-w-[5.5rem] shrink-0 text-[20px]"
                style={{ color: tier.color }}
              >
                {tier.name}
              </span>
              <span className="leading-tight">
                <span className="font-heading block text-[17px] text-texto">
                  {tier.amount}
                </span>
                <span className="block whitespace-nowrap font-serif text-[14px] font-light text-texto">
                  Annual Contribution
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 space-y-6 font-serif text-[17px] font-light leading-[1.35] text-texto lg:text-[19px]">
          <p>
            All sponsors will be recognized on the GATT DC website, in all email
            correspondence, and in certain social media (e.g., Facebook,
            LinkedIn) communications. All sponsors will also obtain access to
            certain GATT DC programs (both in-person and virtual) and receive a
            gift from GATT DC in recognition of the donation.
          </p>
          <p>All donations to GATT DC are tax deductible.</p>
        </div>
      </div>

      {/* Patrocinadores y novedades: ocupan todo el ancho de la seccion. En
          lg el padding de la seccion es 8% de su ancho, que equivale a
          8/0.84 del ancho del contenido. */}
      <div className="-mx-6 mt-20 sm:-mx-10 lg:-mx-[9.5238%] lg:mt-28">
        <Marquee speed={45} className="py-4">
          {SPONSORS.map((sponsor) => (
            <span key={sponsor.logo} className="mx-10 w-[220px] lg:mx-14 lg:w-[280px]">
              <Image
                src={`/images/landing/member-fundraiser/${sponsor.logo}`}
                alt={sponsor.name}
                width={5535}
                height={1845}
                sizes="300px"
                className={`h-auto w-full ${sponsor.lightLogo ? "hidden dark:block" : ""}`}
              />
              {sponsor.lightLogo && (
                <Image
                  src={`/images/landing/member-fundraiser/${sponsor.lightLogo}`}
                  alt={sponsor.name}
                  width={5535}
                  height={1845}
                  sizes="300px"
                  className="h-auto w-full dark:hidden"
                />
              )}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
