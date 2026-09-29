import type { ReactNode } from "react";

export default function StackSection({
  children,
  zIndex,
}: {
  children: ReactNode;
  zIndex: number;
}) {
  return (
    <div className="sticky top-0 h-screen" style={{ zIndex }}>
      {children}
    </div>
  );
}
