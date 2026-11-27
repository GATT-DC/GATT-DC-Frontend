"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, cancelEventRegistration, registerForEvent, setEventFavorite, type GattEvent } from "@/lib/api";
import { eventPhase } from "@/lib/event-time";

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
      <path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3 4.5 6.6 4.5c2.1 0 3.5 1.2 4.4 2.5.9-1.3 2.3-2.5 4.4-2.5 3.6 0 5.4 3.7 3.8 6.9C19 15.6 12 20 12 20Z" />
    </svg>
  );
}

const GREEN = "inline-flex items-center gap-2 rounded-full bg-verde px-5 py-1.5 font-ui text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";
const MUTED = "inline-flex items-center gap-2 rounded-full border border-texto/30 px-4 py-1.5 font-ui text-[13px] text-texto/70";

// Barra bajo la cabecera del evento: volver, favorito e inscripcion (y
// "Edit" para los admins).
export default function EventActions({ event, signedIn, isAdmin }: { event: GattEvent; signedIn: boolean; isAdmin: boolean }) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(event.isFavorite);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const here = `/events/${event.slug}`;
  const signIn = `/login?${new URLSearchParams({ next: here })}`;
  const phase = eventPhase(event.startsAt, event.endsAt);
  const closed = event.status !== "published" || phase === "ended" || (phase === "live" && !event.endsAt);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleFavorite() {
    if (!signedIn) {
      router.push(signIn);
      return;
    }
    const next = !favorite;
    setFavorite(next);
    try {
      await setEventFavorite(event.id, next);
    } catch {
      setFavorite(!next);
    }
  }

  let registration: ReactNode;
  if (event.status === "cancelled") {
    registration = <span className={MUTED}>Event cancelled</span>;
  } else if (event.isRegistered) {
    registration = (
      <span className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-verde/15 px-4 py-1.5 font-ui text-[13px] font-medium text-verde">✓ You&apos;re registered</span>
        {!closed && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (window.confirm("Cancel your registration for this event?")) void run(() => cancelEventRegistration(event.id));
            }}
            className="font-ui text-[13px] text-texto/70 underline-offset-2 hover:text-texto hover:underline disabled:opacity-50"
          >
            Cancel registration
          </button>
        )}
      </span>
    );
  } else if (phase === "ended") {
    registration = <span className={MUTED}>This event has ended</span>;
  } else if (closed) {
    registration = <span className={MUTED}>Registration closed</span>;
  } else if (event.spotsLeft === 0) {
    registration = <span className={MUTED}>Event full</span>;
  } else if (!signedIn) {
    registration = (
      <Link href={signIn} className={GREEN}>
        Registration <ArrowRight />
      </Link>
    );
  } else {
    registration = (
      <button type="button" disabled={busy} onClick={() => run(() => registerForEvent(event.id))} className={GREEN}>
        {busy ? "Registering…" : "Registration"} <ArrowRight />
      </button>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={signedIn ? "/events" : "/#monthly-networking"}
          aria-label="Back to events"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primario text-white transition-colors hover:bg-primario-hover"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {isAdmin && (
            <Link href={`/events/${event.slug}/edit`} className="inline-flex items-center rounded-full bg-amarillo px-4 py-1.5 font-ui text-[13px] font-medium text-[#141414] hover:opacity-90">
              Edit
            </Link>
          )}
          {event.status !== "draft" && (
            <button
              type="button"
              onClick={toggleFavorite}
              aria-pressed={favorite}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              title={favorite ? "Remove from favorites" : "Add to favorites"}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${favorite ? "bg-rojo text-white" : "bg-texto/10 text-texto/60 hover:text-rojo"}`}
            >
              <HeartIcon filled={favorite} />
            </button>
          )}
          {registration}
        </div>
      </div>
      {event.spotsLeft !== null && event.status === "published" && phase === "upcoming" && !event.isRegistered && event.spotsLeft > 0 && (
        <p className="mt-2 text-right font-ui text-[12px] text-texto/55">
          {event.spotsLeft} {event.spotsLeft === 1 ? "spot" : "spots"} left
        </p>
      )}
      {error && <p className="mt-2 text-right font-ui text-[13px] text-rojo">{error}</p>}
    </div>
  );
}
