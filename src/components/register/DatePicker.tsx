"use client";

import { useEffect, useRef, useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// GATT DC se fundo en 1986: no hay fechas de ingreso anteriores.
const FIRST_YEAR = 1986;
// Alto aproximado del calendario abierto: si no cabe debajo del campo, se
// abre hacia arriba.
const POPOVER_HEIGHT = 390;

// Fechas como "YYYY-MM-DD" (lo mismo que un input de tipo date).
function toValue(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parse(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

function todayParts() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

// Selector de fecha propio (el del navegador no sigue el estilo del sitio):
// un campo con la fecha escrita y un calendario que se abre debajo, con
// meses, eleccion rapida de año y el atajo "Today". No permite fechas
// futuras.
export default function DatePicker({
  id,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const today = todayParts();
  const selected = value ? parse(value) : null;
  const [open, setOpen] = useState(false);
  const [choosingYear, setChoosingYear] = useState(false);
  const [above, setAbove] = useState(false);
  const [view, setView] = useState(() => selected ?? today);
  const rootRef = useRef<HTMLDivElement>(null);
  const yearsRef = useRef<HTMLDivElement>(null);

  // Se cierra al hacer clic fuera o con Escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Al abrir la lista de años, el año visible queda a la vista.
  useEffect(() => {
    if (!choosingYear) return;
    yearsRef.current
      ?.querySelector<HTMLElement>("[data-current]")
      ?.scrollIntoView({ block: "center" });
  }, [choosingYear]);

  function toggle() {
    if (!open) {
      setView(selected ?? today);
      setChoosingYear(false);
      const rect = rootRef.current?.getBoundingClientRect();
      if (rect) {
        const below = window.innerHeight - rect.bottom;
        setAbove(below < POPOVER_HEIGHT && rect.top > below);
      }
    }
    setOpen(!open);
  }

  function pick(year: number, month: number, day: number) {
    onChange(toValue(year, month, day));
    setOpen(false);
  }

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { ...v, year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const isFuture = (day: number) =>
    view.year > today.year ||
    (view.year === today.year &&
      (view.month > today.month || (view.month === today.month && day > today.day)));
  const atFirstMonth = view.year === FIRST_YEAR && view.month === 0;
  const atCurrentMonth = view.year === today.year && view.month === today.month;
  const years = Array.from(
    { length: today.year - FIRST_YEAR + 1 },
    (_, i) => today.year - i,
  );

  const label = selected
    ? `${MONTHS[selected.month]} ${selected.day}, ${selected.year}`
    : placeholder;

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex items-center justify-between text-left ${className} ${
          open ? "border-primario" : ""
        } ${selected ? "" : "text-texto/35"}`}
      >
        {label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 text-texto/60"
          aria-hidden="true"
        >
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      </button>

      <div
        role="dialog"
        aria-label="Choose a date"
        inert={!open}
        className={`absolute left-0 z-20 w-[300px] rounded-2xl border border-texto/10 bg-white p-4 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)] transition-[opacity,scale,translate] duration-200 ease-out dark:border-white/15 dark:bg-[#383838] ${
          above ? "bottom-full mb-2 origin-bottom-left" : "top-full mt-2 origin-top-left"
        } ${
          open
            ? "scale-100 opacity-100"
            : `pointer-events-none scale-95 opacity-0 ${above ? "translate-y-1" : "-translate-y-1"}`
        }`}
      >
        {/* Mes y año: el año abre una lista para saltar rapido. */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setChoosingYear(!choosingYear)}
            className="flex items-center gap-1 rounded-full px-2 py-1 font-heading text-[17px] text-texto transition-colors hover:bg-texto/[0.06]"
          >
            {MONTHS[view.month]} {view.year}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3.5 w-3.5 transition-transform ${choosingYear ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {!choosingYear && (
            <div className="flex gap-1">
              <NavButton label="Previous month" disabled={atFirstMonth} onClick={() => shiftMonth(-1)} path="m15 18-6-6 6-6" />
              <NavButton label="Next month" disabled={atCurrentMonth} onClick={() => shiftMonth(1)} path="m9 18 6-6-6-6" />
            </div>
          )}
        </div>

        {choosingYear ? (
          <div
            ref={yearsRef}
            className="mt-3 grid h-[232px] grid-cols-4 content-start gap-1.5 overflow-y-auto [scrollbar-width:thin]"
          >
            {years.map((year) => (
              <button
                key={year}
                type="button"
                data-current={year === view.year ? "" : undefined}
                onClick={() => {
                  setView((v) => ({
                    ...v,
                    year,
                    month: year === today.year ? Math.min(v.month, today.month) : v.month,
                  }));
                  setChoosingYear(false);
                }}
                className={`rounded-full py-1.5 font-ui text-[14px] transition-colors ${
                  year === view.year
                    ? "bg-primario text-white"
                    : "text-texto hover:bg-texto/[0.07]"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-7 text-center font-ui text-[12px] text-texto/45">
              {WEEKDAYS.map((d) => (
                <span key={d} className="py-1">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5 text-center">
              {Array.from({ length: firstWeekday }, (_, i) => (
                <span key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isSelected =
                  selected?.year === view.year &&
                  selected.month === view.month &&
                  selected.day === day;
                const isToday =
                  today.year === view.year && today.month === view.month && today.day === day;
                const disabled = isFuture(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => pick(view.year, view.month, day)}
                    aria-pressed={isSelected}
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full font-ui text-[14px] transition-colors ${
                      isSelected
                        ? "bg-primario text-white"
                        : disabled
                          ? "cursor-not-allowed text-texto/20"
                          : `text-texto hover:bg-texto/[0.07] ${isToday ? "ring-1 ring-inset ring-primario/60" : ""}`
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-3 flex justify-end border-t border-texto/10 pt-3">
          <button
            type="button"
            onClick={() => pick(today.year, today.month, today.day)}
            className="rounded-full px-3 py-1 font-ui text-[13px] text-primario transition-colors hover:bg-primario/10"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  path,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  path: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full text-texto transition-colors hover:bg-texto/[0.07] disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    </button>
  );
}
