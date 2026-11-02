import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";
import RegisterShell from "@/components/register/RegisterShell";

export const metadata: Metadata = {
  title: "Be part of GATT — GATT DC",
  description:
    "Create your GATT DC profile to join a community of LGBTQ+ professionals and allies in international trade.",
};

export default function RegisterPage() {
  return (
    <AuthPage bare>
      <RegisterShell />
    </AuthPage>
  );
}
