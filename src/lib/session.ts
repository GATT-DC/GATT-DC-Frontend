import { cookies } from "next/headers";
import type { AdminUserDetail, AdminUserPage, BlogPost, MembershipType, Profile } from "@/lib/api";
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
  // Solo los admins crean y editan blogs.
  isAdmin?: boolean;
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

// Blogs del area de miembros. Los admins reciben tambien los borradores.
export async function getBlogPosts(): Promise<BlogPost[]> {
  const response = await backendGet("/api/v1/blog-posts");
  if (!response.ok) throw new Error(`Could not load the blog posts (${response.status})`);
  return (await response.json()) as BlogPost[];
}

// Un blog por su slug, o null si no existe (o es un borrador y no es admin).
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const response = await backendGet(`/api/v1/blog-posts/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Could not load the blog post (${response.status})`);
  return (await response.json()) as BlogPost;
}

// ---- Panel de admin ----

// Listado de usuarios con los filtros de la URL (search, membershipTypeId,
// role, status, sort, page).
export async function getAdminUsers(filters: Record<string, string>): Promise<AdminUserPage> {
  const query = new URLSearchParams(filters).toString();
  const response = await backendGet(`/api/v1/admin/users${query ? `?${query}` : ""}`);
  if (!response.ok) throw new Error(`Could not load the users (${response.status})`);
  return (await response.json()) as AdminUserPage;
}

// Un usuario con su perfil y aportes, o null si no existe.
export async function getAdminUser(id: string): Promise<AdminUserDetail | null> {
  const response = await backendGet(`/api/v1/admin/users/${encodeURIComponent(id)}`);
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) throw new Error(`Could not load the user (${response.status})`);
  return (await response.json()) as AdminUserDetail;
}

export async function getMembershipTypes(): Promise<MembershipType[]> {
  const response = await backendGet("/api/v1/admin/membership-types");
  if (!response.ok) throw new Error(`Could not load the membership types (${response.status})`);
  return (await response.json()) as MembershipType[];
}
