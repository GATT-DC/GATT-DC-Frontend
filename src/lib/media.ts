// Direccion publica del bucket de S3 (o su CDN). La base guarda solo rutas
// relativas ("blogs/gala/1.jpg") y aqui se arma la URL completa.
export const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/+$/, "");

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path || !MEDIA_URL) return null;
  return `${MEDIA_URL}/${path.replace(/^\/+/, "")}`;
}
