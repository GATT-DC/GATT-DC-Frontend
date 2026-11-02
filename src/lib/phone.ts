import { parsePhoneNumberFromString } from "libphonenumber-js";

// Mensaje para los errores de Better Auth al pedir o confirmar un codigo SMS.
export function phoneErrorMessage(error: { code?: string; status: number }): string {
  if (error.status === 429) return "Too many codes requested. Wait a few minutes and try again.";
  switch (error.code) {
    case "INVALID_OTP":
      return "That code isn't right. Check it and try again.";
    case "OTP_EXPIRED":
    case "OTP_NOT_FOUND":
      return "That code expired. Ask for a new one.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many wrong codes. Ask for a new one.";
    case "PHONE_NUMBER_EXIST":
      return "That number is already linked to another account.";
    case "INVALID_PHONE_NUMBER":
      return "Enter a valid phone number.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// +12025550123 -> +1 202 555 0123
export function formatPhone(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
}
