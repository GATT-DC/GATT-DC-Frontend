"use client";

import { useEffect, useRef, useState } from "react";

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
      className="relative flex min-h-svh items-center justify-center bg-fondo px-6 py-24 sm:px-10"
    >
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
    </section>
  );
}
