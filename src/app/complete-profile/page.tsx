import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthPage from "@/components/auth/AuthPage";
import CompleteProfileForm from "@/components/auth/CompleteProfileForm";
import { AuthCard } from "@/components/auth/ui";
import { getMyProfile, getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Complete your profile — GATT DC",
};

// Para quien tiene cuenta pero todavia no perfil (por ejemplo, al entrar por
// primera vez con Google o LinkedIn).
export default async function CompleteProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/complete-profile");
  if (await getMyProfile()) redirect("/account");

  return (
    <AuthPage>
      <AuthCard
        title="Complete your profile"
        intro={`Welcome, ${user.name}. Tell us a bit about yourself to finish setting up your GATT account.`}
      >
        <CompleteProfileForm name={user.name} />
      </AuthCard>
    </AuthPage>
  );
}
