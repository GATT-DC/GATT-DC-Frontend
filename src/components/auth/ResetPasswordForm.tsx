"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  Field,
  FormError,
  INPUT_CLASS,
  PasswordRequirements,
  PrimaryButton,
} from "@/components/auth/ui";
import { authClient } from "@/lib/auth-client";
import { checkPassword } from "@/lib/password";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const ready = checkPassword(password, confirm).valid;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!ready || pending) return;
    setPending(true);
    setError("");
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (!error) {
      router.replace("/login?notice=password-reset");
      return;
    }
    setPending(false);
    setError(
      error.code === "INVALID_TOKEN"
        ? "This link is invalid or expired. Ask for a new one."
        : error.message || "We couldn't change your password. Please try again.",
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="space-y-5">
        <Field label="New Password">
          {(id) => (
            <input
              id={id}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
            />
          )}
        </Field>
        <Field label="Confirm your Password">
          {(id) => (
            <input
              id={id}
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={INPUT_CLASS}
            />
          )}
        </Field>
        <PasswordRequirements password={password} confirm={confirm} />
      </div>
      {error && (
        <div className="mt-5">
          <FormError>{error}</FormError>
        </div>
      )}
      <div className="mt-6">
        <PrimaryButton disabled={!ready} pending={pending}>
          Change password
        </PrimaryButton>
      </div>
    </form>
  );
}
