"use client";

import { INPUT_CLASS } from "@/components/auth/ui";

export const CODE_LENGTH = 6;

// Campo para el codigo de 6 digitos que llega por SMS. Los celulares lo
// pueden autocompletar desde el mensaje (autocomplete="one-time-code").
export default function CodeInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus
      maxLength={CODE_LENGTH}
      placeholder="000000"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
      className={`${INPUT_CLASS} font-mono tracking-[0.4em]`}
    />
  );
}
