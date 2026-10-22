import { Fraunces } from "next/font/google";
import localFont from "next/font/local";

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const pinyon = localFont({
  src: "../fonts/PinyonScript-Regular.ttf",
  variable: "--font-pinyon",
  weight: "400",
});

// PP Radio Grotesk: pendiente de comprar la licencia comercial. Mientras
// tanto se prueba localmente con la version gratuita (solo uso personal,
// ver docs/style-guide.md) sin commitear el bloque de abajo ni el archivo
// (esta en .gitignore).
export const radioGrotesk = localFont({
  src: "../fonts/RadioGrotesk-Regular.otf",
  variable: "--font-radio-grotesk",
  weight: "400",
});
