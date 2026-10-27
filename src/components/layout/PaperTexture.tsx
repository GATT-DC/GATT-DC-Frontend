// Textura de papel generada con ruido SVG (la de las carpetas sin textura
// propia y la de las tarjetas de celular).
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// Texturas de cada carpeta. Se aplican en gris y en modo overlay sobre el color
// de la carpeta, asi conservan la paleta (en modo claro y oscuro, y al
// resaltarse). `brightness` lleva el gris medio de cada imagen a 50% para que
// no aclare ni oscurezca el color, y `contrast` empareja lo marcada que se ve
// cada una (las hojas y el papel liso son muy sutiles, las rayas no). `size`
// es "cover" en las que no se repiten sin costura.
const TEXTURES = {
  "about-us": { brightness: 0.54, contrast: 1.8, size: "500px auto" },
  "what-we-do": { brightness: 0.58, contrast: 1.1, size: "408px auto" },
  mission: { brightness: 0.55, contrast: 2.6, size: "cover" },
  board: { brightness: 0.53, contrast: 1.7, size: "250px auto" },
  community: { brightness: 0.575, contrast: 1.3, size: "251px auto" },
};

export type FolderTexture = keyof typeof TEXTURES;

export default function PaperTexture({
  texture,
  className = "",
}: {
  texture?: FolderTexture;
  className?: string;
}) {
  if (texture) {
    const { brightness, contrast, size } = TEXTURES[texture];
    return (
      <div
        className={`pointer-events-none absolute inset-0 mix-blend-overlay ${className}`}
        style={{
          backgroundImage: `url(/images/landing/discover-gatt/textures/${texture}.png)`,
          backgroundSize: size,
          backgroundPosition: "center",
          filter: `grayscale(1) brightness(${brightness}) contrast(${contrast})`,
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay ${className}`}
      style={{ backgroundImage: NOISE }}
      aria-hidden="true"
    />
  );
}
