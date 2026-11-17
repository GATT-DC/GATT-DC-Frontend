"use client";

import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import { useMemo, useState, useSyncExternalStore } from "react";
import { INPUT_CLASS } from "@/components/auth/ui";

const DEFAULT_COUNTRY: CountryCode = "US";

// Paises ordenados por nombre, con Estados Unidos primero (la mayoria de los
// miembros estan alli). Los nombres salen de Intl, y Node y el navegador no
// siempre los escriben igual (por ejemplo "Falkland Islands (Islas
// Malvinas)"), asi que la lista completa solo se arma en el navegador.
function buildCountries() {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  return getCountries()
    .map((code) => ({ code, name: regionNames.of(code) ?? code, dial: getCountryCallingCode(code) }))
    .sort((a, b) =>
      a.code === DEFAULT_COUNTRY ? -1 : b.code === DEFAULT_COUNTRY ? 1 : a.name.localeCompare(b.name),
    );
}

// true en el navegador ya hidratado; false en el servidor y al hidratar.
const noopSubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export type PhoneValue = {
  // Numero en formato internacional (+12025550123), o null si no es valido.
  e164: string | null;
  // Si el campo esta vacio.
  empty: boolean;
};

// Telefono con selector de pais. Avisa con el numero ya en formato
// internacional, que es como lo guarda el backend.
export default function PhoneInput({
  id,
  onChange,
  autoFocus = false,
}: {
  id: string;
  onChange: (value: PhoneValue) => void;
  autoFocus?: boolean;
}) {
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);
  const hydrated = useHydrated();
  // Antes de hidratar solo va el pais elegido, con su codigo (igual en el
  // servidor y en el navegador).
  const countries = useMemo(
    () =>
      hydrated
        ? buildCountries()
        : [{ code: country, name: country, dial: getCountryCallingCode(country) }],
    [hydrated, country],
  );

  const parsed = text.trim() ? parsePhoneNumberFromString(text, country) : undefined;
  const valid = Boolean(parsed?.isValid());
  const showError = touched && text.trim() !== "" && !valid;

  function update(nextCountry: CountryCode, nextText: string) {
    setCountry(nextCountry);
    setText(nextText);
    const next = nextText.trim() ? parsePhoneNumberFromString(nextText, nextCountry) : undefined;
    onChange({ e164: next?.isValid() ? next.number : null, empty: !nextText.trim() });
  }

  return (
    <div>
      <div className="flex items-end gap-3">
        <select
          aria-label="Country"
          value={country}
          onChange={(e) => update(e.target.value as CountryCode, text)}
          className={`${INPUT_CLASS} w-[42%] max-w-[190px] shrink-0 cursor-pointer bg-white dark:bg-superficie`}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} (+{c.dial})
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          placeholder="Your phone number"
          value={text}
          onChange={(e) => update(country, e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={showError}
          className={`${INPUT_CLASS} min-w-0 flex-1 ${showError ? "border-rojo!" : ""}`}
        />
      </div>
      {showError && (
        <p className="mt-1.5 font-ui text-[13px] text-rojo" role="alert">
          Enter a valid phone number for the selected country.
        </p>
      )}
    </div>
  );
}
