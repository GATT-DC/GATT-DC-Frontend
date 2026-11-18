"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import PhoneInput, { type PhoneValue } from "@/components/auth/PhoneInput";
import PhoneSection from "@/components/auth/PhoneSection";
import { FormError, FormNotice } from "@/components/auth/ui";
import { ApiError, updateMyProfile, type Profile, type ProfileUpdate } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { EMAIL_PATTERN } from "@/lib/password";
import { formatPhone } from "@/lib/phone";
import type { SessionUser } from "@/lib/session";

const LINKEDIN_PATTERN = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\//i;
const BIO_MAX = 3000;
// Direccion publica del bucket de S3 (o su CDN) para armar la URL de la foto
// a partir de la ruta relativa que guarda el perfil.
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

const CARD = "rounded-[22px] bg-superficie";
const SMALL_BUTTON =
  "inline-flex items-center gap-1.5 rounded-full border border-texto/40 px-4 py-1 font-ui text-[13px] text-texto transition-colors hover:bg-texto/[0.06] disabled:opacity-50";
const PRIMARY_BUTTON =
  "inline-flex items-center rounded-full bg-naranja px-5 py-1.5 font-ui text-[13px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const INPUT =
  "mt-1 w-full border-b border-texto/25 bg-transparent pb-1.5 font-serif text-[15px] text-texto outline-none transition-colors placeholder:text-texto/35 focus:border-naranja";

function updateFrom(profile: Profile, overrides: Partial<ProfileUpdate> = {}): ProfileUpdate {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    linkedinUrl: profile.linkedinUrl,
    position: profile.position,
    organization: profile.organization,
    phoneNumber: profile.phoneNumber,
    location: profile.location,
    biography: profile.biography,
    ...overrides,
  };
}

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

function PencilIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 20h4L18.5 9.5a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

// Foto del miembro: la suya (S3), la de Google o LinkedIn, o sus iniciales.
// Subir una foto propia todavia no esta disponible.
function Avatar({ profile, user }: { profile: Profile; user: SessionUser }) {
  const url = profile.photoUrl && MEDIA_URL ? `${MEDIA_URL}/${profile.photoUrl}` : user.image;
  // Si la foto no carga (p. ej. un enlace de LinkedIn vencido), van las
  // iniciales.
  const [failed, setFailed] = useState<string | null>(null);
  const src = url && url !== failed ? url : null;
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  return (
    <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
      <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-texto/15 shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
        {src ? (
          // Fotos de otros dominios (Google, LinkedIn, S3): sin optimizar.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Photo of ${profile.firstName}`}
            onError={() => setFailed(src)}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span aria-hidden="true" className="font-heading flex h-full w-full items-center justify-center text-[38px] text-texto/70">
            {initials}
          </span>
        )}
      </div>
      <span
        title="Uploading a photo is coming soon"
        className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#1f1f1f] text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
          <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        <span className="sr-only">Uploading a photo is coming soon</span>
      </span>
    </div>
  );
}

function Badge({ tone, children }: { tone: "green" | "purple"; children: ReactNode }) {
  const style =
    tone === "green" ? "bg-verde/15 text-verde" : "bg-morado/20 text-morado";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-ui text-[12px] ${style}`}>
      {children}
    </span>
  );
}

function ReadField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="font-ui text-[12px] text-texto/60">{label}</dt>
      <dd className="mt-0.5 border-b border-texto/20 pb-1.5 font-serif text-[15px] text-texto [overflow-wrap:anywhere]">
        {children || <span className="text-texto/40">Not added yet</span>}
      </dd>
    </div>
  );
}

function EditField({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="font-ui text-[12px] text-texto/60">
        {label}
      </label>
      {children(id)}
    </div>
  );
}

// Datos personales: se ven en una grilla y se editan en el mismo lugar.
function PersonalInformation({
  profile,
  user,
  onSaved,
}: {
  profile: Profile;
  user: SessionUser;
  onSaved: (profile: Profile) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(() => ({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: user.email,
    organization: profile.organization,
    position: profile.position,
    linkedinUrl: profile.linkedinUrl,
    location: profile.location ?? "",
  }));
  const [phone, setPhone] = useState<PhoneValue>({ e164: profile.phoneNumber, empty: !profile.phoneNumber });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function startEditing() {
    setValues({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: user.email,
      organization: profile.organization,
      position: profile.position,
      linkedinUrl: profile.linkedinUrl,
      location: profile.location ?? "",
    });
    setPhone({ e164: profile.phoneNumber, empty: !profile.phoneNumber });
    setError("");
    setNotice("");
    setEditing(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const required = [values.firstName, values.lastName, values.organization, values.position, values.linkedinUrl];
    if (required.some((value) => !value.trim())) {
      setError("Name, organization, position and LinkedIn can't be empty.");
      return;
    }
    if (!LINKEDIN_PATTERN.test(values.linkedinUrl.trim())) {
      setError("Enter your LinkedIn profile URL (https://www.linkedin.com/in/…).");
      return;
    }
    if (!phone.empty && !phone.e164) {
      setError("Enter a valid phone number or leave it empty.");
      return;
    }
    const email = values.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setPending(true);
    setError("");
    setNotice("");
    try {
      const saved = await updateMyProfile(
        updateFrom(profile, {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          organization: values.organization.trim(),
          position: values.position.trim(),
          linkedinUrl: values.linkedinUrl.trim(),
          location: values.location.trim() || null,
          phoneNumber: phone.e164,
        }),
      );
      onSaved(saved);

      // El correo cambia cuando la persona abre el enlace en el correo nuevo.
      if (email !== user.email.toLowerCase()) {
        const { error: emailError } = await authClient.changeEmail({
          newEmail: email,
          callbackURL: "/profile?notice=email-changed",
        });
        if (emailError) {
          setError(emailError.message || "We couldn't start the email change. Please try again.");
        } else {
          setNotice(`We sent a confirmation link to ${email}. Your email will change when you open it.`);
        }
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  const header = (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-heading text-[18px] font-normal text-texto">Personal Information</h2>
      {!editing && (
        <button type="button" onClick={startEditing} className={SMALL_BUTTON}>
          <PencilIcon />
          Edit
        </button>
      )}
    </div>
  );

  return (
    <section className="border-t border-texto/10 px-5 py-7 sm:px-8">
      {header}
      {(error || notice) && (
        <div className="mt-4 space-y-2">
          <FormError>{error}</FormError>
          <FormNotice>{notice}</FormNotice>
        </div>
      )}

      {editing ? (
        <form onSubmit={save} noValidate className="mt-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <EditField label="First Name">
              {(id) => <input id={id} value={values.firstName} onChange={set("firstName")} autoComplete="given-name" className={INPUT} />}
            </EditField>
            <EditField label="Last Name">
              {(id) => <input id={id} value={values.lastName} onChange={set("lastName")} autoComplete="family-name" className={INPUT} />}
            </EditField>
            <EditField label="Email">
              {(id) => <input id={id} type="email" value={values.email} onChange={set("email")} autoComplete="email" className={INPUT} />}
            </EditField>
            <EditField label="Organization">
              {(id) => <input id={id} value={values.organization} onChange={set("organization")} autoComplete="organization" className={INPUT} />}
            </EditField>
            <EditField label="Position Title">
              {(id) => <input id={id} value={values.position} onChange={set("position")} autoComplete="organization-title" className={INPUT} />}
            </EditField>
            <EditField label="LinkedIn Account">
              {(id) => <input id={id} type="url" value={values.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/yourprofile" className={INPUT} />}
            </EditField>
            <EditField label="City / State">
              {(id) => <input id={id} value={values.location} onChange={set("location")} placeholder="Washington, DC" autoComplete="address-level2" className={INPUT} />}
            </EditField>
            <EditField label="Phone" className="sm:col-span-2">
              {(id) => <PhoneInput id={id} defaultValue={profile.phoneNumber} onChange={setPhone} />}
            </EditField>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setEditing(false)} className={SMALL_BUTTON}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      ) : (
        <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <ReadField label="Full Name">{`${profile.firstName} ${profile.lastName}`}</ReadField>
          <ReadField label="Email">{user.email}</ReadField>
          <ReadField label="Phone">{profile.phoneNumber ? formatPhone(profile.phoneNumber) : ""}</ReadField>
          <ReadField label="Organization">{profile.organization}</ReadField>
          <ReadField label="Position Title">{profile.position}</ReadField>
          <ReadField label="LinkedIn Account">
            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {profile.linkedinUrl.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "")}
            </a>
          </ReadField>
          <ReadField label="City / State">{profile.location ?? ""}</ReadField>
        </dl>
      )}

      {/* Telefono para entrar con un codigo por SMS (se verifica aparte). */}
      <div className="mt-7 max-w-[520px]">
        <PhoneSection
          label="Text message sign-in"
          verifiedPhone={user.phoneNumberVerified && user.phoneNumber ? user.phoneNumber : null}
          pendingPhone={profile.phoneNumber}
        />
      </div>
    </section>
  );
}

// Biografia: vacia invita a completarla; con texto se puede editar.
function Biography({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (profile: Profile) => void;
}) {
  const textareaId = useId();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(profile.biography ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const saved = await updateMyProfile(updateFrom(profile, { biography: text.trim() || null }));
      onSaved(saved);
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  function startEditing() {
    setText(profile.biography ?? "");
    setError("");
    setEditing(true);
  }

  return (
    <section className="border-t border-texto/10 px-5 py-7 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-[18px] font-normal text-texto">Biography</h2>
        {profile.biography && !editing && (
          <button type="button" onClick={startEditing} className={SMALL_BUTTON}>
            <PencilIcon />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={save} noValidate className="mt-5">
          <label htmlFor={textareaId} className="sr-only">
            Biography
          </label>
          <textarea
            id={textareaId}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, BIO_MAX))}
            rows={8}
            autoFocus
            placeholder="Share your background, your areas of focus in international trade and what you're looking for in the network."
            className="w-full resize-y rounded-2xl border border-texto/20 bg-transparent p-4 font-serif text-[15px] leading-[1.5] text-texto outline-none placeholder:text-texto/40 focus:border-naranja"
          />
          <p className="mt-1 text-right font-ui text-[12px] text-texto/50">
            {text.length} / {BIO_MAX}
          </p>
          {error && (
            <div className="mt-2">
              <FormError>{error}</FormError>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setEditing(false)} className={SMALL_BUTTON}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
              {pending ? "Saving…" : "Save biography"}
            </button>
          </div>
        </form>
      ) : profile.biography ? (
        <div className="mt-4 space-y-3 font-serif text-[15px] font-light leading-[1.55] text-texto/90">
          {profile.biography.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center rounded-2xl border-2 border-dashed border-texto/25 px-6 py-14 text-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-texto/10 text-naranja">
            <PencilIcon className="h-4 w-4" />
          </span>
          <p className="font-heading mt-4 text-[17px] text-texto">Tell the community about yourself</p>
          <p className="mt-2 max-w-[440px] font-serif text-[14px] font-light leading-snug text-texto/75">
            Share your background, your areas of focus in international trade and what you&apos;re
            looking for in the network. It&apos;s the last step to complete your profile.
          </p>
          <button type="button" onClick={startEditing} className={`mt-5 ${PRIMARY_BUTTON}`}>
            Complete
          </button>
        </div>
      )}
    </section>
  );
}

// Avance del perfil: cuenta creada, foto, datos personales y biografia.
function completionOf(profile: Profile) {
  const steps = [
    { label: "Set up account", done: true },
    { label: "Upload your photo", done: Boolean(profile.photoUrl) },
    { label: "Personal Information", done: Boolean(profile.phoneNumber && profile.location) },
    { label: "Biography", done: Boolean(profile.biography?.trim()) },
  ];
  const percent = Math.round((steps.filter((step) => step.done).length / steps.length) * 100);
  return { steps, percent };
}

function Completion({ profile }: { profile: Profile }) {
  const { steps, percent } = completionOf(profile);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <aside className={`${CARD} px-6 py-6 shadow-[0_6px_18px_rgba(0,0,0,0.12)]`}>
      <h2 className="font-heading text-center text-[16px] font-normal text-texto">Complete your profile</h2>
      <div className="relative mx-auto mt-5 h-32 w-32">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${percent}% complete`}>
          <circle cx="50" cy="50" r={radius} fill="none" strokeWidth={12} className="stroke-texto/15" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={12}
            strokeLinecap="butt"
            className="stroke-verde transition-[stroke-dashoffset] duration-700"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - percent / 100)}
          />
        </svg>
        {/* La tipografia de titulos no trae el signo %: el numero va en la de UI. */}
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-ui text-[22px] font-medium text-texto">
          {percent}%
        </span>
      </div>
      <ul className="mt-6 space-y-2.5">
        {steps.map((step) => (
          <li
            key={step.label}
            className={`flex items-center gap-3 font-serif text-[14px] ${step.done ? "text-texto" : "text-texto/45"}`}
          >
            <span aria-hidden="true" className="w-4 text-center">{step.done ? "✓" : "✕"}</span>
            {step.label}
            <span className="sr-only">{step.done ? "(done)" : "(pending)"}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function ProfileView({
  user,
  initialProfile,
  notice,
  error,
}: {
  user: SessionUser;
  initialProfile: Profile;
  // Avisos que llegan por la URL (p. ej. al confirmar un correo nuevo).
  notice?: string;
  error?: string;
}) {
  const [profile, setProfile] = useState(initialProfile);
  // Con el perfil completo la tarjeta de avance sobra: se oculta y el perfil
  // ocupa todo el ancho.
  const complete = completionOf(profile).percent === 100;
  const memberSince = new Date(`${profile.memberSince}T00:00:00`).getFullYear();
  const subtitle = [
    profile.position && profile.organization ? `${profile.position} at ${profile.organization}` : "",
    profile.location ?? "",
  ].filter(Boolean);

  return (
    <div
      className={`grid grid-cols-1 gap-6 lg:items-start ${complete ? "" : "lg:grid-cols-[minmax(0,1fr)_260px]"}`}
    >
      <div className="space-y-4">
        {(notice || error) && (
          <div className="space-y-2">
            <FormNotice>{notice}</FormNotice>
            <FormError>{error}</FormError>
          </div>
        )}
        <article className={CARD}>
          {/* Foto, nombre y estado del miembro. */}
          <div className="px-5 pb-5 pt-7 sm:px-8">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <Avatar profile={profile} user={user} />
              <div className="min-w-0">
                <h2 className="font-heading text-[24px] font-normal leading-tight text-texto sm:text-[26px]">
                  {profile.firstName} {profile.lastName}
                </h2>
                {subtitle.length > 0 && (
                  <p className="mt-1 font-serif text-[15px] text-texto/85">{subtitle.join("  •  ")}</p>
                )}
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge tone="green">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                    Active member since {memberSince}
                  </Badge>
                  {profile.isBoardMember && <Badge tone="purple">★ Gatt Board Member</Badge>}
                </div>
              </div>
            </div>
            <p className="mt-4 font-ui text-[11px] text-texto/50">
              Recommendation: Picture size 800 x 800 px · PNG or JPG
            </p>
          </div>

          <PersonalInformation profile={profile} user={user} onSaved={setProfile} />
          <Biography profile={profile} onSaved={setProfile} />
        </article>
      </div>

      {!complete && (
        <div className="order-first lg:order-none lg:sticky lg:top-6">
          <Completion profile={profile} />
        </div>
      )}
    </div>
  );
}
