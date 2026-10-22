import type { Metadata } from "next";
import { fraunces, pinyon, radioGrotesk } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "GATT DC — LGBTQ+ Professionals in International Trade",
  description:
    "GATT DC is a community of LGBTQ+ professionals in international trade.",
};

// Aplica el tema guardado antes del primer pintado (sin parpadeo). Oscuro por
// defecto.
const THEME_SCRIPT = `try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      // El script de abajo puede cambiar data-theme antes de hidratar.
      suppressHydrationWarning
      className={`${fraunces.variable} ${pinyon.variable} ${radioGrotesk.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
