"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import RegisterForm from "@/components/register/RegisterForm";

// Barra superior y formulario del registro. Si ya hay algo escrito, antes de
// salir se pide confirmar:
// - Con el logo (navegacion dentro del sitio) se muestra un modal propio.
// - Al recargar o cerrar la pestaña el navegador solo permite su aviso
//   generico (no deja mostrar uno propio).
export default function RegisterShell() {
  const router = useRouter();
  const [inProgress, setInProgress] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!inProgress) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [inProgress]);

  function onLogoClick(e: MouseEvent<HTMLAnchorElement>) {
    // Ctrl/Cmd + clic abre otra pestaña: aqui no se pierde nada.
    if (!inProgress || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    setConfirmOpen(true);
  }

  return (
    <>
      {/* Mismo espaciado que la navbar de la landing, para que el logo y el
          cambio de tema no se muevan al pasar de una pagina a la otra. En
          desktop no ocupa alto, asi la tarjeta queda centrada en la pantalla. */}
      <header className="flex items-center justify-between gap-2 px-4 py-3 sm:absolute sm:inset-x-0 sm:top-0 sm:px-10 sm:py-4">
        <Link href="/" onClick={onLogoClick} className="shrink-0">
          <Image
            src="/images/landing/hero/Logo-gatt.png"
            alt="GATT DC"
            width={213}
            height={64}
            priority
            className="h-9 w-auto sm:h-16"
          />
        </Link>
        <ThemeToggle className="text-texto" />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-5 pt-3 sm:p-6">
        <RegisterForm onProgressChange={setInProgress} />
      </div>

      <LeaveDialog
        open={confirmOpen}
        onStay={() => setConfirmOpen(false)}
        onLeave={() => {
          setInProgress(false);
          router.push("/");
        }}
      />
    </>
  );
}

function LeaveDialog({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  const stayRef = useRef<HTMLButtonElement>(null);

  // Foco en "Stay" (la opcion segura) y cierre con Escape.
  useEffect(() => {
    if (!open) return;
    stayRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onStay();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onStay]);

  return (
    <div
      inert={!open}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        aria-hidden="true"
        onClick={onStay}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-title"
        aria-describedby="leave-description"
        className={`relative w-full max-w-[420px] rounded-[24px] border border-texto/10 bg-white p-7 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.45)] transition-[scale,translate] duration-200 ease-out dark:bg-superficie ${
          open ? "translate-y-0 scale-100" : "translate-y-2 scale-95"
        }`}
      >
        <h2
          id="leave-title"
          className="font-heading text-[24px] font-normal leading-tight text-texto"
        >
          Leave registration?
        </h2>
        <p
          id="leave-description"
          className="mt-2 font-serif text-[15px] font-light leading-[1.4] text-texto/80"
        >
          Your progress will be lost. If you leave now, you&apos;ll need to fill
          in your information again.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onLeave}
            className="rounded-full px-5 py-2 font-ui text-[15px] text-rojo transition-colors hover:bg-rojo/10"
          >
            Leave
          </button>
          <button
            ref={stayRef}
            type="button"
            onClick={onStay}
            className="rounded-full bg-primario px-5 py-2 font-ui text-[15px] text-white transition-colors hover:bg-primario-hover"
          >
            Stay and continue
          </button>
        </div>
      </div>
    </div>
  );
}
