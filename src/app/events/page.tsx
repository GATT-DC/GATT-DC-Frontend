import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { plainText } from "@/components/blog/ScriptText";
import { EventCard, PinIcon, shortPlace } from "@/components/events/EventParts";
import FeaturedEvent from "@/components/events/FeaturedEvent";
import PhotoPlaceholder from "@/components/layout/PhotoPlaceholder";
import MemberShell from "@/components/member/MemberShell";
import type { GattEvent } from "@/lib/api";
import { eventBadge, eventHours } from "@/lib/event-time";
import { requireMember } from "@/lib/member";
import { mediaUrl } from "@/lib/media";
import { getEvents } from "@/lib/session";

export const metadata: Metadata = {
  title: "Coming events — GATT DC",
};

const rise = (i: number) => ({ "--blog-delay": `${i * 80}ms` }) as CSSProperties;

function Badge({ className, children }: { className: string; children: string }) {
  return <span className={`rounded-full px-2.5 py-0.5 font-ui text-[11px] font-medium ${className}`}>{children}</span>;
}

function badges(event: GattEvent) {
  return (
    <>
      {event.status === "draft" && <Badge className="bg-amarillo text-[#141414]">Draft</Badge>}
      {event.status === "cancelled" && <Badge className="bg-rojo text-white">Cancelled</Badge>}
      {event.isRegistered && <Badge className="bg-verde text-white">Registered</Badge>}
      {event.isFavorite && <Badge className="bg-white/90 text-rojo">♥</Badge>}
      {event.spotsLeft === 0 && !event.isRegistered && <Badge className="bg-[#141414] text-white">Full</Badge>}
    </>
  );
}

function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <h2 className="font-heading text-[22px] leading-tight text-texto lg:text-[26px]">{children}</h2>
      {action}
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-[18px] bg-superficie p-6 font-serif text-[15px] text-texto/65">{children}</p>;
}

// Tarjeta tipo poster para "My Events": la foto grande y debajo la fecha.
function MyEventCard({ event }: { event: GattEvent }) {
  const photo = mediaUrl(event.imageUrl);
  const { day, month } = eventBadge(event.startsAt);
  return (
    <Link href={`/events/${event.slug}`} className="group block rounded-[14px] bg-superficie p-2.5 transition-transform hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[10px]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-full w-full object-cover grayscale transition-[filter] group-hover:grayscale-0" />
        ) : (
          <PhotoPlaceholder label="Event photo" className="h-full w-full" />
        )}
        <span className="absolute left-2 top-2 flex w-11 flex-col items-center rounded-[3px] bg-[#141414]/70 py-1 text-white backdrop-blur-sm">
          <span className="font-serif text-[20px] font-semibold leading-none">{day}</span>
          <span className="font-ui text-[10px] leading-tight">{month}</span>
        </span>
      </div>
      <div className="px-1 pb-1 pt-3">
        <p className="font-heading text-[16px] leading-tight text-texto">{plainText(event.name)}</p>
        <p className="mt-1 font-ui text-[12px] text-texto/60">{eventHours(event.startsAt, event.endsAt)}</p>
        <p className="mt-1 flex items-center gap-1 font-ui text-[11px] uppercase tracking-[0.1em] text-morado">
          <PinIcon className="h-3 w-3" />
          {shortPlace(event)}
        </p>
      </div>
    </Link>
  );
}

function CardGrid({ events, offset = 0 }: { events: GattEvent[]; offset?: number }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {events.map((event, i) => (
        <li key={event.id} className="blog-rise" style={rise(i + offset)}>
          <EventCard event={event} badges={badges(event)} />
        </li>
      ))}
    </ul>
  );
}

// "Coming events" del area de miembros: el proximo evento destacado, los
// siguientes y los del miembro. ?view=past muestra los pasados y, para los
// admins, ?view=drafts los borradores.
export default async function EventsPage({ searchParams }: PageProps<"/events">) {
  const { name, isAdmin } = await requireMember("/events");
  const requested = (await searchParams).view;
  const view = requested === "past" || (requested === "drafts" && isAdmin) ? requested : "main";

  const heading = (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <h1 className="font-heading text-[44px] font-normal leading-none text-texto lg:text-[56px]">
        <span className="font-script mr-4 text-[1.15em] text-morado">Coming</span>events
      </h1>
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/events?view=drafts" className="font-ui text-[13px] text-texto/70 underline-offset-2 hover:text-texto hover:underline">
            Drafts
          </Link>
          <Link href="/events/new" className="inline-flex items-center rounded-full bg-amarillo px-5 py-1.5 font-ui text-[13px] font-medium text-[#141414] hover:opacity-90">
            + New event
          </Link>
        </div>
      )}
    </div>
  );

  if (view !== "main") {
    let events = await getEvents(view === "past" ? { scope: "past" } : { includeDrafts: "true" });
    if (view === "drafts") events = events.filter((event) => event.status === "draft");
    return (
      <MemberShell name={name} current="/events" isAdmin={isAdmin}>
        {heading}
        <SectionTitle action={<Link href="/events" className="font-ui text-[13px] text-primario hover:underline">← All events</Link>}>
          {view === "past" ? "Past events" : "Drafts"}
        </SectionTitle>
        {events.length === 0 ? (
          <Empty>{view === "past" ? "There are no past events yet." : "There are no drafts. Events saved as draft appear here."}</Empty>
        ) : (
          <CardGrid events={events} />
        )}
      </MemberShell>
    );
  }

  const [upcoming, mine, saved] = await Promise.all([
    getEvents({ scope: "upcoming" }),
    getEvents({ mine: "registered" }),
    getEvents({ mine: "favorites" }),
  ]);
  const [featured, ...rest] = upcoming;
  const savedOnly = saved.filter((event) => !event.isRegistered);

  return (
    <MemberShell name={name} current="/events" isAdmin={isAdmin}>
      {heading}

      {featured ? (
        <div className="blog-rise">
          <FeaturedEvent event={featured} cta="Event Details" size="compact" />
        </div>
      ) : (
        <Empty>There are no upcoming events yet. Check back soon.</Empty>
      )}

      {rest.length > 0 && (
        <section className="mt-12 border-t border-texto/15 pt-10">
          <SectionTitle>Coming Events</SectionTitle>
          <CardGrid events={rest} offset={1} />
        </section>
      )}

      <section className="mt-12 border-t border-texto/15 pt-10">
        <SectionTitle>My Events</SectionTitle>
        {mine.length === 0 ? (
          <Empty>You haven&apos;t registered for any upcoming event. Open an event and press “Registration”.</Empty>
        ) : (
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
            {mine.map((event, i) => (
              <li key={event.id} className="blog-rise" style={rise(i)}>
                <MyEventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {savedOnly.length > 0 && (
        <section className="mt-12 border-t border-texto/15 pt-10">
          <SectionTitle>Saved</SectionTitle>
          <CardGrid events={savedOnly} />
        </section>
      )}

      <div className="mt-12 flex justify-end">
        <Link href="/events?view=past" className="font-ui text-[14px] text-texto/70 underline-offset-2 hover:text-texto hover:underline">
          See past events →
        </Link>
      </div>
    </MemberShell>
  );
}
