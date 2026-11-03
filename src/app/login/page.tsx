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

// Errores al volver de Google (Better Auth redirige aqui con ?error=...).
const SOCIAL_ERRORS: Record<string, string> = {
  account_not_linked:
    "There's already an account with this email that hasn't been confirmed. Sign in with your email and password (or reset it) first.",
  access_denied: "Signing in with Google was cancelled.",
  email_not_found: "Your Google account didn't share an email address, so we couldn't sign you in.",
  email_not_verified: "Your Google email isn't verified yet. Verify it with Google and try again.",
};
const SOCIAL_FALLBACK = "We couldn't sign you in with Google. Please try again.";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error, notice } = await searchParams;
  const key = (typeof error === "string" && error) || (typeof notice === "string" && notice) || "";
  const message = NOTICES[key];
  const failure = !message && typeof error === "string" ? (SOCIAL_ERRORS[error] ?? SOCIAL_FALLBACK) : undefined;

  return (
    <AuthPage>
      <AuthCard
        title="Welcome back"
        intro="Sign in to see upcoming events, join blog discussions, and connect with fellow members."
      >
        <LoginForm next={safeNextPath(next)} notice={message} error={failure} />
      </AuthCard>
    </AuthPage>
  );
}
