"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { FormEvent } from "react";
import CodeInput, { CODE_LENGTH } from "@/components/auth/CodeInput";
import PhoneInput, { type PhoneValue } from "@/components/auth/PhoneInput";
import { CheckIcon, FormError, FormNotice } from "@/components/auth/ui";
import { authClient } from "@/lib/auth-client";
import { formatPhone, phoneErrorMessage } from "@/lib/phone";

const SMALL_BUTTON =
  "rounded-full bg-texto/[0.06] px-4 py-1.5 font-ui text-[14px] text-texto transition-colors hover:bg-texto/10 disabled:cursor-not-allowed disabled:opacity-40";
const SMALL_PRIMARY =
  "rounded-full bg-primario px-4 py-1.5 font-ui text-[14px] text-white transition-[background-color,opacity] hover:bg-primario-hover disabled:cursor-not-allowed disabled:opacity-40";

// Telefono de la cuenta. Para poder entrar con un codigo por SMS hay que
// verificarlo: se envia un codigo al numero y la persona lo escribe aqui.
export default function PhoneSection({
  verifiedPhone,
  pendingPhone,
}: {
  // Numero ya verificado (con el que puede entrar por SMS).
  verifiedPhone: string | null;
  // Numero que dio al registrarse y todavia no verifico.
  pendingPhone: string | null;
}) {
  const router = useRouter();
  const inputId = useId();
  const [mode, setMode] = useState<"view" | "edit" | "code">("view");
  const [phone, setPhone] = useState<PhoneValue>({ e164: null, empty: true });
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function sendCode(phoneNumber: string) {
    setPending(true);
    setError("");
    setNotice("");
    const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber });
    setPending(false);
    if (error) {
      setError(phoneErrorMessage(error));
      return;
    }
    setTarget(phoneNumber);
    setCode("");
    setMode("code");
    setNotice(`We sent a ${CODE_LENGTH}-digit code to ${formatPhone(phoneNumber)}.`);
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    if (code.length !== CODE_LENGTH || pending) return;
    setPending(true);
    setError("");
    const { error } = await authClient.phoneNumber.verify({
      phoneNumber: target,
      code,
      updatePhoneNumber: true,
    });
    setPending(false);
    if (error) {
      setError(phoneErrorMessage(error));
      return;
    }
    setMode("view");
    setNotice("Your phone number is verified. You can now sign in with a text message code.");
    router.refresh();
  }

  function cancel() {
    setMode("view");
    setError("");
    setNotice("");
  }

  return (
    <div className="border-b border-texto/10 pb-3">
      <p className="font-ui text-[13px] text-texto/55">Phone</p>

      {mode === "view" && (
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          {verifiedPhone ? (
            <span className="flex items-center gap-2 font-ui text-[15px] text-texto">
              {formatPhone(verifiedPhone)}
              <CheckIcon state="ok" />
              <span className="text-[13px] text-verde">Verified</span>
            </span>
          ) : pendingPhone ? (
            <span className="font-ui text-[15px] text-texto">
              {formatPhone(pendingPhone)}
              <span className="ml-2 text-[13px] text-texto/55">Not verified</span>
            </span>
          ) : (
            <span className="font-ui text-[15px] text-texto/55">No phone number yet</span>
          )}
          <div className="flex gap-2">
            {!verifiedPhone && pendingPhone && (
              <button type="button" disabled={pending} onClick={() => sendCode(pendingPhone)} className={SMALL_PRIMARY}>
                Verify
              </button>
            )}
            <button type="button" onClick={() => setMode("edit")} className={SMALL_BUTTON}>
              {verifiedPhone || pendingPhone ? "Change" : "Add"}
            </button>
          </div>
        </div>
      )}

      {mode === "edit" && (
        <form
          noValidate
          className="mt-2 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (phone.e164) sendCode(phone.e164);
          }}
        >
          <PhoneInput id={inputId} onChange={setPhone} autoFocus />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={cancel} className={SMALL_BUTTON}>
              Cancel
            </button>
            <button type="submit" disabled={!phone.e164 || pending} className={SMALL_PRIMARY}>
              Send code
            </button>
          </div>
        </form>
      )}

      {mode === "code" && (
        <form noValidate onSubmit={verify} className="mt-2 space-y-3">
          <label htmlFor={inputId} className="sr-only">
            Verification code
          </label>
          <CodeInput id={inputId} value={code} onChange={setCode} />
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={cancel} className={SMALL_BUTTON}>
              Cancel
            </button>
            <button type="button" disabled={pending} onClick={() => sendCode(target)} className={SMALL_BUTTON}>
              Send a new code
            </button>
            <button type="submit" disabled={code.length !== CODE_LENGTH || pending} className={SMALL_PRIMARY}>
              Verify
            </button>
          </div>
        </form>
      )}

      {(error || notice) && (
        <div className="mt-3">
          <FormError>{error}</FormError>
          <FormNotice>{notice}</FormNotice>
        </div>
      )}
    </div>
  );
}
