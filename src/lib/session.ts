import { cookies } from "next/headers";
import type { Profile } from "@/lib/api";
import { BACKEND_URL } from "@/lib/backend";

// Lectura de la sesion desde componentes de servidor: se le pregunta al
// backend reenviando las cookies de la peticion.

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  // Telefono verificado con el que puede entrar por SMS.
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
};

async function backendGet(path: string): Promise<Response> {
  const cookieHeader = (await cookies()).toString();
  return fetch(`${BACKEND_URL}${path}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
}

// Usuario con sesion iniciada, o null si no hay sesion.
export async function getSessionUser(): Promise<SessionUser | null> {
  const response = await backendGet("/api/auth/get-session");
  if (!response.ok) return null;
  const session = (await response.json()) as { user: SessionUser } | null;
  return session?.user ?? null;
}

// Perfil del usuario con sesion, o null si todavia no lo completo.
export async function getMyProfile(): Promise<Profile | null> {
  const response = await backendGet("/api/v1/profiles/me");
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Could not load the profile (${response.status})`);
  return (await response.json()) as Profile;
}
