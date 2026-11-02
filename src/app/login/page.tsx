import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";
import LoginForm from "@/components/auth/LoginForm";
import { AuthCard } from "@/components/auth/ui";
import { safeNextPath } from "@/lib/redirects";

export const metadata: Metadata = {
  title: "Sign In — GATT DC",
  description: "Sign in to your GATT DC member account.",
};

// Avisos que llegan por la URL: al volver de un enlace de confirmacion
// vencido o despues de cambiar la contraseña.
const NOTICES: Record<string, string> = {
  INVALID_TOKEN: "That confirmation link isn't valid. Sign in and we'll send you a new one.",
  TOKEN_EXPIRED: "That confirmation link expired. Sign in and we'll send you a new one.",
  "password-reset": "Your password was changed. Sign in with your new password.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error, notice } = await searchParams;
  const key = (typeof error === "string" && error) || (typeof notice === "string" && notice) || "";

  return (
    <AuthPage>
      <AuthCard
        title="Welcome back"
        intro="Sign in to see upcoming events, join blog discussions, and connect with fellow members."
      >
        <LoginForm next={safeNextPath(next)} notice={NOTICES[key]} />
      </AuthCard>
    </AuthPage>
  );
}
