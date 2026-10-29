"use client";

import { useEffect, useRef, useState } from "react";

// Color de fondo del video: la pantalla se rellena con el mismo para que no se
// note el borde del rectangulo del video.
const VIDEO_BACKGROUND = "#050709";
const FADE_MS = 700;
// Se ve en cada carga de la pagina (al entrar o recargar), pero no al volver
// a la landing navegando dentro del sitio.
let playedThisLoad = false;

// Animacion de apertura del logo al entrar a la pagina. Al terminar (o con
// "Skip") se desvanece y deja ver la landing.
export default function IntroSplash() {
  const [phase, setPhase] = useState<"playing" | "leaving" | "done">(() =>
    playedThisLoad ? "done" : "playing",
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  // Si ya se vio en esta carga, al montar (no cambia aunque React repita el
  // efecto en desarrollo).
  const skipRef = useRef(playedThisLoad);

  useEffect(() => {
    if (skipRef.current) return;
    playedThisLoad = true;
    // Con "reducir movimiento" no se muestra (oculta por CSS, ver globals.css).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
      return;
    }
    const root = document.documentElement;
    // Sin scroll mientras se ve la apertura.
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    // Si el navegador bloquea la reproduccion, no se queda la pantalla negra.
    videoRef.current?.play().catch(() => setPhase("leaving"));
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    document.documentElement.style.overflow = "";
    const id = window.setTimeout(() => setPhase("done"), FADE_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      data-intro
      className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity ease-out"
      style={{
        backgroundColor: VIDEO_BACKGROUND,
        opacity: phase === "leaving" ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setPhase("leaving")}
        // El borde del video trae una linea tenue de compresion: se recorta.
        className="w-[min(60vw,460px)] [clip-path:inset(3px)]"
      >
        <source src="/images/landing/GATT-DC-negro-v4.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={() => setPhase("leaving")}
        className="absolute bottom-6 right-6 rounded-full px-4 py-1.5 font-ui text-[14px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        Skip
      </button>
    </div>
  );
}
