"use client";

import { useEffect, useRef, useState } from "react";
import StaggerText from "@/components/layout/StaggerText";

export default function History() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Esta seccion esta fuera del ScrollPager: la aparicion se activa al entrar
  // en pantalla (y se reinicia al salir, igual que en las primeras secciones).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="history"
      ref={sectionRef}
      className="relative flex w-full justify-center bg-fondo px-6 py-36"
    >
      <p className="font-serif max-w-72 text-center text-[20px] font-light leading-[1.25] text-texto">
        <StaggerText
          active={visible}
          lines={[
            "Our history is a story of courage, community, and connection shaping GATT from a discreet gathering into a lasting home for LGBTQ+ professionals in international trade.",
          ]}
        />
      </p>
    </section>
  );
}
