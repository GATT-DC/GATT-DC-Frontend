"use client";

import Image from "next/image";
import { useId } from "react";
import type { ReactNode } from "react";
import { CHARACTER_TYPES, MIN_LENGTH, REQUIRED_TYPES, checkPassword } from "@/lib/password";

// Piezas compartidas por el registro, el inicio de sesion y el resto de
// pantallas de cuenta, para que todas se vean igual.

export const INPUT_CLASS =
  "mt-1 w-full border-b border-texto/20 bg-transparent pb-1.5 font-ui text-[15px] text-texto outline-none transition-colors placeholder:text-texto/35 focus:border-primario";

// Tarjeta blanca centrada con titulo y texto de introduccion.
export function AuthCard({
  title,
  intro,
  before,
  children,
}: {
  title: string;
  intro?: ReactNode;
  // Va encima del titulo (por ejemplo, el boton "Go back").
  before?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="w-full max-w-[572px] rounded-[28px] border border-texto/10 bg-white dark:bg-superficie px-6 py-9 sm:px-10 sm:py-10">
      {before}
      <h1 className="font-heading text-[34px] font-normal leading-none text-texto sm:text-[40px]">
        {title}
      </h1>
      {intro && (
        <p className="mt-2.5 font-serif text-[15px] font-light leading-[1.35] text-texto">
          {intro}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  aside,
  children,
}: {
  label: string;
  hint?: string;
  // Va a la derecha de la etiqueta (por ejemplo, "Forgot password?").
  aside?: ReactNode;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-ui text-[16px] text-texto">
          {label}
        </label>
        {aside}
      </div>
      {children(id)}
      {hint && <p className="mt-1.5 font-ui text-[13px] text-texto/55">{hint}</p>}
    </div>
  );
}

// Bloque que se abre o cierra con transicion de alto y opacidad.
export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
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

export function CheckIcon({ state }: { state: RequirementState }) {
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

// Lista de requisitos de la contraseña, que se marcan mientras se escribe.
export function PasswordRequirements({ password, confirm }: { password: string; confirm: string }) {
  const { longEnough, types, enoughTypes, matches } = checkPassword(password, confirm);
  return (
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
  );
}

export function PrimaryButton({
  disabled,
  pending = false,
  children,
}: {
  disabled: boolean;
  // Mientras se envia: el boton queda deshabilitado y muestra "...".
  pending?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className="w-full rounded-full bg-primario py-2 font-ui text-[15px] text-white transition-[background-color,opacity] hover:bg-primario-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primario"
    >
      {pending ? "Please wait…" : children}
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

export function SocialButton({
  icon,
  onClick,
  children,
}: {
  icon: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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

// Separador "Or" y los botones de Google y LinkedIn.
export function SocialOptions() {
  return (
    <>
      <div className="flex items-center gap-6 font-ui text-[14px] text-texto">
        <span className="h-px flex-1 bg-texto/70" />
        Or
        <span className="h-px flex-1 bg-texto/70" />
      </div>
      <div className="mt-6 space-y-3">
        {/* Se conectan en la siguiente fase (Google y LinkedIn). */}
        <SocialButton icon="google">Continue with Google</SocialButton>
        <SocialButton icon="linkedin">Continue with LinkedIn</SocialButton>
      </div>
    </>
  );
}

export function Checkbox({
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

// Mensaje de error de un formulario (por ejemplo, la respuesta del servidor).
export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-2xl bg-rojo/10 px-4 py-2.5 font-ui text-[14px] text-rojo">
      {children}
    </p>
  );
}

// Mensaje de confirmacion (por ejemplo, "te enviamos un correo").
export function FormNotice({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="rounded-2xl bg-verde/10 px-4 py-2.5 font-ui text-[14px] text-texto">
      {children}
    </p>
  );
}
