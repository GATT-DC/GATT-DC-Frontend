"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// Veces que se repite el contenido dentro de cada mitad de la pista, para que
// cada mitad sea mas ancha que la pantalla y el bucle nunca muestre un final.
const COPIES = 4;

// Carrusel infinito: la pista tiene dos mitades identicas y se desplaza la
// mitad de su ancho en bucle, asi el reinicio coincide exactamente con el
// inicio. La duracion se calcula con el ancho real para mantener la velocidad
// (px por segundo). Con "reducir movimiento" se queda quieto.
export default function Marquee({
  children,
  speed,
  className = "",
}: {
  children: ReactNode;
  speed: number;
  className?: string;
}) {
  const halfRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<number | null>(null);

  useLayoutEffect(() => {
    const half = halfRef.current;
    if (!half) return;
    const update = () => setDuration(half.offsetWidth / speed);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(half);
    return () => observer.disconnect();
  }, [speed]);

  const copies = Array.from({ length: COPIES }, (_, i) => (
    <div key={i} className="flex shrink-0 items-center">
      {children}
    </div>
  ));

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="flex w-max animate-[marquee_linear_infinite] motion-reduce:animate-none"
        style={{
          animationDuration: duration ? `${duration}s` : undefined,
          animationPlayState: duration ? "running" : "paused",
        }}
      >
        <div ref={halfRef} className="flex shrink-0 items-center">
          {copies}
        </div>
        <div aria-hidden="true" className="flex shrink-0 items-center">
          {copies}
        </div>
      </div>
    </div>
  );
}
