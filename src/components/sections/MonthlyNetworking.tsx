import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { EventCard } from "@/components/events/EventParts";
import FeaturedEvent, { FOLDER_CLIP } from "@/components/events/FeaturedEvent";
import PhotoPlaceholder from "@/components/layout/PhotoPlaceholder";
import type { GattEvent } from "@/lib/api";
import { BACKEND_URL } from "@/lib/backend";

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

// Proximos eventos publicados, el mas cercano primero. La landing es publica:
// se piden sin sesion y se refrescan cada minuto. Si el backend no responde,
// la seccion se muestra con el texto de siempre.
async function upcomingEvents(): Promise<GattEvent[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/events?scope=upcoming&limit=4`, {
      next: { revalidate: 60 },
    });
    return response.ok ? ((await response.json()) as GattEvent[]) : [];
  } catch {
    return [];
  }
}

function ArrowIcon({ d }: { d: string }) {
  return (
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
      <path d={d} />
    </svg>
  );
}

// Sin eventos publicados: el texto y la foto de siempre.
function Fallback() {
  const mainImage = findMainImage();
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="min-w-0">
        <h2 className="font-heading text-[40px] font-normal leading-none text-texto lg:text-[52px]">
          Monthly Networking
          <span className="font-script block pl-1 text-[1.3em] leading-[1.05]">mixer</span>
        </h2>
        <p className="mt-6 pl-1 font-ui text-[14px] uppercase tracking-[0.12em] text-verde lg:mt-8">Washington D.C.</p>
        <p className="mt-6 max-w-[480px] font-serif text-[17px] font-light leading-[1.3] text-texto lg:mt-8 lg:text-[19px]">
          Join GATT this September for an evening of networking, conversation, and connection with professionals across the international
          trade community.
        </p>
        <div className="mt-10 flex items-start">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-full bg-primario px-5 py-2.5 font-ui text-[16px] text-white transition-colors hover:bg-primario-hover"
          >
            Become a member
            <ArrowIcon d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
          </Link>
        </div>
      </div>
      {/* La foto final ya viene recortada con la solapa (PNG con
          transparencia), asi que se muestra completa; el placeholder dibuja
          la solapa con clip-path. */}
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
          <PhotoPlaceholder label="Foto: Monthly Networking mixer" className="h-full w-full" />
        )}
      </div>
    </div>
  );
}

// Eventos en la landing: el mas proximo destacado y los siguientes en
// tarjetas.
export default async function MonthlyNetworking() {
  const [featured, ...more] = await upcomingEvents();

  return (
    <section id="monthly-networking" className="relative bg-fondo px-6 py-24 sm:px-10 lg:px-[9%] lg:py-32">
      {featured ? <FeaturedEvent event={featured} cta="Registration" /> : <Fallback />}

      <hr className="mt-16 border-texto/20 lg:mt-20" />

      <div className="mt-8 flex justify-end">
        <Link
          href="/events"
          className="flex items-center gap-2 rounded-full bg-primario-hover px-5 py-2 font-ui text-[16px] text-white transition-colors hover:bg-primario"
        >
          View Events
          <ArrowIcon d="M5 12h14M13 6l6 6-6 6" />
        </Link>
      </div>

      {/* Los siguientes eventos, despues del destacado. */}
      {more.length > 0 && (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {more.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
