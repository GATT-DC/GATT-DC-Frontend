"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ScrollIndexProvider } from "@/components/layout/ScrollContext";

const TRANSITION_LOCK_MS = 700;
const SWIPE_THRESHOLD_PX = 30;

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

  useEffect(() => {
    function goToIndex(index: number) {
      const clamped = Math.max(0, Math.min(sectionCount - 1, index));
      if (clamped === activeIndexRef.current) return;
      isTransitioning.current = true;
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
      window.scrollTo({ top: clamped * window.innerHeight, behavior: "smooth" });
      window.setTimeout(() => {
        isTransitioning.current = false;
      }, TRANSITION_LOCK_MS);
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
      // Durante la transicion no se deja pasar scroll nativo: cortaria el
      // scroll suave hacia la seccion destino.
      if (isTransitioning.current) {
        e.preventDefault();
        return;
      }
      const goingDown = e.deltaY > 0;
      if (isFreeScroll(goingDown)) return;
      e.preventDefault();
      goToIndex(activeIndexRef.current + (goingDown ? 1 : -1));
    }

    // Si el scroll nativo (subiendo desde el contenido libre) cruza el tope
    // de la ultima seccion paginada, se completa solo el paso a la seccion
    // anterior para que no quede a medias.
    function handleScroll() {
      const scrollY = window.scrollY;
      const goingUp = scrollY < lastScrollY.current;
      lastScrollY.current = scrollY;
      if (isTransitioning.current || !goingUp) return;
      const onLast = activeIndexRef.current === sectionCount - 1;
      const pagedEnd = (sectionCount - 1) * window.innerHeight;
      if (onLast && scrollY < pagedEnd - 1) {
        goToIndex(activeIndexRef.current - 1);
      }
    }

    function handleTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY;
      touchStartedPastPaged.current = isPastPaged();
    }

    function handleTouchMove(e: TouchEvent) {
      if (touchStartY.current === null) return;
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
