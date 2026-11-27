import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plainText } from "@/components/blog/ScriptText";
import Countdown from "@/components/events/Countdown";
import EventActions from "@/components/events/EventActions";
import { EVENT, EventMap, normalSpaces, HeroBackground, HeroTitle, eventImage, mapsLink } from "@/components/events/EventParts";
import Footer from "@/components/layout/Footer";
import MemberHeader from "@/components/member/MemberHeader";
import type { GattEvent } from "@/lib/api";
import { eventDate, eventHours, eventPhase } from "@/lib/event-time";
import { formatTimestamp } from "@/lib/format";
import { getEvent, getEventAttendees, getMyProfile, getSessionUser } from "@/lib/session";
import { CONTACT_EMAIL } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const event = await getEvent((await params).slug).catch(() => null);
  return {
    title: event ? `${plainText(event.name)} — GATT DC` : "Event — GATT DC",
    description: event?.description.slice(0, 160),
  };
}

function Location({ event }: { event: GattEvent }) {
  const place = event.location ?? event.venueName;
  return (
    <section aria-labelledby="location-title">
      <h2 id="location-title" className={EVENT.heading}>
        Location
      </h2>
      {place && (
        <>
          <div className="mt-4 aspect-[16/10] overflow-hidden rounded-[10px] bg-superficie">
            <EventMap query={place} />
          </div>
          {event.venueName && <p className="font-heading mt-4 text-[22px] leading-tight text-texto dark:text-morado">{event.venueName}</p>}
          {event.location && <p className={`${EVENT.body} mt-1 whitespace-pre-line`}>{event.location}</p>}
          <a href={mapsLink(place)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-ui text-[13px] text-primario underline-offset-2 hover:underline">
            Open in Google Maps →
          </a>
        </>
      )}
      {(event.isOnline || event.meetingUrl) && (
        <div className="mt-4 rounded-[10px] bg-superficie p-5">
          <p className="font-heading text-[20px] text-texto">{event.isOnline ? "Online event" : "Also online"}</p>
          {event.meetingUrl ? (
            <a
              href={event.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-primario px-4 py-1.5 font-ui text-[13px] text-white hover:bg-primario-hover"
            >
              Join the meeting →
            </a>
          ) : (
            <p className={`${EVENT.body} mt-1`}>
              {event.isRegistered ? "The meeting link will be shared here before the event." : "The meeting link appears here once you register."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function When({ event }: { event: GattEvent }) {
  const phase = eventPhase(event.startsAt, event.endsAt);
  if (event.status === "cancelled") {
    return (
      <section>
        <h2 className={EVENT.heading}>Cancelled</h2>
        <p className={`${EVENT.body} mt-2`}>This event was cancelled. We&apos;re sorry for the inconvenience.</p>
      </section>
    );
  }
  return (
    <section aria-labelledby="when-title">
      <h2 id="when-title" className={EVENT.heading}>
        {phase === "upcoming" ? "Coming Soon" : phase === "live" ? "Happening now" : "This event has ended"}
      </h2>
      <div className="mt-4">
        {phase === "upcoming" ? (
          <Countdown to={event.startsAt} />
        ) : (
          <p className={EVENT.body}>{phase === "live" ? "The event is taking place right now." : `It took place on ${eventDate(event.startsAt)}.`}</p>
        )}
      </div>
    </section>
  );
}

// Pagina de un evento. Es publica (la landing enlaza aqui); inscribirse y
// marcar favorito piden sesion. Los borradores solo los ven los admins.
export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const [event, user] = await Promise.all([getEvent(slug), getSessionUser()]);
  if (!event) notFound();
  const isAdmin = user?.isAdmin === true;
  const profile = user ? await getMyProfile().catch(() => null) : null;
  const name = user ? (profile ? `${profile.firstName} ${profile.lastName}` : user.name) : null;
  const attendees = isAdmin ? await getEventAttendees(event.id).catch(() => []) : [];
  const paragraphs = normalSpaces(event.description).split(/\n\s*\n/);

  return (
    <div className="min-h-svh bg-fondo">
      <MemberHeader name={name} background={<HeroBackground src={eventImage(event.imageUrl)} />} signInNext={`/events/${event.slug}`}>
        <div className="px-4 pb-10 pt-16 sm:pb-12 lg:pt-28">
          <HeroTitle text={event.name} />
        </div>
      </MemberHeader>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-[6%] xl:py-10">
        {event.status === "draft" && (
          <p className="mb-4 rounded-[12px] bg-amarillo/15 px-4 py-2 font-ui text-[13px] text-texto">Draft — only admins can see this event.</p>
        )}
        <EventActions event={event} signedIn={user !== null} isAdmin={isAdmin} />

        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-20 xl:gap-28">
          <div className="min-w-0 space-y-12">
            <section aria-labelledby="description-title">
              <h2 id="description-title" className={EVENT.heading}>
                Description
              </h2>
              <div className={`${EVENT.body} mt-4 space-y-4`}>
                {paragraphs.map((paragraph, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </section>
            <section aria-labelledby="date-title">
              <h2 id="date-title" className={EVENT.heading}>
                Date
              </h2>
              <p className={`${EVENT.body} mt-4`}>
                {eventDate(event.startsAt)}
                <br />
                {eventHours(event.startsAt, event.endsAt)} <span className="text-texto/50">(Washington, D.C. time)</span>
              </p>
            </section>
            <section aria-labelledby="questions-title">
              <h2 id="questions-title" className={EVENT.heading}>
                Questions?
              </h2>
              <p className={`${EVENT.body} mt-4`}>
                If you have any questions or need further assistance, please contact us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-texto">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>

          <div className="min-w-0 space-y-12">
            <When event={event} />
            <Location event={event} />
            {isAdmin && (
              <section aria-labelledby="attendees-title" className="rounded-[14px] border border-texto/15 p-5">
                <h2 id="attendees-title" className="font-heading text-[20px] text-texto">
                  Registrations ({attendees.length}
                  {event.capacity !== null && ` of ${event.capacity}`})
                </h2>
                <p className="font-ui text-[12px] text-texto/50">Only admins see this list.</p>
                {attendees.length === 0 ? (
                  <p className="mt-3 font-ui text-[14px] text-texto/60">Nobody has registered yet.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-texto/10">
                    {attendees.map((attendee) => (
                      <li key={attendee.userId} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
                        <span className="font-ui text-[14px] text-texto">
                          {attendee.name} <span className="text-texto/55">· {attendee.email}</span>
                        </span>
                        <span className="font-ui text-[12px] text-texto/45">{formatTimestamp(attendee.registeredAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
