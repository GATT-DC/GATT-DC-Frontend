"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import CheckEmail from "@/components/auth/CheckEmail";
import ProfileForm from "@/components/auth/ProfileForm";
import {
  AuthCard,
  CheckIcon,
  Collapse,
  Field,
  INPUT_CLASS,
  PasswordRequirements,
  PrimaryButton,
  SocialOptions,
} from "@/components/auth/ui";
import { register } from "@/lib/api";
import { EMAIL_PATTERN, checkPassword } from "@/lib/password";

// Registro en dos pasos:
// 1. Correo. Al empezar a escribirlo se ocultan las opciones de Google y
//    LinkedIn y aparecen los campos de contraseña con sus requisitos.
// 2. Perfil, con el correo ya puesto. Al enviarlo se crea la cuenta y llega
//    un correo para confirmarla.

type Account = { email: string; password: string };

function AccountStep({
  initial,
  onDone,
  onTyped,
}: {
  // Datos ya escritos, al volver desde el paso 2.
  initial: Account | null;
  onDone: (account: Account) => void;
  // Avisa si ya hay algo escrito (para advertir antes de salir).
  onTyped: (typed: boolean) => void;
}) {
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [confirm, setConfirm] = useState(initial?.password ?? "");
  const typed = email !== "" || password !== "" || confirm !== "";
  useEffect(() => onTyped(typed), [typed, onTyped]);

  // Los campos de contraseña aparecen cuando el correo es valido y se quedan
  // aunque luego se corrija (solo se cierran si se borra el correo).
  const [usingEmail, setUsingEmail] = useState(initial !== null);
  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const showEmailError = emailTouched && email.trim() !== "" && !emailValid;

  function changeEmail(value: string) {
    setEmail(value);
    if (EMAIL_PATTERN.test(value.trim())) setUsingEmail(true);
    else if (!value.trim()) setUsingEmail(false);
  }
  const ready = emailValid && checkPassword(password, confirm).valid;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (ready) onDone({ email: email.trim(), password });
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
              onChange={(e) => changeEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              aria-invalid={showEmailError}
              className={`${INPUT_CLASS} ${showEmailError ? "border-rojo!" : ""}`}
            />
          )}
        </Field>
        {showEmailError && (
          <p className="-mt-5 font-ui text-[13px] text-rojo" role="alert">
            Enter a valid email address (e.g. name@example.com).
          </p>
        )}
      </div>

      {/* Contraseña: aparece cuando el correo es valido. */}
      <Collapse open={usingEmail}>
        <div className="space-y-5 pt-5">
          <Field label="Create a Password">
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
      </Collapse>

      <div className="mt-6">
        <PrimaryButton disabled={!ready}>Continue</PrimaryButton>
      </div>

      {/* Google y LinkedIn: se ocultan al elegir registrarse con correo. */}
      <Collapse open={!usingEmail}>
        <div className="pt-6">
          <SocialOptions />
          <p className="mt-7 text-center font-ui text-[14px] text-texto/55">
            Already have an Account?{" "}
            <Link href="/login" className="ml-2 text-primario underline">
              Sign In
            </Link>
          </p>
        </div>
      </Collapse>
    </form>
  );
}

// Correo ya confirmado en el paso 1: no se edita aqui; para cambiarlo se usa
// "Go back", arriba del titulo.
function ConfirmedEmail({ email }: { email: string }) {
  return (
    <div>
      <p className="font-ui text-[16px] text-texto">Email Address</p>
      <div className="mt-1.5 flex items-center gap-3 rounded-full bg-verde/10 py-2 pl-2 pr-4">
        <CheckIcon state="ok" />
        <span className="min-w-0 flex-1 truncate font-ui text-[15px] text-texto">{email}</span>
      </div>
    </div>
  );
}

function GoBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 mb-3 flex items-center gap-1.5 rounded-full px-2 py-1 font-ui text-[14px] text-texto/70 transition-colors hover:bg-texto/[0.06] hover:text-texto"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      Go back
    </button>
  );
}

const INTRO =
  "Become part of a community built on connection, collaboration, and shared experiences. Create your personal profile, explore upcoming events, engage in blog discussions, and connect with fellow members all in one place.";

export default function RegisterForm({
  onProgressChange,
}: {
  // Avisa si hay progreso que se perderia al salir de la pagina.
  onProgressChange: (inProgress: boolean) => void;
}) {
  const [account, setAccount] = useState<Account | null>(null);
  const [step, setStep] = useState<"account" | "profile" | "done">("account");
  const [typed, setTyped] = useState(false);
  const inProgress = step !== "done" && (account !== null || typed);
  useEffect(() => onProgressChange(inProgress), [inProgress, onProgressChange]);

  if (step === "done" && account) {
    return (
      <AuthCard title="Check your email">
        <CheckEmail email={account.email} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Be part of GATT"
      intro={INTRO}
      before={step === "profile" && <GoBackButton onClick={() => setStep("account")} />}
    >
      {step === "profile" && account ? (
        <ProfileForm
          before={<ConfirmedEmail email={account.email} />}
          submitLabel="Continue"
          onSubmit={async (profile) => {
            await register({ ...account, profile });
            setStep("done");
          }}
        />
      ) : (
        <AccountStep
          initial={account}
          onTyped={setTyped}
          onDone={(next) => {
            setAccount(next);
            setStep("profile");
          }}
        />
      )}

      {/* Aun no existe la politica de privacidad. */}
      <p className="mt-6 text-center font-ui text-[14px] text-primario underline">
        Privacy Policy
      </p>
    </AuthCard>
  );
}
