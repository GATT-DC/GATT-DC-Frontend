"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/site";

// Carpetas de Discover gatt: todas viven en esa seccion de la landing.
const DISCOVER_ITEMS = ["About us", "What We do", "Our mission", "The gatt Board", "Our community"];

const ITEM =
  "font-heading flex w-full items-center justify-between border-b border-texto/20 py-3 text-left text-[28px] leading-tight text-texto transition-colors hover:text-texto/70 sm:text-[32px]";

function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-7 w-7 shrink-0" aria-hidden="true">
      <path d="M4 12h16" />
      <path d="M12 4v16" className={`origin-center transition-transform duration-300 ${open ? "scale-y-0" : ""}`} />
    </svg>
  );
}

// Menu lateral de la landing: se abre desde la derecha con las secciones,
// el contacto y las redes. Cierra con la X, con Esc, tocando fuera o al
// elegir una opcion.
export default function SideMenu({
  open,
  onClose,
  signedIn,
}: {
  open: boolean;
  onClose: () => void;
  signedIn: boolean;
}) {
  const titleId = useId();
  const discoverId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [discoverOpen, setDiscoverOpen] = useState(false);

  // Abierto: sin scroll de la pagina, foco en cerrar y Esc para salir.
  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      returnTo?.focus();
    };
  }, [open, onClose]);

  const link = (href: string, children: ReactNode, className = ITEM) => (
    <Link href={href} onClick={onClose} className={className}>
      {children}
    </Link>
  );

  return (
    <div
      inert={!open}
      // pointer-events-auto: la navbar que lo contiene deja pasar los clics.
      // Al abrir se ve de inmediato (para poder enfocar la X); al cerrar se
      // oculta cuando termina de salir.
      className={`pointer-events-auto fixed inset-0 z-[60] ${open ? "visible" : "invisible transition-[visibility] delay-500"}`}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-fondo text-texto shadow-[-12px_0_40px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:w-[min(560px,100%)] lg:w-[45%] lg:max-w-[640px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-4 sm:px-8">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-texto/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          </button>
          <Link
            href={signedIn ? "/profile" : "/login"}
            onClick={onClose}
            aria-label={signedIn ? "My profile" : "Sign in"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primario text-white transition-colors hover:bg-primario-hover"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </Link>
        </div>

        <nav aria-labelledby={titleId} className="mt-8 px-6 sm:px-12">
          <p id={titleId} className="border-b border-texto/20 pb-2 font-serif text-[15px] text-texto/80">
            Menu
          </p>
          <ul>
            <li>{link("/#history", "GATT History")}</li>
            <li>
              <button
                type="button"
                onClick={() => setDiscoverOpen((v) => !v)}
                aria-expanded={discoverOpen}
                aria-controls={discoverId}
                className={ITEM}
              >
                Discover Gatt
                <PlusIcon open={discoverOpen} />
              </button>
              <div
                id={discoverId}
                inert={!discoverOpen}
                className={`grid transition-[grid-template-rows] duration-300 ${discoverOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <ul className="min-h-0 overflow-hidden">
                  {DISCOVER_ITEMS.map((item) => (
                    <li key={item}>
                      {link(
                        "/#discover-gatt",
                        item,
                        "block border-b border-texto/10 py-2.5 pl-5 font-serif text-[18px] text-texto/85 transition-colors hover:text-texto",
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            <li>{link("/#monthly-networking", "Events")}</li>
            <li>{link("/#member-fundraiser", "Donations")}</li>
            <li>{signedIn ? link("/profile", "My profile") : link("/register", "Become a Member")}</li>
          </ul>
        </nav>

        {/* Contacto, redes y politica de privacidad, al fondo del panel. */}
        <div className="mt-auto grid grid-cols-2 gap-6 px-6 pb-8 pt-16 font-serif text-[15px] sm:px-8">
          <div>
            <p className="font-ui text-[12px] text-texto/60">Contact Info</p>
            <p className="mt-1 select-all">{CONTACT_EMAIL}</p>
            {/* Inactivo por ahora: falta definir a donde lleva (formulario,
                correo...). */}
            <span
              aria-disabled="true"
              className="mt-6 inline-flex cursor-default items-center gap-1.5 font-ui text-[13px] underline underline-offset-2"
            >
              Inquiries
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 6 4 4-4 4-1.4-1.4 1.6-1.6H7v-2h6.2l-1.6-1.6L13 8Z" />
              </svg>
            </span>
          </div>
          <div className="flex flex-col">
            <p className="font-ui text-[12px] text-texto/60">Socials</p>
            <ul className="mt-1 space-y-1">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.name}>
                  {social.href ? (
                    <a href={social.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {social.name}
                    </a>
                  ) : (
                    social.name
                  )}
                </li>
              ))}
            </ul>
            {link(
              "/privacy-policy",
              "Privacy Policy",
              "mt-6 self-end font-ui text-[13px] underline underline-offset-2 hover:text-texto/70",
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
