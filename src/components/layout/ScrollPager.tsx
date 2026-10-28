"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ScrollIndexProvider } from "@/components/layout/ScrollContext";

const TRANSITION_MS = 1200;
const SWIPE_THRESHOLD_PX = 30;
// Ventana tras un gesto (rueda, touch, tecla) en la que el scroll se considera
// provocado por ese gesto. Fuera de ella (p. ej. arrastrando la barra de
// scroll) no se fuerza ningun enganche.
const GESTURE_WINDOW_MS = 1000;
// Pausa sin rueda que separa un gesto del siguiente: la inercia del trackpad
// (o seguir girando la rueda) no encadena secciones.
const WHEEL_QUIET_MS = 160;
// Al volver desde el contenido de abajo, la pagina se desliza sola hasta la
// ultima seccion cuando esta ya ocupa esta fraccion de la pantalla, y hace
// tope: para seguir subiendo hay que soltar la rueda este tiempo.
const ENTRY_ZONE_VH = 0.6;
const ENTRY_QUIET_MS = 300;

export default function ScrollPager({
  sectionCount,
  children,
}: {
  sectionCount: number;
  children: ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const isTransitioning = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const touchStartedPastPaged = useRef(false);
  const lastScrollY = useRef(0);
  const lastGestureAt = useRef(0);
  const lastWheelAt = useRef(0);
  const entryLocked = useRef(false);
  const animationFrame = useRef(0);

  useEffect(() => {
    function goToIndex(index: number) {
      const clamped = Math.max(0, Math.min(sectionCount - 1, index));
      if (clamped === activeIndexRef.current) return;
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
      // Al llegar se hace tope: la inercia del gesto no sigue de largo.
      entryLocked.current = true;
      scrollToY(clamped * window.innerHeight);
    }

    function scrollToY(to: number) {
      isTransitioning.current = true;
      cancelAnimationFrame(animationFrame.current);
      const from = window.scrollY;
      // Mas corto si el tramo es menor que una pantalla.
      const duration =
        TRANSITION_MS *
        Math.min(1, Math.max(0.45, Math.abs(to - from) / window.innerHeight));
      const start = performance.now();

      // scrollTo "smooth" no deja fijar la duracion; el easing senoidal evita
      // el arranque y el corte bruscos entre los dos videos.
      function tick(now: number) {
        const t = Math.min(1, (now - start) / duration);
        const eased = -(Math.cos(Math.PI * t) - 1) / 2;
        window.scrollTo(0, from + (to - from) * eased);
        if (t < 1) {
          animationFrame.current = requestAnimationFrame(tick);
        } else {
          isTransitioning.current = false;
        }
      }

      animationFrame.current = requestAnimationFrame(tick);
    }

    // Pasada la ultima seccion paginada, el contenido que sigue (fuera del
    // pager) usa scroll nativo. Al volver hacia arriba, el paginado se
    // retoma solo cuando se llega de nuevo al tope de la ultima seccion.
    function isPastPaged() {
      return window.scrollY > (sectionCount - 1) * window.innerHeight + 1;
    }

    function isFreeScroll(goingDown: boolean) {
      const onLast = activeIndexRef.current === sectionCount - 1;
      return onLast && (goingDown || isPastPaged());
    }

    function handleWheel(e: WheelEvent) {
      const now = Date.now();
      const previousWheelAt = lastWheelAt.current;
      const quiet = now - previousWheelAt > WHEEL_QUIET_MS;
      lastGestureAt.current = now;
      lastWheelAt.current = now;
      // Durante la transicion no se deja pasar scroll nativo: cortaria el
      // scroll suave hacia la seccion destino.
      if (isTransitioning.current) {
        e.preventDefault();
        return;
      }
      const goingDown = e.deltaY > 0;
      const pagedEnd = (sectionCount - 1) * window.innerHeight;
      // Subiendo desde el contenido de abajo: llega deslizandose a la ultima
      // seccion y se queda ahi.
      if (
        !goingDown &&
        isPastPaged() &&
        window.scrollY <= pagedEnd + window.innerHeight * ENTRY_ZONE_VH
      ) {
        e.preventDefault();
        activeIndexRef.current = sectionCount - 1;
        setActiveIndex(sectionCount - 1);
        entryLocked.current = true;
        scrollToY(pagedEnd);
        return;
      }
      if (entryLocked.current && !isPastPaged()) {
        if (now - previousWheelAt < ENTRY_QUIET_MS) {
          e.preventDefault();
          return;
        }
        entryLocked.current = false;
      }
      if (isFreeScroll(goingDown)) return;
      e.preventDefault();
      if (!quiet) return;
      goToIndex(activeIndexRef.current + (goingDown ? 1 : -1));
    }

    // Si el scroll nativo de un gesto (subiendo desde el contenido libre)
    // cruza el tope de la ultima seccion paginada, se acomoda en esa seccion
    // (sin seguir a la anterior) para que no quede a medias. Sin gesto reciente
    // (barra de scroll) solo se sincroniza la seccion activa con la posicion.
    function handleScroll() {
      const scrollY = window.scrollY;
      const goingUp = scrollY < lastScrollY.current;
      lastScrollY.current = scrollY;
      if (isTransitioning.current) return;
      if (Date.now() - lastGestureAt.current > GESTURE_WINDOW_MS) {
        const index = Math.min(
          sectionCount - 1,
          Math.round(scrollY / window.innerHeight),
        );
        if (index !== activeIndexRef.current) {
          activeIndexRef.current = index;
          setActiveIndex(index);
        }
        return;
      }
      if (!goingUp) return;
      const onLast = activeIndexRef.current === sectionCount - 1;
      const pagedEnd = (sectionCount - 1) * window.innerHeight;
      if (onLast && scrollY < pagedEnd - 1) {
        entryLocked.current = true;
        scrollToY(pagedEnd);
      }
    }

    function handleTouchStart(e: TouchEvent) {
      lastGestureAt.current = Date.now();
      touchStartY.current = e.touches[0].clientY;
      touchStartedPastPaged.current = isPastPaged();
    }

    function handleTouchMove(e: TouchEvent) {
      if (touchStartY.current === null) return;
      lastGestureAt.current = Date.now();
      if (isTransitioning.current) {
        e.preventDefault();
        return;
      }
      const goingDown = touchStartY.current - e.touches[0].clientY > 0;
      if (touchStartedPastPaged.current || isFreeScroll(goingDown)) return;
      e.preventDefault();
    }

    function handleTouchEnd(e: TouchEvent) {
      if (touchStartY.current === null || isTransitioning.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      touchStartY.current = null;
      if (touchStartedPastPaged.current || isFreeScroll(deltaY > 0)) return;
      if (Math.abs(deltaY) < SWIPE_THRESHOLD_PX) return;
      goToIndex(activeIndexRef.current + (deltaY > 0 ? 1 : -1));
    }

    function handleKeyDown(e: KeyboardEvent) {
      const goingDown = e.key === "ArrowDown" || e.key === "PageDown";
      const goingUp = e.key === "ArrowUp" || e.key === "PageUp";
      if (goingDown || goingUp) lastGestureAt.current = Date.now();
      if (isTransitioning.current) {
        if (goingDown || goingUp) e.preventDefault();
        return;
      }
      if ((goingDown || goingUp) && isFreeScroll(goingDown)) return;
      if (goingDown) {
        e.preventDefault();
        goToIndex(activeIndexRef.current + 1);
      } else if (goingUp) {
        e.preventDefault();
        goToIndex(activeIndexRef.current - 1);
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame.current);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sectionCount]);

  return (
    <ScrollIndexProvider value={activeIndex}>{children}</ScrollIndexProvider>
  );
}
