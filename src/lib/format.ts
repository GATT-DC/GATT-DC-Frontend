// Formatos de montos y fechas armados a mano: Intl puede dar resultados
// distintos en Node y en el navegador y romper la hidratacion.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "3500.5" -> "$3,500.50"
export function formatMoney(amount: string | number): string {
  const [whole, cents] = Number(amount).toFixed(2).split(".");
  return `$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${cents}`;
}

// "2026-03-01" (o una fecha ISO completa) -> "Mar 1, 2026"
export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

// Un instante (p. ej. cuando se creo la cuenta) como fecha en la hora de
// Washington, D.C.: igual en el servidor y en el navegador.
const DC_DATE = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
export function formatTimestamp(iso: string): string {
  const parts = Object.fromEntries(DC_DATE.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return `${MONTHS[Number(parts.month) - 1]} ${Number(parts.day)}, ${parts.year}`;
}

// Fecha de hoy como "YYYY-MM-DD" (para el campo de fecha de un aporte).
export function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
