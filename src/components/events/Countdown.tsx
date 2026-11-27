"use client";

import { useEffect, useState } from "react";

const UNITS = [
  { label: "days", ms: 86_400_000 },
  { label: "hours", ms: 3_600_000 },
  { label: "minutes", ms: 60_000 },
  { label: "seconds", ms: 1_000 },
];

// Cuenta regresiva hasta el inicio del evento. En el servidor (y en el primer
// render del navegador) muestra "--" para no romper la hidratacion; luego
// avanza cada segundo.
export default function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const left = now === null ? null : Math.max(new Date(to).getTime() - now, 0);
  // Cada unidad es lo que queda despues de quitar las unidades mayores.
  const values = UNITS.map((unit, i) => {
    if (left === null) return "--";
    const rest = i === 0 ? left : left % UNITS[i - 1].ms;
    return String(Math.floor(rest / unit.ms)).padStart(2, "0");
  });

  return (
    <div className="grid max-w-[560px] grid-cols-4 gap-3 sm:gap-4" role="timer" aria-live="off">
      {UNITS.map((unit, i) => (
        <div key={unit.label} className="text-center">
          <div className="flex aspect-square items-center justify-center rounded-[10px] bg-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] dark:bg-superficie dark:shadow-none">
            <span className="font-heading text-[30px] tabular-nums leading-none text-[#141414] dark:text-white sm:text-[36px]">{values[i]}</span>
          </div>
          <span className="mt-1.5 block font-ui text-[11px] text-texto/70">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
