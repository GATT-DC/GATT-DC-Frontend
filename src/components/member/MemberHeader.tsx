"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { authClient } from "@/lib/auth-client";

// Secciones del area de miembros que aun no existen: se muestran para dar la
// idea del menu completo, pero no navegan.
const UPCOMING = ["Networking", "Job Opportunities"];

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

// Menu del miembro: su nombre abre "My profile" y "Sign out".
function UserMenu({ name }: { name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex max-w-[150px] items-center gap-2 rounded-full bg-primario px-3.5 py-2 font-ui text-[13px] text-white transition-colors hover:bg-primario-hover sm:max-w-[260px] sm:px-5 sm:text-[14px]"
      >
        <PersonIcon />
        <span className="truncate">{name}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-2xl border border-texto/10 bg-white py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.3)] dark:bg-superficie"
        >
          <Link
            role="menuitem"
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 font-ui text-[14px] text-texto hover:bg-texto/[0.06]"
          >
            My profile
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="block w-full px-4 py-2 text-left font-ui text-[14px] text-rojo hover:bg-texto/[0.06] disabled:opacity-50"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

// Encabezado del area de miembros: el skyline de Washington de fondo (u otra
// imagen, p. ej. la de un evento), el logo y el menu. Sin sesion (name null)
// muestra los botones para entrar o hacerse miembro. children: contenido
// sobre la imagen, debajo del menu (p. ej. el titulo de un evento).
export default function MemberHeader({
  name,
  background,
  children,
  signInNext,
}: {
  name: string | null;
  background?: ReactNode;
  children?: ReactNode;
  // A donde volver despues de iniciar sesion.
  signInNext?: string;
}) {
  return (
    <header className="relative isolate">
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-[#141414]">
        {background ?? (
          <Image
            src="/images/member/skyline.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[30%_center]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/35" />
      </div>
      {/* Logo pegado a la izquierda y menu a la derecha, con un margen corto. */}
      <div className="flex min-h-[110px] items-start justify-between gap-4 px-4 pb-8 pt-4 sm:px-6 lg:min-h-[130px] lg:px-8">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/landing/hero/Logo-gatt.png"
            alt="GATT DC — Home"
            width={213}
            height={64}
            className="h-9 w-auto sm:h-12"
          />
        </Link>
        <nav aria-label="Members" className="flex min-w-0 items-center gap-2 sm:gap-6">
          <Link href="/" className="hidden font-ui text-[14px] text-white hover:underline md:block">
            Home
          </Link>
          {UPCOMING.map((item) => (
            <span
              key={item}
              title="Coming soon"
              className="hidden cursor-default font-ui text-[14px] text-white/70 md:block"
            >
              {item}
            </span>
          ))}
          <Link href="/donate" className="hidden font-ui text-[14px] text-white hover:underline md:block">
            Donations
          </Link>
          <ThemeToggle className="text-white" />
          {name ? (
            <UserMenu name={name} />
          ) : (
            <>
              <Link
                href={signInNext ? `/login?${new URLSearchParams({ next: signInNext })}` : "/login"}
                className="whitespace-nowrap font-ui text-[14px] text-white hover:underline"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-full bg-primario px-4 py-1.5 font-ui text-[14px] text-white transition-colors hover:bg-primario-hover"
              >
                Become a member
              </Link>
            </>
          )}
        </nav>
      </div>
      {children}
    </header>
  );
}
