"use client";

import Link from "next/link";
import { useState } from "react";
import { FormError, FormNotice } from "@/components/auth/ui";
import { authClient } from "@/lib/auth-client";

// Despues de registrarse: aviso de que llego un correo para confirmar la
// cuenta, con la opcion de pedir otro.
export default function CheckEmail({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function resend() {
    setStatus("sending");
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: "/account" });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="animate-[register-in_0.5s_cubic-bezier(0.22,1,0.36,1)_both] space-y-5">
      <p className="font-ui text-[15px] leading-relaxed text-texto">
        We sent a confirmation link to <span className="font-semibold">{email}</span>. Open it to
        activate your account. The link expires in 1 hour.
      </p>
      {status === "sent" && <FormNotice>We sent you a new link.</FormNotice>}
      {status === "error" && <FormError>We couldn&apos;t send the email. Try again in a moment.</FormError>}
      <p className="font-ui text-[14px] text-texto/55">
        Didn&apos;t get it? Check your spam folder or{" "}
        <button
          type="button"
          onClick={resend}
          disabled={status === "sending"}
          className="text-primario underline disabled:opacity-50"
        >
          send it again
        </button>
        .
      </p>
      <p className="text-center font-ui text-[14px] text-texto/55">
        Already confirmed?
        <Link href="/login" className="ml-2 text-primario underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
