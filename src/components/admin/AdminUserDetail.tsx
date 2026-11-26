"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Avatar from "@/components/admin/Avatar";
import UserBadges from "@/components/admin/UserBadges";
import { FormError, FormNotice } from "@/components/auth/ui";
import {
  ApiError,
  addAdminContribution,
  deleteAdminContribution,
  setAdminUserAccess,
  setAdminUserMembershipType,
  updateAdminContribution,
  updateAdminUserProfile,
  type AdminUserAccess,
  type AdminUserDetail as Detail,
  type Contribution,
  type ContributionInput,
  type MembershipType,
  type ProfileUpdate,
} from "@/lib/api";
import { formatDate, formatMoney, formatTimestamp, today } from "@/lib/format";

const CARD = "rounded-[22px] bg-superficie p-5 sm:p-6";
const CARD_TITLE = "font-heading text-[22px] leading-tight text-texto";
const LABEL = "block font-ui text-[12px] uppercase tracking-wide text-texto/55";
const INPUT =
  "mt-1 w-full rounded-[10px] border border-texto/20 bg-fondo px-3 py-2 font-ui text-[14px] text-texto outline-none transition-colors placeholder:text-texto/35 focus:border-amarillo disabled:opacity-50";
const PRIMARY =
  "inline-flex items-center rounded-full bg-amarillo px-5 py-1.5 font-ui text-[13px] font-medium text-[#141414] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const SECONDARY =
  "inline-flex items-center rounded-full border border-texto/30 px-4 py-1.5 font-ui text-[13px] text-texto transition-colors hover:bg-texto/[0.06] disabled:opacity-50";
const LINK_BUTTON = "font-ui text-[13px] text-texto/70 underline-offset-2 hover:text-texto hover:underline disabled:opacity-40";

const SOURCES: Record<string, string> = { gofundme: "GoFundMe", manual: "Manual (cash, check…)" };

function message(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      {children}
      {hint && <span className="mt-1 block font-ui text-[12px] text-texto/45">{hint}</span>}
    </label>
  );
}

// Interruptor accesible (role="switch").
function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${checked ? "bg-amarillo" : "bg-texto/25"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

const emptyContribution = (): ContributionInput => ({ amount: "", paidAt: today(), source: "gofundme", externalReference: null, notes: null });

// Formulario para registrar o corregir un aporte.
function ContributionForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: ContributionInput;
  onSave: (input: ContributionInput) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (changes: Partial<ContributionInput>) => setForm((f) => ({ ...f, ...changes }));
  function submit(e: FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      amount: form.amount.replace(/[$,\s]/g, ""),
      externalReference: form.externalReference?.trim() || null,
      notes: form.notes?.trim() || null,
    });
  }
  return (
    <form onSubmit={submit} className="mt-4 grid gap-4 rounded-[16px] border border-texto/15 p-4 sm:grid-cols-2">
      <Field label="Amount (USD)">
        <input
          required
          inputMode="decimal"
          value={form.amount}
          onChange={(e) => set({ amount: e.target.value })}
          placeholder="1500.00"
          pattern="\$?\s*[\d,]{1,11}(\.\d{1,2})?"
          title="A number like 1500 or 250.50"
          className={INPUT}
          autoFocus
        />
      </Field>
      <Field label="Payment date">
        <input required type="date" value={form.paidAt} max={today()} onChange={(e) => set({ paidAt: e.target.value })} className={INPUT} />
      </Field>
      <Field label="Source">
        <select value={form.source} onChange={(e) => set({ source: e.target.value as ContributionInput["source"] })} className={INPUT}>
          {Object.entries(SOURCES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Payment reference (optional)" hint="E.g. the GoFundMe donation id. The same reference can't be recorded twice.">
        <input value={form.externalReference ?? ""} onChange={(e) => set({ externalReference: e.target.value })} maxLength={100} className={INPUT} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Notes (optional)">
          <textarea value={form.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} rows={2} maxLength={1000} className={INPUT} />
        </Field>
      </div>
      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" disabled={saving} className={PRIMARY}>
          {saving ? "Saving…" : "Save contribution"}
        </button>
        <button type="button" onClick={onCancel} className={SECONDARY}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Contributions({ user, onChange }: { user: Detail; onChange: (next: Detail, notice?: string) => void }) {
  // "new", el id del aporte que se edita, o null.
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<Detail>) {
    setSaving(true);
    setError(null);
    try {
      const next = await action();
      const before = user.profile?.membershipType?.name;
      const after = next.profile?.membershipType?.name;
      onChange(next, after && after !== before ? `Membership type updated to ${after} based on the total donated.` : undefined);
      setEditing(null);
    } catch (err) {
      setError(message(err));
    } finally {
      setSaving(false);
    }
  }

  const toInput = (c: Contribution): ContributionInput => ({
    amount: Number(c.amount).toFixed(2),
    paidAt: c.paidAt,
    source: c.source,
    externalReference: c.externalReference,
    notes: c.notes,
  });

  return (
    <section className={CARD} aria-labelledby="contributions-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="contributions-title" className={CARD_TITLE}>
            Contributions
          </h2>
          <p className="mt-1 font-ui text-[13px] text-texto/55">The total is the sum of all contributions.</p>
        </div>
        <div className="text-right">
          <p className="font-ui text-[12px] uppercase tracking-wide text-texto/55">Total donated</p>
          <p className="font-heading text-[30px] leading-none tabular-nums text-amarillo">{formatMoney(user.totalContributed)}</p>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      )}

      {editing === "new" ? (
        <ContributionForm
          initial={emptyContribution()}
          saving={saving}
          onCancel={() => setEditing(null)}
          onSave={(input) => run(() => addAdminContribution(user.id, input))}
        />
      ) : (
        <button type="button" onClick={() => setEditing("new")} disabled={editing !== null} className={`${PRIMARY} mt-4`}>
          + Add contribution
        </button>
      )}

      {user.contributions.length === 0 ? (
        <p className="mt-5 font-ui text-[14px] text-texto/55">No contributions recorded yet.</p>
      ) : (
        <ul className="mt-5 divide-y divide-texto/10">
          {user.contributions.map((c) =>
            editing === c.id ? (
              <li key={c.id}>
                <ContributionForm
                  initial={toInput(c)}
                  saving={saving}
                  onCancel={() => setEditing(null)}
                  onSave={(input) => run(() => updateAdminContribution(user.id, c.id, input))}
                />
              </li>
            ) : (
              <li key={c.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 py-3">
                <div className="min-w-0">
                  <p className="font-ui text-[15px] font-medium tabular-nums text-texto">{formatMoney(c.amount)}</p>
                  <p className="font-ui text-[13px] text-texto/60">
                    {formatDate(c.paidAt)} · {SOURCES[c.source] ?? c.source}
                    {c.externalReference && <> · Ref. {c.externalReference}</>}
                  </p>
                  {c.notes && <p className="mt-1 font-ui text-[13px] text-texto/75">{c.notes}</p>}
                  {c.recordedBy && <p className="mt-1 font-ui text-[12px] text-texto/40">Recorded by {c.recordedBy.name}</p>}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setEditing(c.id)} disabled={editing !== null} className={LINK_BUTTON}>
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={editing !== null || saving}
                    onClick={() => {
                      if (window.confirm(`Delete the ${formatMoney(c.amount)} contribution from ${formatDate(c.paidAt)}?`)) {
                        void run(() => deleteAdminContribution(user.id, c.id));
                      }
                    }}
                    className={`${LINK_BUTTON} text-rojo hover:text-rojo`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}

function Membership({ user, types, onChange }: { user: Detail; types: MembershipType[]; onChange: (next: Detail, notice?: string) => void }) {
  const current = user.profile?.membershipType?.id ?? "";
  const [selected, setSelected] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = types.filter((type) => type.isActive);

  async function apply() {
    setSaving(true);
    setError(null);
    try {
      const next = await setAdminUserMembershipType(user.id, selected);
      onChange(next, `Membership type changed to ${next.profile?.membershipType?.name}.`);
    } catch (err) {
      setError(message(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={CARD} aria-labelledby="membership-title">
      <h2 id="membership-title" className={CARD_TITLE}>
        Membership type
      </h2>
      {!user.profile ? (
        <p className="mt-2 font-ui text-[14px] text-texto/60">Available once the user completes their profile.</p>
      ) : (
        <>
          <p className="font-heading mt-2 text-[28px] leading-none text-texto">{user.profile.membershipType?.name}</p>
          <ul className="mt-4 space-y-1 font-ui text-[13px]">
            {active.map((type) => (
              <li key={type.id} className={`flex justify-between ${type.id === current ? "font-medium text-amarillo" : "text-texto/55"}`}>
                <span>{type.name}</span>
                <span className="tabular-nums">from {formatMoney(type.annualContribution)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-ui text-[12px] leading-relaxed text-texto/50">
            It updates automatically when contributions change. You can set it by hand; the next contribution change recalculates it.
          </p>
          <div className="mt-4 flex gap-2">
            <select aria-label="Membership type" value={selected} onChange={(e) => setSelected(e.target.value)} className={`${INPUT} mt-0 flex-1`}>
              {active.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={apply} disabled={saving || selected === current} className={PRIMARY}>
              {saving ? "Saving…" : "Apply"}
            </button>
          </div>
          {error && (
            <div className="mt-3">
              <FormError>{error}</FormError>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Access({ user, isSelf, onChange }: { user: Detail; isSelf: boolean; onChange: (next: Detail, notice?: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(access: AdminUserAccess, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setSaving(true);
    setError(null);
    try {
      onChange(await setAdminUserAccess(user.id, access));
    } catch (err) {
      setError(message(err));
    } finally {
      setSaving(false);
    }
  }

  const rows: { label: string; help: string; checked: boolean; disabled: boolean; onToggle: () => void }[] = [
    {
      label: "Admin",
      help: isSelf ? "You can't remove your own admin access." : "Can manage members and publish blogs.",
      checked: user.isAdmin,
      disabled: isSelf,
      onToggle: () =>
        toggle(
          { isAdmin: !user.isAdmin },
          user.isAdmin ? `Remove admin access from ${user.name}?` : `Make ${user.name} an admin? They'll be able to manage every member.`,
        ),
    },
    {
      label: "Board member",
      help: user.profile ? "Shows the “Gatt Board Member” badge." : "Available once the user completes their profile.",
      checked: user.profile?.isBoardMember ?? false,
      disabled: !user.profile,
      onToggle: () => toggle({ isBoardMember: !user.profile?.isBoardMember }),
    },
    {
      label: "Suspended",
      help: isSelf ? "You can't suspend your own account." : "Can't sign in by any method. Open sessions are closed.",
      checked: user.isSuspended,
      disabled: isSelf,
      onToggle: () =>
        toggle(
          { isSuspended: !user.isSuspended },
          user.isSuspended ? `Reactivate ${user.name}'s account?` : `Suspend ${user.name}? They'll be signed out and won't be able to sign in.`,
        ),
    },
  ];

  return (
    <section className={CARD} aria-labelledby="access-title">
      <h2 id="access-title" className={CARD_TITLE}>
        Access
      </h2>
      <ul className="mt-3 divide-y divide-texto/10">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="font-ui text-[14px] font-medium text-texto">{row.label}</p>
              <p className="font-ui text-[12px] text-texto/55">{row.help}</p>
            </div>
            <Switch checked={row.checked} onChange={row.onToggle} disabled={row.disabled || saving} label={row.label} />
          </li>
        ))}
      </ul>
      {error && <FormError>{error}</FormError>}
    </section>
  );
}

function ProfileData({ user, onChange }: { user: Detail; onChange: (next: Detail, notice?: string) => void }) {
  const profile = user.profile;
  const initial: ProfileUpdate | null = profile && {
    firstName: profile.firstName,
    lastName: profile.lastName,
    linkedinUrl: profile.linkedinUrl,
    position: profile.position,
    organization: profile.organization,
    phoneNumber: profile.phoneNumber,
    location: profile.location,
    biography: profile.biography,
  };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile || !form) {
    return (
      <section className={CARD}>
        <h2 className={CARD_TITLE}>Profile</h2>
        <p className="mt-2 font-ui text-[14px] text-texto/60">
          This user hasn&apos;t completed their profile yet (they created an account but didn&apos;t finish registration).
        </p>
      </section>
    );
  }

  const set = (changes: Partial<ProfileUpdate>) => setForm((f) => (f ? { ...f, ...changes } : f));
  const text = (key: keyof ProfileUpdate) => (form[key] as string | null) ?? "";

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const next = await updateAdminUserProfile(user.id, {
        ...form,
        phoneNumber: form.phoneNumber?.trim() || null,
        location: form.location?.trim() || null,
        biography: form.biography?.trim() || null,
      });
      onChange(next, "Profile saved.");
    } catch (err) {
      setError(message(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className={CARD} aria-labelledby="profile-title">
      <h2 id="profile-title" className={CARD_TITLE}>
        Profile
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="First name">
          <input required value={text("firstName")} onChange={(e) => set({ firstName: e.target.value })} maxLength={100} className={INPUT} />
        </Field>
        <Field label="Last name">
          <input required value={text("lastName")} onChange={(e) => set({ lastName: e.target.value })} maxLength={100} className={INPUT} />
        </Field>
        <Field label="Position">
          <input required value={text("position")} onChange={(e) => set({ position: e.target.value })} maxLength={150} className={INPUT} />
        </Field>
        <Field label="Organization">
          <input required value={text("organization")} onChange={(e) => set({ organization: e.target.value })} maxLength={150} className={INPUT} />
        </Field>
        <Field label="LinkedIn">
          <input required type="url" value={text("linkedinUrl")} onChange={(e) => set({ linkedinUrl: e.target.value })} maxLength={300} className={INPUT} />
        </Field>
        <Field label="Phone (optional)" hint="International format, e.g. +12025550123.">
          <input type="tel" value={text("phoneNumber")} onChange={(e) => set({ phoneNumber: e.target.value })} className={INPUT} />
        </Field>
        <Field label="City / State (optional)">
          <input value={text("location")} onChange={(e) => set({ location: e.target.value })} maxLength={150} className={INPUT} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Biography (optional)">
            <textarea value={text("biography")} onChange={(e) => set({ biography: e.target.value })} rows={4} maxLength={3000} className={INPUT} />
          </Field>
        </div>
      </div>
      {error && (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      )}
      <button type="submit" disabled={saving} className={`${PRIMARY} mt-5`}>
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

// Detalle de un usuario en el panel de admin. Cada accion devuelve el usuario
// actualizado, que reemplaza al que se muestra.
export default function AdminUserDetail({
  initialUser,
  types,
  currentUserId,
}: {
  initialUser: Detail;
  types: MembershipType[];
  currentUserId: string;
}) {
  const [user, setUser] = useState(initialUser);
  const [notice, setNotice] = useState<string | null>(null);
  // Cambia cuando llega el usuario actualizado: reinicia los formularios
  // que copian sus datos.
  const [version, setVersion] = useState(0);

  function onChange(next: Detail, text?: string) {
    setUser(next);
    setNotice(text ?? null);
    setVersion((v) => v + 1);
  }

  return (
    <div className="space-y-6">
      <header className={`${CARD} flex flex-col gap-4 sm:flex-row sm:items-center`}>
        <Avatar name={user.name} image={user.image} size={72} />
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-[30px] leading-tight text-texto sm:text-[36px]">{user.name}</h1>
          <p className="truncate font-ui text-[14px] text-texto/60">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <UserBadges
              isAdmin={user.isAdmin}
              isBoardMember={user.profile?.isBoardMember ?? false}
              isSuspended={user.isSuspended}
              emailVerified={user.emailVerified}
              hasProfile={user.profile !== null}
            />
            <span className="font-ui text-[12px] text-texto/45">Joined {formatTimestamp(user.createdAt)}</span>
          </div>
        </div>
      </header>

      {notice && <FormNotice>{notice}</FormNotice>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Contributions key={`c${version}`} user={user} onChange={onChange} />
        <div className="space-y-6">
          <Membership key={`m${version}`} user={user} types={types} onChange={onChange} />
          <Access user={user} isSelf={user.id === currentUserId} onChange={onChange} />
        </div>
      </div>

      <ProfileData key={`p${version}`} user={user} onChange={onChange} />
    </div>
  );
}
