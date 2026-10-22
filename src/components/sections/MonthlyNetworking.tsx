import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import PhotoPlaceholder from "@/components/layout/PhotoPlaceholder";

const IMAGE_DIR = "images/landing/monthly-networking";

// Usa la primera imagen que haya en la carpeta del evento; mientras no exista
// se muestra un placeholder.
function findMainImage() {
  try {
    const file = fs
      .readdirSync(path.join(process.cwd(), "public", IMAGE_DIR))
      .find((name) => /\.(png|jpe?g|webp|avif)$/i.test(name));
    return file ? `/${IMAGE_DIR}/${file}` : null;
  } catch {
    return null;
  }
}

// Eventos de muestra hasta tener los reales.
const UPCOMING_EVENTS = [
  { id: "gala-1", title: "Annual GATT Gala", location: "WASHINGTON D.C.", day: "14", month: "SEP" },
  { id: "gala-2", title: "Annual GATT Gala", location: "WASHINGTON D.C.", day: "14", month: "SEP" },
  { id: "gala-3", title: "Annual GATT Gala", location: "WASHINGTON D.C.", day: "14", month: "SEP" },
];

// Solapa de carpeta en el borde superior derecho de la foto: la foto sigue
// dentro de la solapa.
const FOLDER_CLIP =
  "polygon(0 22px, 56% 22px, calc(56% + 22px) 0, calc(97% - 22px) 0, 97% 22px, 100% 22px, 100% 100%, 0 100%)";

function DateBadge({
  day,
  month,
  className = "",
}: {
  day: string;
  month: string;
  className?: string;
}) {
  return (
    <div
      className={`flex w-11 flex-col items-center rounded-[3px] py-1 text-white ${className}`}
    >
      <span className="font-serif text-[22px] font-semibold leading-none">
        {day}
      </span>
      <span className="font-ui text-[11px] leading-tight">{month}</span>
    </div>
  );
}

export default function MonthlyNetworking() {
  const mainImage = findMainImage();

  return (
    <section
      id="monthly-networking"
      className="relative bg-fondo px-6 py-24 sm:px-10 lg:px-[9%] lg:py-32"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="font-heading text-[40px] font-normal leading-none text-texto lg:text-[52px]">
            Monthly Networking
            <span className="font-script block pl-1 text-[1.3em] leading-[1.05]">
              mixer
            </span>
          </h2>
          <p className="mt-6 pl-1 font-ui text-[14px] tracking-[0.12em] text-verde lg:mt-8">
            WASHINGTON D.C.
          </p>
          <p className="mt-6 max-w-[480px] font-serif text-[17px] font-light leading-[1.3] text-texto lg:mt-8 lg:text-[19px]">
            Join GATT this September for an evening of networking,
            conversation, and connection with professionals across the
            international trade community.
          </p>
          <div className="mt-10 flex items-start">
            <a
              href="#registration"
              className="flex items-center gap-2 rounded-full bg-primario px-5 py-2.5 font-ui text-[16px] text-white transition-colors hover:bg-primario-hover"
            >
              Registration
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* La foto final ya viene recortada con la solapa (PNG con
            transparencia), asi que se muestra completa; el placeholder
            dibuja la solapa con clip-path. */}
        <div
          className={`relative w-full ${mainImage ? "aspect-[524/437]" : "aspect-[5/4] overflow-hidden"}`}
          style={mainImage ? undefined : { clipPath: FOLDER_CLIP }}
        >
          {mainImage ? (
            <Image
              src={mainImage}
              alt="Members laughing and talking at a GATT networking mixer"
              fill
              sizes="(min-width: 1024px) 41vw, 100vw"
              className="object-contain"
            />
          ) : (
            <PhotoPlaceholder
              label="Foto: Monthly Networking mixer"
              className="h-full w-full"
            />
          )}
          <DateBadge
            day="14"
            month="SEP"
            className="absolute right-[3%] top-[10%] bg-white/35 backdrop-blur-sm"
          />
        </div>
      </div>

      <hr className="mt-16 border-texto/20 lg:mt-20" />

      <div className="mt-8 flex justify-end">
        <a
          href="#events"
          className="flex items-center gap-2 rounded-full bg-primario-hover px-5 py-2 font-ui text-[16px] text-white transition-colors hover:bg-primario"
        >
          View Events
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {UPCOMING_EVENTS.map((event) => (
          <li
            key={event.id}
            className="relative aspect-[4/3] rounded-[4px] bg-superficie"
          >
            {/* Fecha en una esquina recortada de la tarjeta. */}
            <DateBadge
              day={event.day}
              month={event.month}
              className="absolute left-0 top-0 bg-[#6b6b6b] shadow-[0_0_0_5px_var(--color-fondo)]"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-4">
              <div>
                <span className="block font-heading text-[18px] leading-tight text-texto">
                  {event.title}
                </span>
                <span className="mt-1 block pl-2 font-ui text-[11px] tracking-[0.12em] text-texto/85">
                  {event.location}
                </span>
              </div>
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primario text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
