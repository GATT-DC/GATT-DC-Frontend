import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { AuthCard } from "@/components/auth/ui";

export const metadata: Metadata = {
  title: "Forgot your password — GATT DC",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPage>
      <AuthCard
        title="Forgot your password?"
        intro="Enter the email you used to sign up and we'll send you a link to choose a new one."
      >
        <ForgotPasswordForm />
      </AuthCard>
    </AuthPage>
  );
}
