// Pagina a la que se llega despues de iniciar sesion.
export const HOME_AFTER_LOGIN = "/account";

// Solo se aceptan rutas internas en ?next= (evita redirigir a otro sitio con
// un enlace armado, como ?next=//sitio-malicioso.com).
export function safeNextPath(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return HOME_AFTER_LOGIN;
  }
  return value;
}
