import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import MemberHeader from "@/components/member/MemberHeader";
import MemberSidebar from "@/components/member/MemberSidebar";

// Marco comun de las paginas del area de miembros: cabecera, carpetas a la
// izquierda y el contenido. footer: el pie con la ilustracion de Washington
// (p. ej. al leer un blog).
export default function MemberShell({
  name,
  current,
  footer = false,
  children,
}: {
  name: string;
  current: string;
  footer?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh bg-fondo">
      <MemberHeader name={name} />
      <main className="mx-auto grid max-w-[1920px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[120px_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-12">
        <div className="lg:pt-24">
          <MemberSidebar current={current} />
        </div>
        <div className="min-w-0">{children}</div>
      </main>
      {footer && <Footer />}
    </div>
  );
}
