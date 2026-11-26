"use client";

import { useState } from "react";
import { initials } from "@/components/admin/UserBadges";

// Foto del usuario (la de Google o LinkedIn) o sus iniciales.
export default function Avatar({ name, image, size = 40 }: { name: string; image: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (image && !failed) {
    return (
      // Fotos de otros dominios: sin optimizar.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        style={style}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span aria-hidden="true" style={style} className="font-heading flex shrink-0 items-center justify-center rounded-full bg-texto/10 text-texto/70">
      {initials(name)}
    </span>
  );
}
