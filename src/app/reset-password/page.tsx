import type { Metadata } from "next";
import Link from "next/link";
import AuthPage from "@/components/auth/AuthPage";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { AuthCard, FormError } from "@/components/auth/ui";

export const metadata: Metadata = {
  title: "Choose a new password — GATT DC",
};

// Se llega desde el enlace del correo. El backend redirige aqui con
// ?token=... si el enlace es valido o con ?error=INVALID_TOKEN si no.
export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const validToken = typeof token === "string" && token ? token : null;

  return (
    <AuthPage>
      <AuthCard title="Choose a new password">
        {validToken ? (
          <ResetPasswordForm token={validToken} />
        ) : (
          <div className="space-y-5">
            <FormError>This link is invalid or expired.</FormError>
            <p className="text-center font-ui text-[14px] text-texto/55">
              <Link href="/forgot-password" className="text-primario underline">
                Ask for a new link
              </Link>
            </p>
          </div>
        )}
      </AuthCard>
    </AuthPage>
  );
}
