"use client";

import type { ReactNode } from "react";
import { useActiveIndex } from "@/components/layout/ScrollContext";

export default function StaggerText({
  lines,
  index,
  className = "",
}: {
  lines: ReactNode[];
  index: number;
  className?: string;
}) {
  const activeIndex = useActiveIndex();
  const active = activeIndex === index;

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className={`block transition-all duration-1000 ease-out ${
            active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: active ? `${i * 150}ms` : "0ms" }}
        >
          {line}
        </span>
      ))}
    </span>
  );
}
