import Image from "next/image";
import type { ReactNode } from "react";
import AuthHeader from "@/components/auth/AuthHeader";

// Fondo de las paginas de cuenta: el National Mall de dia en modo claro y de
// noche en modo oscuro.
export function AuthBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 bg-fondo">
      <Image
        src="/images/register/fondo-dia.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover dark:hidden"
      />
      <Image
        src="/images/register/fondo-noche.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover dark:block"
      />
    </div>
  );
}

// Pagina de cuenta completa: fondo, barra superior y la tarjeta centrada.
// Con `bare` solo pone el fondo (el registro arma su propia barra).
export default function AuthPage({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  return (
    <main className="relative isolate flex min-h-svh flex-col">
      <AuthBackground />
      {bare ? (
        children
      ) : (
        <>
          <AuthHeader />
          <div className="flex flex-1 items-center justify-center px-4 pb-5 pt-3 sm:p-6">{children}</div>
        </>
      )}
    </main>
  );
}
