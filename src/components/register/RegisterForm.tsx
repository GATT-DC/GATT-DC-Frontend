"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import DatePicker from "@/components/register/DatePicker";

// Registro en dos pasos (solo frontend por ahora, sin backend):
// 1. Correo. Al empezar a escribirlo se ocultan las opciones de Google y
//    LinkedIn y aparecen los campos de contraseña con sus requisitos.
// 2. Perfil, con el correo ya puesto.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Requisitos de la contraseña: un largo minimo y al menos 3 de 4 tipos de
// caracteres.
const MIN_LENGTH = 8;
const CHARACTER_TYPES = [
  { label: "Lower case letters (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Upper case letters (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Numbers (0-9)", test: (p: string) => /\d/.test(p) },
  { label: "Special characters (!@#$%&*)", test: (p: string) => /[^a-z0-9\s]/i.test(p) },
];
const REQUIRED_TYPES = 3;

const INPUT_CLASS =
  "mt-1 w-full border-b border-texto/20 bg-transparent pb-1.5 font-ui text-[15px] text-texto outline-none transition-colors placeholder:text-texto/35 focus:border-primario";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-ui text-[16px] text-texto">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1.5 font-ui text-[13px] text-texto/55">{hint}</p>}
    </div>
  );
}

// Bloque que se abre o cierra con transicion de alto y opacidad.
function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

// Estado de un requisito: cumplido (verde), sin cumplir (rojo) o todavia sin
// evaluar porque no se ha escrito nada (gris).
type RequirementState = "ok" | "bad" | "idle";

const REQUIREMENT_STYLE: Record<RequirementState, { text: string; icon: string }> = {
  ok: { text: "text-verde", icon: "bg-verde" },
  bad: { text: "text-rojo", icon: "bg-rojo" },
  idle: { text: "text-texto/55", icon: "bg-texto/20" },
};

function CheckIcon({ state }: { state: RequirementState }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${REQUIREMENT_STYLE[state].icon}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
        <path d={state === "bad" ? "M7 7l10 10M17 7 7 17" : "m5 12.5 4.5 4.5L19 7.5"} />
      </svg>
    </span>
  );
}

function Requirement({
  ok,
  checked,
  children,
}: {
  ok: boolean;
  // Si ya hay algo escrito que evaluar; si no, el requisito se ve en gris.
  checked: boolean;
  children: ReactNode;
}) {
  const state: RequirementState = ok ? "ok" : checked ? "bad" : "idle";
  return (
    <li
      className={`flex items-center gap-2.5 font-ui text-[14px] transition-colors duration-300 ${REQUIREMENT_STYLE[state].text}`}
    >
      <CheckIcon state={state} />
      {children}
    </li>
  );
}

function PrimaryButton({ disabled, children }: { disabled: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-full bg-primario py-2 font-ui text-[15px] text-white transition-[background-color,opacity] hover:bg-primario-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primario"
    >
      {children}
    </button>
  );
}

// Boton de registro con otra cuenta: el logo va en un circulo del alto del
// boton, a la izquierda, y el texto centrado. Google va sobre un circulo
// blanco y el "in" de LinkedIn sobre un circulo de su azul.
const SOCIAL_ICON: Record<string, { src: string; circle: string; size: string }> = {
  google: { src: "google.png", circle: "bg-white", size: "h-6 w-6" },
  linkedin: { src: "linkedin-in.png", circle: "bg-[#4071b1]", size: "h-[18px] w-[18px]" },
};

function SocialButton({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className="relative flex w-full items-center justify-center rounded-full bg-texto/[0.06] py-3 font-ui text-[15px] text-texto transition-colors hover:bg-texto/10"
    >
      <span className={`absolute inset-y-0 left-0 flex aspect-square items-center justify-center overflow-hidden rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.18)] ${SOCIAL_ICON[icon].circle}`}>
        <Image
          src={`/images/register/${SOCIAL_ICON[icon].src}`}
          alt=""
          width={24}
          height={24}
          className={SOCIAL_ICON[icon].size}
        />
      </span>
      {children}
    </button>
  );
}

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
  const longEnough = password.length >= MIN_LENGTH;
  const types = CHARACTER_TYPES.map((type) => ({ ...type, ok: type.test(password) }));
  const enoughTypes = types.filter((type) => type.ok).length >= REQUIRED_TYPES;
  const matches = confirm.length > 0 && confirm === password;
  const ready = emailValid && longEnough && enoughTypes && matches;

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

          <ul className="space-y-1.5" aria-live="polite">
            <Requirement ok={longEnough} checked={password.length > 0}>At least {MIN_LENGTH} characters in length</Requirement>
            <Requirement ok={matches} checked={confirm.length > 0}>Passwords match</Requirement>
            <Requirement ok={enoughTypes} checked={password.length > 0}>
              Contain at least {REQUIRED_TYPES} of the following {CHARACTER_TYPES.length} types of characters:
            </Requirement>
            <li>
              <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 pl-7 sm:grid-cols-2">
                {types.map((type) => (
                  <Requirement key={type.label} ok={type.ok} checked={password.length > 0}>
                    {type.label}
                  </Requirement>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </Collapse>

      <div className="mt-6">
        <PrimaryButton disabled={!ready}>Continue</PrimaryButton>
      </div>

      {/* Google y LinkedIn: se ocultan al elegir registrarse con correo. */}
      <Collapse open={!usingEmail}>
        <div className="pt-6">
          <div className="flex items-center gap-6 font-ui text-[14px] text-texto">
            <span className="h-px flex-1 bg-texto/70" />
            Or
            <span className="h-px flex-1 bg-texto/70" />
          </div>
          <div className="mt-6 space-y-3">
            <SocialButton icon="google">Continue with Google</SocialButton>
            <SocialButton icon="linkedin">Continue with LinkedIn</SocialButton>
          </div>
          <p className="mt-7 text-center font-ui text-[14px] text-texto/55">
            Already have an Account?{" "}
            {/* Aun no existe el inicio de sesion. */}
            <span className="ml-2 text-primario underline">Sign In</span>
          </p>
        </div>
      </Collapse>
    </form>
  );
}

function ProfileStep({ email }: { email: string }) {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    linkedin: "",
    position: "",
    organization: "",
    memberSince: "",
  });
  const [terms, setTerms] = useState(false);
  const [news, setNews] = useState(false);
  const [visible, setVisible] = useState(false);

  const ready = Object.values(values).every((v) => v.trim()) && terms;
  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    // Sin backend todavia: el registro aun no se envia.
  }

  function input(key: keyof typeof values, placeholder: string, type = "text") {
    function renderInput(id: string) {
      return (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={values[key]}
          onChange={set(key)}
          className={INPUT_CLASS}
        />
      );
    }
    return renderInput;
  }

  return (
    <form onSubmit={submit} noValidate className="animate-[register-in_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div className="space-y-4">
        {/* Correo ya confirmado en el paso 1: no se edita aqui; para
            cambiarlo se usa "Go back", arriba del titulo. */}
        <div>
          <p className="font-ui text-[16px] text-texto">Email Address</p>
          <div className="mt-1.5 flex items-center gap-3 rounded-full bg-verde/10 py-2 pl-2 pr-4">
            <CheckIcon state="ok" />
            <span className="min-w-0 flex-1 truncate font-ui text-[15px] text-texto">{email}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-7">
          <Field label="First Name">{input("firstName", "Your name")}</Field>
          <Field label="Last Name">{input("lastName", "Your Last name")}</Field>
        </div>
        <Field label="LinkedIn Profile">
          {input("linkedin", "https://linkedin.com/in/yourprofile", "url")}
        </Field>
        {/* En pares para que el formulario quepa en pantalla sin scroll. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-7">
          <Field label="Current Position">{input("position", "Your job title")}</Field>
          <Field label="Organization / Company">{input("organization", "Where you currently work")}</Field>
        </div>
        <Field label="GATT Member Since" hint="If you're new to GATT, use today's date.">
          {(id) => (
            <DatePicker
              id={id}
              value={values.memberSince}
              onChange={(memberSince) => setValues((v) => ({ ...v, memberSince }))}
              placeholder="Select the date you joined GATT"
              className={INPUT_CLASS}
            />
          )}
        </Field>
      </div>

      <div className="mt-5 space-y-2.5">
        <Checkbox checked={terms} onChange={setTerms}>
          I have read and agree to the Terms and Services
        </Checkbox>
        <Checkbox checked={news} onChange={setNews}>
          Send news, events, and blogs from GATT
        </Checkbox>
        <Checkbox checked={visible} onChange={setVisible}>
          Do you agree to make your profile visible to other GATT members in our Networking section
        </Checkbox>
      </div>

      <div className="mt-5">
        <PrimaryButton disabled={!ready}>Continue</PrimaryButton>
      </div>
    </form>
  );
}

function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 font-ui text-[13px] leading-snug text-texto">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primario"
      />
      {children}
    </label>
  );
}

export default function RegisterForm({
  onProgressChange,
}: {
  // Avisa si hay progreso que se perderia al salir de la pagina.
  onProgressChange: (inProgress: boolean) => void;
}) {
  const [account, setAccount] = useState<Account | null>(null);
  const [step, setStep] = useState<"account" | "profile">("account");
  const [typed, setTyped] = useState(false);
  const inProgress = account !== null || typed;
  useEffect(() => onProgressChange(inProgress), [inProgress, onProgressChange]);

  return (
    <section className="w-full max-w-[572px] rounded-[28px] border border-texto/10 bg-white dark:bg-superficie px-6 py-9 sm:px-10 sm:py-10">
      {/* En el paso 2, vuelve al correo y la contraseña. */}
      {step === "profile" && (
        <button
          type="button"
          onClick={() => setStep("account")}
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
      )}
      <h1 className="font-heading text-[34px] font-normal leading-none text-texto sm:text-[40px]">
        Be part of GATT
      </h1>
      <p className="mt-2.5 font-serif text-[15px] font-light leading-[1.35] text-texto">
        Become part of a community built on connection, collaboration, and
        shared experiences. Create your personal profile, explore upcoming
        events, engage in blog discussions, and connect with fellow members all
        in one place.
      </p>

      <div className="mt-6">
        {step === "profile" && account ? (
          <ProfileStep email={account.email} />
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
      </div>

      {/* Aun no existe la politica de privacidad. */}
      <p className="mt-6 text-center font-ui text-[14px] text-primario underline">
        Privacy Policy
      </p>
    </section>
  );
}
