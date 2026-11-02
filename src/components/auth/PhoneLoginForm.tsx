"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import CodeInput, { CODE_LENGTH } from "@/components/auth/CodeInput";
import PhoneInput, { type PhoneValue } from "@/components/auth/PhoneInput";
import { Field, FormError, FormNotice, PrimaryButton } from "@/components/auth/ui";
import { authClient } from "@/lib/auth-client";
import { formatPhone, phoneErrorMessage } from "@/lib/phone";

// Inicio de sesion con un codigo por SMS. Solo funciona con un telefono ya
// verificado desde la cuenta.
export default function PhoneLoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"number" | "code">("number");
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
    setStep("code");
    // Mismo mensaje tenga o no cuenta ese numero, para no revelarlo.
    setNotice(
      `If ${formatPhone(phoneNumber)} is linked to a GATT account, we sent it a ${CODE_LENGTH}-digit code. It expires in 5 minutes.`,
    );
  }

  async function submitNumber(e: FormEvent) {
    e.preventDefault();
    if (phone.e164 && !pending) await sendCode(phone.e164);
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    if (code.length !== CODE_LENGTH || pending) return;
    setPending(true);
    setError("");
    const { error } = await authClient.phoneNumber.verify({ phoneNumber: target, code });
    if (!error) {
      router.replace(next);
      router.refresh();
      return;
    }
    setPending(false);
    // Un numero sin cuenta tambien termina aqui: se responde como a un
    // codigo incorrecto.
    setError(error.status >= 500 ? phoneErrorMessage({ code: "INVALID_OTP", status: 400 }) : phoneErrorMessage(error));
  }

  if (step === "code") {
    return (
      <form onSubmit={submitCode} noValidate>
        <FormNotice>{notice}</FormNotice>
        <div className="mt-5">
          <Field label="Verification code">
            {(id) => <CodeInput id={id} value={code} onChange={setCode} />}
          </Field>
        </div>
        {error && (
          <div className="mt-5">
            <FormError>{error}</FormError>
          </div>
        )}
        <div className="mt-6">
          <PrimaryButton disabled={code.length !== CODE_LENGTH} pending={pending}>
            Sign In
          </PrimaryButton>
        </div>
        <div className="mt-5 flex justify-center gap-6 font-ui text-[14px]">
          <button type="button" onClick={() => sendCode(target)} disabled={pending} className="text-primario underline disabled:opacity-50">
            Send a new code
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("number");
              setError("");
              setNotice("");
            }}
            className="text-primario underline"
          >
            Use another number
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submitNumber} noValidate>
      <Field label="Phone Number" hint="Use the number you verified in your account.">
        {(id) => <PhoneInput id={id} onChange={setPhone} />}
      </Field>
      {error && (
        <div className="mt-5">
          <FormError>{error}</FormError>
        </div>
      )}
      <div className="mt-6">
        <PrimaryButton disabled={!phone.e164} pending={pending}>
          Send code
        </PrimaryButton>
      </div>
    </form>
  );
}
