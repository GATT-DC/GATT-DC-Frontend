import type { Metadata } from "next";
import Image from "next/image";
import RegisterShell from "@/components/register/RegisterShell";

export const metadata: Metadata = {
  title: "Be part of GATT — GATT DC",
  description:
    "Create your GATT DC profile to join a community of LGBTQ+ professionals and allies in international trade.",
};

export default function RegisterPage() {
  return (
    <main className="relative isolate flex min-h-svh flex-col">
      {/* Fondo: el National Mall de dia en modo claro y de noche en modo
          oscuro. */}
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

      <RegisterShell />
    </main>
  );
}
