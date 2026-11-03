"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import DatePicker from "@/components/register/DatePicker";
import PhoneInput, { type PhoneValue } from "@/components/auth/PhoneInput";
import { Checkbox, Field, FormError, INPUT_CLASS, PrimaryButton } from "@/components/auth/ui";
import { ApiError, type ProfileInput } from "@/lib/api";

// Datos del perfil del miembro: el paso 2 del registro y la pantalla para
// completar el perfil (quien entra con Google o LinkedIn).
export default function ProfileForm({
  before,
  initial,
  submitLabel,
  onSubmit,
}: {
  // Valores con los que arranca el formulario (por ejemplo, el nombre que
  // entrega Google).
  initial?: { firstName?: string; lastName?: string };
  // Va encima de los campos (en el registro, el correo ya confirmado).
  before?: ReactNode;
  submitLabel: string;
  onSubmit: (profile: ProfileInput) => Promise<void>;
}) {
  const [values, setValues] = useState({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    linkedinUrl: "",
    position: "",
    organization: "",
    memberSince: "",
  });
  const [terms, setTerms] = useState(false);
  const [news, setNews] = useState(false);
  const [visible, setVisible] = useState(false);
  // Opcional: vacio o un numero valido.
  const [phone, setPhone] = useState<PhoneValue>({ e164: null, empty: true });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const ready = Object.values(values).every((v) => v.trim()) && terms && (phone.empty || phone.e164 !== null);
  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!ready || pending) return;
    setPending(true);
    setError("");
    try {
      await onSubmit({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        linkedinUrl: values.linkedinUrl.trim(),
        position: values.position.trim(),
        organization: values.organization.trim(),
        ...(phone.e164 ? { phoneNumber: phone.e164 } : {}),
        memberSince: values.memberSince,
        termsAccepted: terms,
        newsletterOptIn: news,
        networkingVisible: visible,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setPending(false);
    }
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
        {before}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-7">
          <Field label="First Name">{input("firstName", "Your name")}</Field>
          <Field label="Last Name">{input("lastName", "Your Last name")}</Field>
        </div>
        <Field label="LinkedIn Profile">
          {input("linkedinUrl", "https://linkedin.com/in/yourprofile", "url")}
        </Field>
        {/* En pares para que el formulario quepa en pantalla sin scroll. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-7">
          <Field label="Current Position">{input("position", "Your job title")}</Field>
          <Field label="Organization / Company">{input("organization", "Where you currently work")}</Field>
        </div>
        <Field
          label="Phone Number (optional)"
          hint="Add it to sign in with a code by text message. You'll confirm it from your account."
        >
          {(id) => <PhoneInput id={id} onChange={setPhone} />}
        </Field>
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

      {error && (
        <div className="mt-5">
          <FormError>{error}</FormError>
        </div>
      )}

      <div className="mt-5">
        <PrimaryButton disabled={!ready} pending={pending}>
          {submitLabel}
        </PrimaryButton>
      </div>
    </form>
  );
}
