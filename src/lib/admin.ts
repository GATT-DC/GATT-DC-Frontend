import { notFound } from "next/navigation";
import { requireMember } from "@/lib/member";

// Para las paginas del panel de admin: sin sesion al login; si no es admin,
// la pagina no existe para el.
export async function requireAdmin(next: string) {
  const member = await requireMember(next);
  if (!member.isAdmin) notFound();
  return member;
}
