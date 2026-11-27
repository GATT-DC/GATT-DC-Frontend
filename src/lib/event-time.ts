// Fechas y horas de los eventos, siempre en la hora de Washington, D.C.
// (America/New_York), sin importar la zona del servidor o del navegador.

export const EVENT_TIME_ZONE = "America/New_York";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

type Parts = { year: number; month: number; day: number; hour: number; minute: number };

// Fecha y hora de pared en Washington para un instante.
export function dcParts(value: string | Date): Parts {
  const parts = Object.fromEntries(PARTS.formatToParts(new Date(value)).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

// "2026-11-10" y "18:00" (hora de Washington) -> instante en ISO.
export function dcToIso(date: string, time: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  // Se ajusta por la diferencia entre la hora de pared pedida y la que
  // resulta en Washington (dos pasadas cubren el cambio de horario).
  let guess = wall;
  for (let i = 0; i < 2; i++) {
    const p = dcParts(new Date(guess));
    guess += wall - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  }
  return new Date(guess).toISOString();
}

// Instante -> { date: "2026-11-10", time: "18:00" } en Washington (para los
// campos del editor).
export function isoToDc(value: string): { date: string; time: string } {
  const p = dcParts(value);
  return { date: `${p.year}-${pad(p.month)}-${pad(p.day)}`, time: `${pad(p.hour)}:${pad(p.minute)}` };
}

function weekday(p: Parts) {
  return WEEKDAYS[new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay()];
}

function clock(p: Parts) {
  const h = p.hour % 12 || 12;
  return `${h}:${pad(p.minute)} ${p.hour < 12 ? "AM" : "PM"}`;
}

// "November 10, 2026"
export function eventDate(value: string): string {
  const p = dcParts(value);
  return `${MONTHS[p.month - 1]} ${p.day}, ${p.year}`;
}

// "Monday: 6:00 PM - 10:00 PM" (o solo la de inicio si no hay fin; si
// termina otro dia, la fecha del fin).
export function eventHours(startsAt: string, endsAt: string | null): string {
  const start = dcParts(startsAt);
  if (!endsAt) return `${weekday(start)}: ${clock(start)}`;
  const end = dcParts(endsAt);
  const sameDay = start.year === end.year && start.month === end.month && start.day === end.day;
  return sameDay
    ? `${weekday(start)}: ${clock(start)} - ${clock(end)}`
    : `${weekday(start)}: ${clock(start)} - ${eventDate(endsAt)}, ${clock(end)}`;
}

// Para la insignia de fecha de las tarjetas: { day: "14", month: "SEP" }.
export function eventBadge(value: string): { day: string; month: string } {
  const p = dcParts(value);
  return { day: String(p.day), month: MONTHS[p.month - 1].slice(0, 3).toUpperCase() };
}

// En que momento esta el evento.
export function eventPhase(startsAt: string, endsAt: string | null, now = Date.now()): "upcoming" | "live" | "ended" {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt ?? startsAt).getTime();
  if (now < start) return "upcoming";
  if (now <= end || (!endsAt && now - start < 3 * 60 * 60 * 1000)) return "live";
  return "ended";
}
