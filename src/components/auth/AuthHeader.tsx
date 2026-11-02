"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import ThemeToggle from "@/components/layout/ThemeToggle";

// Barra superior de las paginas de cuenta. Mismo espaciado que la navbar de
// la landing, para que el logo y el cambio de tema no se muevan al pasar de
// una pagina a la otra. En desktop no ocupa alto, asi la tarjeta queda
// centrada en la pantalla.
export default function AuthHeader({
  onLogoClick,
}: {
  onLogoClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
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
  );
}
