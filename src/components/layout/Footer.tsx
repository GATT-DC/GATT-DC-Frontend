import Image from "next/image";
import Link from "next/link";

const ILLUSTRATION_ALT =
  "Illustration of Washington, D.C. landmarks reflected on the water: the Lincoln Memorial, the Washington Monument, the U.S. Capitol and the Jefferson Memorial";

// Redes sociales; los enlaces son provisionales hasta tener los perfiles.
const SOCIALS = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5.5-3.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" />
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-5v-7h2.5l.5-3h-3V8.5c0-.9.4-1.5 1.6-1.5H18V4.3A20 20 0 0 0 15.6 4C13.3 4 12 5.4 12 7.8V10H9.5v3H12v7H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2.5 7.5V18h3V9.5h-3Zm1.5-4a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Zm4 4V18h3v-4.4c0-1.2.5-2 1.6-2 1 0 1.4.8 1.4 2V18h3v-5.1c0-2.6-1.3-3.6-3.2-3.6-1.4 0-2.3.7-2.8 1.4V9.5h-3Z" />
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-fondo">
      {/* Cada ilustracion tiene el mismo fondo que la pagina en su tema
          (#141414 en oscuro, blanco en claro). */}
      <Image
        src="/images/fotter/washington_misma_ilustracion_4K.png"
        alt={ILLUSTRATION_ALT}
        width={3840}
        height={1645}
        sizes="100vw"
        className="hidden h-auto w-full dark:block"
      />
      <Image
        src="/images/fotter/washington_white.png"
        alt={ILLUSTRATION_ALT}
        width={1916}
        height={821}
        sizes="100vw"
        className="h-auto w-full dark:hidden"
      />

      <div className="grid grid-cols-1 items-center gap-6 px-6 pb-8 pt-10 text-center sm:grid-cols-3 sm:px-8 sm:text-left lg:pt-14">
        <p className="order-3 font-ui text-[12px] text-texto sm:order-none">
          © GATT DC 2026 |{" "}
          <Link href="#privacy-policy" className="underline underline-offset-2 hover:text-texto/80">
            Privacy Policy
          </Link>
        </p>

        <Link href="/" className="order-1 justify-self-center sm:order-none">
          <Image
            src="/images/landing/hero/GATTDC-logo.png"
            alt="GATT DC"
            width={120}
            height={36}
          />
        </Link>

        <ul className="order-2 flex justify-center gap-2.5 sm:order-none sm:justify-end">
          {SOCIALS.map((social) => (
            <li key={social.name}>
              <a
                href={social.href}
                aria-label={social.name}
                className="block text-texto transition-opacity hover:opacity-80"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  {social.icon}
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
