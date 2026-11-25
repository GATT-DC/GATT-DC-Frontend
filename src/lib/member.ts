import { redirect } from "next/navigation";
import { getMyProfile, getSessionUser } from "@/lib/session";

// Para las paginas del area de miembros: sin sesion manda al login (y vuelve
// a `next` despues); sin perfil, a completarlo.
export async function requireMember(next: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?${new URLSearchParams({ next })}`);
  const profile = await getMyProfile();
  if (!profile) redirect("/complete-profile");
  return { user, profile, name: `${profile.firstName} ${profile.lastName}`, isAdmin: user.isAdmin === true };
}
