import type { Metadata } from "next";
import { fraunces, pinyon } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "GATT DC — LGBTQ+ Professionals in International Trade",
  description:
    "GATT DC is a community of LGBTQ+ professionals in international trade.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${pinyon.variable}`}>
      <body>{children}</body>
    </html>
  );
}
