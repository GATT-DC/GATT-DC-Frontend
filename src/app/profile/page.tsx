import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MemberShell from "@/components/member/MemberShell";
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
    <MemberShell name={`${profile.firstName} ${profile.lastName}`} current="/profile">
      <h1 className="font-heading mb-6 text-[44px] font-normal leading-none text-naranja lg:text-[56px]">
        <span className="font-script mr-2 text-[1.15em]">My</span>profile
      </h1>
      <ProfileView user={user} initialProfile={profile} notice={notice} error={error} />
    </MemberShell>
  );
}
