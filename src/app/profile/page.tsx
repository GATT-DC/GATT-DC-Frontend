import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MemberHeader from "@/components/member/MemberHeader";
import MemberSidebar from "@/components/member/MemberSidebar";
import ProfileView from "@/components/member/ProfileView";
import { getMyProfile, getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "My profile — GATT DC",
};

// Avisos y errores que pueden llegar por la URL.
const NOTICES: Record<string, string> = {
  "email-changed": "Your email address was updated.",
};
const ERRORS: Record<string, string> = {
  INVALID_TOKEN: "That confirmation link isn't valid. Ask for a new one.",
  TOKEN_EXPIRED: "That confirmation link expired. Ask for a new one.",
};

// Pagina de inicio del miembro: su perfil, editable.
export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const params = await searchParams;
  const user = await getSessionUser();
  if (!user) {
    const query = new URLSearchParams({ next: "/profile" });
    if (typeof params.error === "string") query.set("error", params.error);
    redirect(`/login?${query}`);
  }
  const profile = await getMyProfile();
  if (!profile) redirect("/complete-profile");

  const notice = typeof params.notice === "string" ? NOTICES[params.notice] : undefined;
  const error = typeof params.error === "string" ? (ERRORS[params.error] ?? undefined) : undefined;

  return (
    <div className="min-h-svh bg-fondo">
      <MemberHeader name={`${profile.firstName} ${profile.lastName}`} />
      {/* Ocupa casi todo el ancho: las carpetas y "Complete your profile"
          quedan cerca de los bordes, como en el diseño. */}
      <main className="mx-auto grid max-w-[1920px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[120px_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-12">
        <div className="lg:pt-24">
          <MemberSidebar current="/profile" />
        </div>
        <div className="min-w-0">
          <h1 className="font-heading mb-6 text-[44px] font-normal leading-none text-naranja lg:text-[56px]">
            <span className="font-script mr-2 text-[1.15em]">My</span>profile
          </h1>
          <ProfileView user={user} initialProfile={profile} notice={notice} error={error} />
        </div>
      </main>
    </div>
  );
}
