// Requisitos de la contraseña: un largo minimo y al menos 3 de 4 tipos de
// caracteres. El backend valida la misma regla.
export const MIN_LENGTH = 8;
export const CHARACTER_TYPES = [
  { label: "Lower case letters (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Upper case letters (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Numbers (0-9)", test: (p: string) => /\d/.test(p) },
  { label: "Special characters (!@#$%&*)", test: (p: string) => /[^a-z0-9\s]/i.test(p) },
];
export const REQUIRED_TYPES = 3;

export function checkPassword(password: string, confirm: string) {
  const longEnough = password.length >= MIN_LENGTH;
  const types = CHARACTER_TYPES.map((type) => ({ ...type, ok: type.test(password) }));
  const enoughTypes = types.filter((type) => type.ok).length >= REQUIRED_TYPES;
  const matches = confirm.length > 0 && confirm === password;
  return { longEnough, types, enoughTypes, matches, valid: longEnough && enoughTypes && matches };
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
