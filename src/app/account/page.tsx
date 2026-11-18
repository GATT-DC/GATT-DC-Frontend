import { redirect } from "next/navigation";

// La cuenta del miembro ahora vive en "My profile" (/profile). Se conserva
// el aviso que pueda traer un enlace de confirmacion vencido (?error=...).
export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const { error } = await searchParams;
  const query = typeof error === "string" ? `?${new URLSearchParams({ error })}` : "";
  redirect(`/profile${query}`);
}
