"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { plainText } from "@/components/blog/ScriptText";
import { FormError } from "@/components/auth/ui";
import { EditableText, ImageIcon, ROUND_BUTTON, cleanPath } from "@/components/editor/InlineEdit";
import Countdown from "@/components/events/Countdown";
import EventTour from "@/components/events/EventTour";
import { EVENT, EventMap, HeroBackground, eventImage } from "@/components/events/EventParts";
import { ApiError, createEvent, deleteEvent, updateEvent, type EventInput, type EventStatus, type GattEvent } from "@/lib/api";
import { dcToIso, eventDate, eventHours, isoToDc } from "@/lib/event-time";
import { CONTACT_EMAIL } from "@/lib/site";

const FIELD =
  "mt-1 w-full rounded-[10px] border border-texto/20 bg-fondo px-3 py-2 font-ui text-[14px] text-texto outline-none transition-colors placeholder:text-texto/35 focus:border-amarillo";
const LABEL = "block font-ui text-[12px] uppercase tracking-wide text-texto/55";
const YELLOW =
  "inline-flex items-center rounded-full bg-amarillo px-5 py-1.5 font-ui text-[13px] font-medium text-[#141414] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const OUTLINE =
  "inline-flex items-center rounded-full border border-amarillo px-5 py-1.5 font-ui text-[13px] text-amarillo transition-colors hover:bg-amarillo/10 disabled:cursor-not-allowed disabled:opacity-50";
const SMALL =
  "inline-flex items-center rounded-full border border-texto/30 px-4 py-1.5 font-ui text-[13px] text-texto transition-colors hover:bg-texto/[0.06] disabled:opacity-50";

type Form = {
  name: string;
  description: string;
  imageUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  location: string;
  online: boolean;
  meetingUrl: string;
  capacity: string;
};

function toForm(event?: GattEvent): Form {
  if (!event) {
    return {
      name: "",
      description: "",
      imageUrl: "",
      date: "",
      startTime: "18:00",
      endTime: "",
      venueName: "",
      location: "",
      online: false,
      meetingUrl: "",
      capacity: "",
    };
  }
  const start = isoToDc(event.startsAt);
  return {
    name: event.name,
    description: event.description,
    imageUrl: event.imageUrl ?? "",
    date: start.date,
    startTime: start.time,
    endTime: event.endsAt ? isoToDc(event.endsAt).time : "",
    venueName: event.venueName ?? "",
    location: event.location ?? "",
    online: event.isOnline || Boolean(event.meetingUrl),
    meetingUrl: event.meetingUrl ?? "",
    capacity: event.capacity === null ? "" : String(event.capacity),
  };
}

// Los textos pegados (Figma, Word) traen espacios que no cortan linea; se
// cambian por espacios normales para que el texto se acomode.
const clean = (value: string) => value.replace(/[\u00a0\u2007\u202f]/g, " ").trim();
const orNull = (value: string) => clean(value) || null;

// Hora de fin: el mismo dia, o el siguiente si es antes que la de inicio
// (p. ej. de 9:00 PM a 1:00 AM).
function endIso(form: Form): string | null {
  if (!form.endTime) return null;
  const sameDay = dcToIso(form.date, form.endTime);
  if (form.endTime > form.startTime) return sameDay;
  return new Date(new Date(sameDay).getTime() + 24 * 60 * 60 * 1000).toISOString();
}

function toInput(form: Form, status: EventStatus): EventInput {
  return {
    name: clean(form.name),
    description: clean(form.description),
    imageUrl: orNull(cleanPath(form.imageUrl)),
    startsAt: dcToIso(form.date, form.startTime),
    endsAt: endIso(form),
    venueName: orNull(form.venueName),
    location: orNull(form.location),
    meetingUrl: form.online ? orNull(form.meetingUrl) : null,
    capacity: form.capacity.trim() ? Number(form.capacity) : null,
    status,
  };
}

function problem(form: Form): string | null {
  if (!form.name.trim()) return "Add a title for the event.";
  if (!form.description.trim()) return "Add a description.";
  if (!form.date || !form.startTime) return "Choose the date and the start time.";
  if (!form.online && !form.venueName.trim() && !form.location.trim()) {
    return "Add where it takes place, or mark it as an online event.";
  }
  if (form.online && form.meetingUrl.trim() && !/^https?:\/\/\S+$/i.test(form.meetingUrl.trim())) {
    return "The meeting link must start with https://";
  }
  if (form.capacity.trim() && !(Number.isInteger(Number(form.capacity)) && Number(form.capacity) >= 1)) {
    return "The capacity must be a whole number of at least 1 (or empty for no limit).";
  }
  return null;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      {children}
      {hint && <span className="mt-1 block font-ui text-[12px] text-texto/45">{hint}</span>}
    </label>
  );
}

// Editor de eventos para admins, sobre el mismo diseño de la pagina del
// evento: el titulo y la foto se editan sobre la cabecera.
export default function EventEditor({ event }: { event?: GattEvent }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(() => toForm(event));
  const [imageOpen, setImageOpen] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = (changes: Partial<Form>) => setForm((f) => ({ ...f, ...changes }));
  const status = event?.status ?? "draft";
  const startsAt = form.date && form.startTime ? dcToIso(form.date, form.startTime) : null;
  const place = form.location.trim() || form.venueName.trim();

  async function save(next: EventStatus, confirmText?: string) {
    const issue = problem(form);
    if (issue) {
      setError(issue);
      return;
    }
    if (confirmText && !window.confirm(confirmText)) return;
    setError(null);
    setSaving(next);
    try {
      const input = toInput(form, next);
      const saved = event ? await updateEvent(event.id, input) : await createEvent(input);
      router.push(`/events/${saved.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setSaving(null);
    }
  }

  async function remove() {
    if (!event || !window.confirm(`Delete "${plainText(event.name)}"? Its registrations are deleted too. This can't be undone.`)) return;
    setSaving("delete");
    try {
      await deleteEvent(event.id);
      router.push("/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 rounded-[14px] bg-texto/[0.06] px-4 py-3">
        <p className="font-ui text-[14px] text-texto/75">
          This is how the event page will look. Click the title or the text to change them, and the{" "}
          <ImageIcon className="inline-block h-4 w-4 align-[-3px]" /> button to set the photo. Wrap a word in <strong>*asterisks*</strong> to show
          it in <span className="font-script text-[1.3em]">script</span>. Press <strong>?</strong> for a step-by-step guide.
        </p>
        <EventTour />
      </div>

      {/* Cabecera: foto y titulo. */}
      <section data-tour="hero" className="relative isolate overflow-hidden rounded-[18px]">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#141414]">
          <HeroBackground src={eventImage(cleanPath(form.imageUrl))} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/40" />
        </div>
        <div className="absolute right-3 top-3 z-10">
          <button type="button" onClick={() => setImageOpen((o) => !o)} className={ROUND_BUTTON} aria-label="Change the header photo" aria-expanded={imageOpen}>
            <ImageIcon />
          </button>
        </div>
        {imageOpen && (
          <div className="absolute inset-x-3 top-14 z-10 rounded-[10px] bg-[#141414]/90 p-3 text-white sm:left-auto sm:w-96">
            <label className="block font-ui text-[11px] uppercase tracking-wide text-white/70">
              Header photo: path in media storage
              <input
                autoFocus
                value={form.imageUrl}
                onChange={(e) => set({ imageUrl: e.target.value })}
                onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && setImageOpen(false)}
                placeholder="events/monthly-mixer/hero.jpg"
                maxLength={1000}
                className="mt-1 block w-full border-b border-white/40 bg-transparent pb-1 font-ui text-[13px] normal-case tracking-normal text-white outline-none placeholder:text-white/40 focus:border-amarillo"
              />
            </label>
            <p className="mt-2 font-ui text-[12px] text-white/60">Leave it empty to use the Capitol photo.</p>
          </div>
        )}
        <div className="px-4 pb-10 pt-28 sm:pt-36">
          <div className="mx-auto max-w-3xl [&_textarea]:text-center">
            <EditableText
              value={form.name}
              onChange={(name) => set({ name })}
              placeholder="Event title, e.g. Monthly Networking *mixer*"
              label="Event title"
              className={`${EVENT.heroTitle} text-center [&_.font-script]:block [&_.font-script]:leading-[0.7]`}
              script
              maxLength={200}
            />
          </div>
        </div>
      </section>

      {/* Foto del evento: la misma se usa en la cabecera, las tarjetas y la
          pagina de inicio. */}
      <div data-tour="photo" className="mt-4 flex flex-col gap-2 rounded-[14px] bg-superficie p-4 sm:flex-row sm:items-end sm:gap-4">
        <label className="block flex-1">
          <span className={LABEL}>Event photo</span>
          <input
            value={form.imageUrl}
            onChange={(e) => set({ imageUrl: e.target.value })}
            placeholder="events/monthly-mixer/photo.jpg"
            maxLength={1000}
            className={FIELD}
          />
        </label>
        <p className="font-ui text-[12px] text-texto/50 sm:max-w-xs">
          Path in media storage (S3). It&apos;s used in the header, the event cards and the home page. Without one, a placeholder is shown.
        </p>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0 space-y-12">
          <section data-tour="description">
            <h2 className={EVENT.heading}>Description</h2>
            <div className="mt-4">
              <EditableText
                value={form.description}
                onChange={(description) => set({ description })}
                placeholder="What is the event about? Leave a blank line between paragraphs."
                label="Description"
                className={EVENT.body}
                multiline
                maxLength={10000}
              />
            </div>
          </section>

          <section data-tour="date">
            <h2 className={EVENT.heading}>Date</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Field label="Day">
                <input type="date" required value={form.date} onChange={(e) => set({ date: e.target.value })} className={FIELD} />
              </Field>
              <Field label="Starts">
                <input type="time" required value={form.startTime} onChange={(e) => set({ startTime: e.target.value })} className={FIELD} />
              </Field>
              <Field label="Ends (optional)">
                <input type="time" value={form.endTime} onChange={(e) => set({ endTime: e.target.value })} className={FIELD} />
              </Field>
            </div>
            <p className="mt-2 font-ui text-[12px] text-texto/50">Times are in Washington, D.C. time.</p>
            {startsAt && (
              <p className={`${EVENT.body} mt-3`}>
                {eventDate(startsAt)}
                <br />
                {eventHours(startsAt, endIso(form))}
              </p>
            )}
          </section>

          <section>
            <h2 className={EVENT.heading}>Questions?</h2>
            <p className={`${EVENT.body} mt-4`}>
              If you have any questions or need further assistance, please contact us at <span className="underline">{CONTACT_EMAIL}</span>.
            </p>
            <p className="mt-1 font-ui text-[12px] text-texto/45">This text is the same for every event.</p>
          </section>
        </div>

        <div className="min-w-0 space-y-12">
          <section>
            <h2 className={EVENT.heading}>Coming Soon</h2>
            <div className="mt-4">{startsAt ? <Countdown to={startsAt} /> : <p className={EVENT.body}>The countdown appears once you choose the date.</p>}</div>
          </section>

          <section data-tour="location">
            <h2 className={EVENT.heading}>Location</h2>
            {place && (
              <div className="mt-4 aspect-[16/10] overflow-hidden rounded-[10px] bg-superficie">
                <EventMap query={place} />
              </div>
            )}
            <div className="mt-4 space-y-2">
              <EditableText
                value={form.venueName}
                onChange={(venueName) => set({ venueName })}
                placeholder="Venue name, e.g. National Hall"
                label="Venue name"
                className="font-heading text-[22px] leading-tight text-texto dark:text-morado"
                maxLength={150}
              />
              <EditableText
                value={form.location}
                onChange={(location) => set({ location })}
                placeholder={"Address, e.g. 1717 Pennsylvania Avenue NW,\nWashington, DC 20006, USA"}
                label="Address"
                className={EVENT.body}
                multiline
                maxLength={300}
              />
            </div>
            <p className="mt-2 font-ui text-[12px] text-texto/45">The map comes from the address. Leave both empty for an online event.</p>

            <div data-tour="online" className="mt-6 rounded-[10px] bg-superficie p-4">
              <label className="flex items-center gap-3 font-ui text-[14px] text-texto">
                <input type="checkbox" checked={form.online} onChange={(e) => set({ online: e.target.checked })} className="h-4 w-4 accent-[var(--color-morado)]" />
                {place ? "It can also be joined online" : "It's an online event"}
              </label>
              {form.online && (
                <div className="mt-3">
                  <Field label="Meeting link" hint="Zoom, Google Meet… Only registered members see it.">
                    <input
                      type="url"
                      value={form.meetingUrl}
                      onChange={(e) => set({ meetingUrl: e.target.value })}
                      placeholder="https://zoom.us/j/…"
                      maxLength={500}
                      className={FIELD}
                    />
                  </Field>
                </div>
              )}
            </div>
          </section>

          <section data-tour="capacity">
            <Field label="Capacity (optional)" hint="Maximum number of registrations. Leave it empty for no limit.">
              <input
                type="number"
                min={1}
                step={1}
                value={form.capacity}
                onChange={(e) => set({ capacity: e.target.value })}
                placeholder="No limit"
                className={`${FIELD} max-w-[200px]`}
              />
            </Field>
            {event && (
              <p className="mt-2 font-ui text-[12px] text-texto/50">
                {event.registeredCount} {event.registeredCount === 1 ? "person has" : "people have"} registered so far.
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Barra de acciones fija abajo. */}
      <div data-tour="actions" className="sticky bottom-0 z-10 mt-10 border-t border-texto/10 bg-fondo/95 py-4 backdrop-blur">
        {error && (
          <div className="mb-3">
            <FormError>{error}</FormError>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => save("published")} disabled={saving !== null} className={YELLOW}>
              {saving === "published" ? "Saving…" : status === "published" ? "Save changes" : status === "cancelled" ? "Reopen event" : "Publish"}
            </button>
            {status !== "cancelled" && (
              <button type="button" onClick={() => save("draft")} disabled={saving !== null} className={OUTLINE}>
                {saving === "draft" ? "Saving…" : status === "published" ? "Unpublish (move to drafts)" : "Save draft"}
              </button>
            )}
            <Link href={event ? `/events/${event.slug}` : "/events"} className="font-ui text-[14px] text-texto/70 hover:underline">
              Cancel
            </Link>
          </div>
          {event && (
            <div className="flex flex-wrap gap-3">
              {status === "published" && (
                <button
                  type="button"
                  disabled={saving !== null}
                  onClick={() =>
                    save("cancelled", "Mark this event as cancelled? It stays visible with a notice and no one else can register.")
                  }
                  className={SMALL}
                >
                  {saving === "cancelled" ? "Saving…" : "Cancel event"}
                </button>
              )}
              <button type="button" onClick={remove} disabled={saving !== null} className={`${SMALL} border-rojo/60 text-rojo`}>
                {saving === "delete" ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
