"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  Field,
  FormError,
  FormNotice,
  INPUT_CLASS,
  PrimaryButton,
  SocialOptions,
} from "@/components/auth/ui";
import PhoneLoginForm from "@/components/auth/PhoneLoginForm";
import { authClient } from "@/lib/auth-client";
import { EMAIL_PATTERN } from "@/lib/password";

// Inicio de sesion con correo y contraseña, o con un codigo por SMS.
export default function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [method, setMethod] = useState<"email" | "phone">("email");

  return (
    <div>
      <div role="tablist" aria-label="Sign in with" className="mb-6 grid grid-cols-2 rounded-full bg-texto/[0.06] p-1">
        {(["email", "phone"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={method === option}
            onClick={() => setMethod(option)}
            className={`rounded-full py-1.5 font-ui text-[14px] transition-colors ${
              method === option ? "bg-primario text-white" : "text-texto/70 hover:text-texto"
            }`}
          >
            {option === "email" ? "Email" : "Phone"}
          </button>
        ))}
      </div>

      {method === "email" ? <EmailLoginForm next={next} notice={notice} /> : <PhoneLoginForm next={next} />}

      <div className="pt-6">
        <SocialOptions />
        <p className="mt-7 text-center font-ui text-[14px] text-texto/55">
          Don&apos;t have an Account?{" "}
          <Link href="/register" className="ml-2 text-primario underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function EmailLoginForm({ next, notice }: { next: string; notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(notice ?? "");

  const ready = EMAIL_PATTERN.test(email.trim()) && password.length > 0;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!ready || pending) return;
    setPending(true);
    setError("");
    setInfo("");

    const { error } = await authClient.signIn.email({ email: email.trim(), password });
    if (!error) {
      router.replace(next);
      router.refresh();
      return;
    }

    setPending(false);
    if (error.status === 403) {
      // Cuenta sin confirmar: el backend reenvia el correo de confirmacion.
      setInfo(`Confirm your email first. We sent a new link to ${email.trim()}.`);
    } else if (error.status === 401) {
      setError("Incorrect email or password.");
    } else if (error.status === 429) {
      setError("Too many attempts. Wait a minute and try again.");
    } else {
      setError("We couldn't sign you in. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="space-y-5">
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
        <Field
          label="Password"
          aside={
            <Link href="/forgot-password" className="font-ui text-[13px] text-primario underline">
              Forgot your password?
            </Link>
          }
        >
          {(id) => (
            <input
              id={id}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
            />
          )}
        </Field>
      </div>

      {(error || info) && (
        <div className="mt-5">
          <FormError>{error}</FormError>
          <FormNotice>{info}</FormNotice>
        </div>
      )}

      <div className="mt-6">
        <PrimaryButton disabled={!ready} pending={pending}>
          Sign In
        </PrimaryButton>
      </div>
    </form>
  );
}
