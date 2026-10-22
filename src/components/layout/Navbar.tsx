import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";

// onMedia: el navbar va sobre una imagen o video oscuro (Hero), asi que sus
// iconos son siempre blancos; si no, siguen el color de texto del tema.
export default function Navbar({ onMedia = true }: { onMedia?: boolean }) {
  const iconColor = onMedia ? "text-white" : "text-texto";
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-4 sm:px-10">
      <Link href="/" className="shrink-0">
        <Image
          src="/images/landing/hero/GATTDC-logo.png"
          alt="GATT DC"
          width={160}
          height={48}
          priority
        />
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="#join-community"
          className="flex items-center gap-2 rounded-full bg-primario px-5 py-2.5 font-ui text-[16px] text-white transition-colors hover:bg-primario-hover"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.76-3.58-5-8-5Z" />
          </svg>
          Become a Member
        </Link>

        <button
          type="button"
          aria-label="Abrir menú"
          className={`flex h-10 w-10 items-center justify-center ${iconColor}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <ThemeToggle className={iconColor} />
      </div>
    </header>
  );
}
