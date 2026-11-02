"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { Field, FormError, FormNotice, INPUT_CLASS, PrimaryButton } from "@/components/auth/ui";
import { authClient } from "@/lib/auth-client";
import { EMAIL_PATTERN } from "@/lib/password";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const ready = EMAIL_PATTERN.test(email.trim());

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!ready || pending) return;
    setPending(true);
    setError("");
    const { error } = await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: "/reset-password",
    });
    setPending(false);
    if (error) {
      setError(error.status === 429 ? "Too many attempts. Wait a minute and try again." : "We couldn't send the email. Please try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    // Mismo mensaje exista o no la cuenta, para no revelar que correos estan
    // registrados.
    return (
      <div className="space-y-5">
        <FormNotice>
          If there&apos;s an account for {email.trim()}, we sent it a link to choose a new password.
          The link expires in 1 hour.
        </FormNotice>
        <p className="text-center font-ui text-[14px] text-texto/55">
          <Link href="/login" className="text-primario underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Email Address">
        {(id) => (
          <input
            id={id}
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
          />
        )}
      </Field>
      {error && (
        <div className="mt-5">
          <FormError>{error}</FormError>
        </div>
      )}
      <div className="mt-6">
        <PrimaryButton disabled={!ready} pending={pending}>
          Send link
        </PrimaryButton>
      </div>
      <p className="mt-7 text-center font-ui text-[14px] text-texto/55">
        Remembered it?{" "}
        <Link href="/login" className="ml-2 text-primario underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
