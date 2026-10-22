"use client";

import { useLayoutEffect } from "react";
import type { RefObject } from "react";

// Limite para que un contenido que no se ajusta (p. ej. con anchos en
// porcentaje que crecen al reducir) no termine diminuto.
const MIN_ZOOM = 0.75;

// En desktop las carpetas abiertas no tienen scroll: si el contenido es mas
// alto que la carpeta, se reduce (zoom) lo justo para que quepa completo. Al
// reducirse tambien se ensancha el texto, asi que se recalcula unas veces.
export function useFitContent(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    if (!open) return;

    function fit() {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;
      content.style.zoom = "";
      if (!window.matchMedia("(min-width: 1024px)").matches) return;
      const available = container.clientHeight;
      let zoom = 1;
      for (let i = 0; i < 4; i++) {
        // scrollHeight incluye los elementos con posicion absoluta.
        const height = container.scrollHeight;
        if (height <= available + 1) break;
        zoom = Math.max(MIN_ZOOM, (zoom * available) / height);
        content.style.zoom = String(zoom);
        if (zoom === MIN_ZOOM) break;
      }
    }

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open, containerRef, contentRef]);
}
