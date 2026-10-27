"use client";

import { useEffect, useRef, useState } from "react";
import Marquee from "@/components/layout/Marquee";

// Novedades de la franja naranja (se desplaza en bucle).
const NEWS = [
  "300+ Active Members",
  "5 New Members This Month",
  "Welcome, New Members!",
];

export default function JoinCommunity() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Aparicion al entrar en pantalla (y se reinicia al salir), como History.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const reveal = (delay: number) => ({
    className: `transition-[opacity,translate] duration-1000 ease-out motion-reduce:transition-none ${
      visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
    }`,
    style: { transitionDelay: visible ? `${delay}ms` : "0ms" },
  });

  return (
    <section
      id="join-community"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col bg-fondo pt-16 sm:pt-24"
    >
      {/* La seccion ocupa una pantalla completa: la franja queda bajo la
          navbar (pt-16 / sm:pt-24 = su alto) y el contenido se centra en el resto. */}
      <Marquee speed={85} className="bg-naranja py-1.5">
        {NEWS.map((item) => (
          <span
            key={item}
            className="font-heading flex items-center whitespace-nowrap text-[18px] text-white lg:text-[20px]"
          >
            <span className="px-8">{item}</span>
            <span aria-hidden="true" className="text-white/80">
              ·
            </span>
          </span>
        ))}
      </Marquee>

      <div className="flex flex-1 items-center justify-center px-6 py-16 sm:px-10">
        <div className="max-w-[600px] text-center">
          <h2 className="font-heading text-[44px] font-normal leading-none text-texto lg:text-[56px]">
            <span style={reveal(0).style} className={`block ${reveal(0).className}`}>
              Join Our
            </span>
            <span
              style={reveal(150).style}
              className={`font-script -mt-3 block text-[1.6em] leading-[1.05] ${reveal(150).className}`}
            >
              community
            </span>
          </h2>
          <p
            style={reveal(300).style}
            className={`mt-4 font-serif text-[16px] font-light leading-[1.3] text-texto lg:text-[18px] ${reveal(300).className}`}
          >
            Connect with people shaping the future of international trade. Meet
            LGBTQ+ and allied professionals, build meaningful connections, and
            find opportunities to grow your career in international trade and
            development.
          </p>
          <div style={reveal(450).style} className={`mt-7 ${reveal(450).className}`}>
            <a
              href="#become-member"
              className="inline-block rounded-full bg-primario px-5 py-2 font-ui text-[15px] text-white transition-colors hover:bg-primario-hover"
            >
              Become a Member
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
