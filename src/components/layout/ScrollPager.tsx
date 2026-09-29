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

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      if (isTransitioning.current) return;
      goToIndex(activeIndexRef.current + (e.deltaY > 0 ? 1 : -1));
    }

    function handleTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
    }

    function handleTouchEnd(e: TouchEvent) {
      if (touchStartY.current === null || isTransitioning.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      touchStartY.current = null;
      if (Math.abs(deltaY) < SWIPE_THRESHOLD_PX) return;
      goToIndex(activeIndexRef.current + (deltaY > 0 ? 1 : -1));
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (isTransitioning.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goToIndex(activeIndexRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToIndex(activeIndexRef.current - 1);
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sectionCount]);

  return (
    <ScrollIndexProvider value={activeIndex}>{children}</ScrollIndexProvider>
  );
}
