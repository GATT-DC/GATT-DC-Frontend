// Llamadas desde el navegador a la API de Nest (/api/v1/*), a traves del
// proxy de next.config.ts, asi que viajan con la cookie de sesion.

export type ProfileInput = {
  firstName: string;
  lastName: string;
  linkedinUrl: string;
  position: string;
  organization: string;
  // Opcional, en formato internacional (+12025550123). Se guarda sin
  // verificar; se verifica despues desde la cuenta.
  phoneNumber?: string;
  // "YYYY-MM-DD"
  memberSince: string;
  termsAccepted: boolean;
  newsletterOptIn: boolean;
  networkingVisible: boolean;
};

export type Profile = Omit<ProfileInput, "termsAccepted" | "phoneNumber"> & {
  id: string;
  phoneNumber: string | null;
  // Ciudad y estado, p. ej. "Washington, DC".
  location: string | null;
  biography: string | null;
  // Ruta relativa de la foto en S3 (no la URL completa).
  photoUrl: string | null;
  isBoardMember: boolean;
  membershipType?: { id: string; name: string };
  userId: string;
  termsAcceptedAt: string;
  createdAt: string;
  updatedAt: string;
};

// Lo que el miembro puede editar desde "My profile". null borra el campo.
export type ProfileUpdate = {
  firstName: string;
  lastName: string;
  linkedinUrl: string;
  position: string;
  organization: string;
  phoneNumber: string | null;
  location: string | null;
  biography: string | null;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const GENERIC_ERROR = "Something went wrong. Please try again.";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...init,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(0, "We couldn't reach the server. Check your connection and try again.");
  }
  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!response.ok) {
    // Nest devuelve { message } con un texto o, si falla la validacion, una
    // lista de textos.
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new ApiError(response.status, response.status >= 500 ? GENERIC_ERROR : message ?? GENERIC_ERROR);
  }
  return body as T;
}

export function register(data: { email: string; password: string; profile: ProfileInput }) {
  return request<void>("/registrations", { method: "POST", body: JSON.stringify(data) });
}

export function updateMyProfile(changes: ProfileUpdate) {
  return request<Profile>("/profiles/me", { method: "PUT", body: JSON.stringify(changes) });
}

export function createProfile(profile: ProfileInput) {
  return request<Profile>("/profiles", { method: "POST", body: JSON.stringify(profile) });
}
