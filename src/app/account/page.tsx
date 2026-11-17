import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthPage from "@/components/auth/AuthPage";
import PhoneSection from "@/components/auth/PhoneSection";
import SignOutButton from "@/components/auth/SignOutButton";
import { AuthCard } from "@/components/auth/ui";
import { getMyProfile, getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "My account — GATT DC",
};

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Pagina de inicio del miembro. Por ahora muestra los datos de la cuenta;
// es el primer lugar protegido del sitio.
export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await getSessionUser();
  if (!user) {
    // Si se llega desde un enlace de confirmacion que fallo, el aviso sigue
    // hasta el inicio de sesion.
    const { error } = await searchParams;
    const query = new URLSearchParams({ next: "/account" });
    if (typeof error === "string") query.set("error", error);
    redirect(`/login?${query}`);
  }
  const profile = await getMyProfile();
  if (!profile) redirect("/complete-profile");

  const details = [
    ["Email", user.email],
    ["Position", profile.position],
    ["Organization", profile.organization],
    ["LinkedIn", profile.linkedinUrl],
    ["GATT member since", formatDate(profile.memberSince)],
    ["Visible in Networking", profile.networkingVisible ? "Yes" : "No"],
  ];

  return (
    <AuthPage>
      <AuthCard title={`Hi, ${profile.firstName}`} intro="This is your GATT DC account.">
        <dl className="space-y-3">
          {details.map(([label, value]) => (
            <div key={label} className="border-b border-texto/10 pb-2.5">
              <dt className="font-ui text-[13px] text-texto/55">{label}</dt>
              <dd className="break-words font-ui text-[15px] text-texto">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3">
          <PhoneSection
            verifiedPhone={user.phoneNumberVerified && user.phoneNumber ? user.phoneNumber : null}
            pendingPhone={profile.phoneNumber}
          />
        </div>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </AuthCard>
    </AuthPage>
  );
}
