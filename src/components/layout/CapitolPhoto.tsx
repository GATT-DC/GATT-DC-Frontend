import Image from "next/image";

// Proporcion de la parte visible de la foto (el PNG trae 43px transparentes
// arriba, que quedan fuera al alinear la foto por abajo). Se usa la misma en la
// carpeta cerrada y en la vista abierta para que la animacion no la deforme.
export const CAPITOL_ASPECT = "aspect-[1544/1401]";

export default function CapitolPhoto({
  sizes,
  className = "",
}: {
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src="/images/landing/discover-gatt/capitolio.png"
        alt="Aerial view of the U.S. Capitol and the National Mall in Washington, D.C."
        fill
        sizes={sizes}
        className="object-cover object-bottom"
      />
    </div>
  );
}
