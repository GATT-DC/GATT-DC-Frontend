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

// ---- Blogs ----

export type BlogStatus = "draft" | "published";

// Seccion de texto: subtitulo y parrafos (separados por lineas en blanco).
export type BlogSection = { title: string; body: string };

// Tarjeta de "Our Panelists".
export type Panelist = {
  name: string;
  // Ruta relativa de la foto en S3, o null para el marcador de posicion.
  imageUrl: string | null;
  linkedinUrl: string | null;
};

// Lo que envia el editor. Los textos vacios van como null.
export type BlogPostInput = {
  title: string;
  // Admite *palabras* en cursiva.
  subtitle: string | null;
  eyebrow: string | null;
  metaLabel: string | null;
  authorName: string | null;
  summary: string | null;
  coverImageUrl: string | null;
  heroImageUrls: string[];
  status: BlogStatus;
  sections: BlogSection[];
  // Seccion "Our Panelists"; vacia = no se muestra.
  panelists: Panelist[];
  // Cuantas secciones de texto van antes de "Our Panelists".
  panelistsPosition: number;
};

export type BlogPost = BlogPostInput & {
  id: string;
  slug: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function createBlogPost(post: BlogPostInput) {
  return request<BlogPost>("/blog-posts", { method: "POST", body: JSON.stringify(post) });
}

export function updateBlogPost(id: string, post: BlogPostInput) {
  return request<BlogPost>(`/blog-posts/${id}`, { method: "PUT", body: JSON.stringify(post) });
}

export function deleteBlogPost(id: string) {
  return request<void>(`/blog-posts/${id}`, { method: "DELETE" });
}

// ---- Panel de admin: usuarios ----

export type MembershipType = {
  id: string;
  name: string;
  // Monto que corresponde al tipo, "1500.00".
  annualContribution: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
};

export type ContributionSource = "gofundme" | "manual";

export type Contribution = {
  id: string;
  amount: string;
  currency: string;
  // "YYYY-MM-DD"
  paidAt: string;
  source: ContributionSource;
  externalReference: string | null;
  notes: string | null;
  recordedBy: { id: string; name: string } | null;
  createdAt: string;
};

export type ContributionInput = {
  amount: string;
  paidAt: string;
  source: ContributionSource;
  externalReference: string | null;
  notes: string | null;
};

// Fila del listado de usuarios.
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  createdAt: string;
  profileId: string | null;
  organization: string | null;
  isBoardMember: boolean;
  membershipType: { id: string; name: string } | null;
  totalContributed: string;
};

export type AdminUserPage = { items: AdminUserRow[]; total: number; page: number; pageSize: number };

export type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  createdAt: string;
  // null si todavia no completo su perfil.
  profile: Profile | null;
  contributions: Contribution[];
  totalContributed: string;
};

export type AdminUserAccess = { isAdmin?: boolean; isBoardMember?: boolean; isSuspended?: boolean };

const adminUser = (id: string) => `/admin/users/${encodeURIComponent(id)}`;

export function updateAdminUserProfile(id: string, changes: ProfileUpdate) {
  return request<AdminUserDetail>(`${adminUser(id)}/profile`, { method: "PUT", body: JSON.stringify(changes) });
}

export function setAdminUserMembershipType(id: string, membershipTypeId: string) {
  return request<AdminUserDetail>(`${adminUser(id)}/membership-type`, {
    method: "PUT",
    body: JSON.stringify({ membershipTypeId }),
  });
}

export function setAdminUserAccess(id: string, access: AdminUserAccess) {
  return request<AdminUserDetail>(`${adminUser(id)}/access`, { method: "PUT", body: JSON.stringify(access) });
}

export function addAdminContribution(id: string, contribution: ContributionInput) {
  return request<AdminUserDetail>(`${adminUser(id)}/contributions`, { method: "POST", body: JSON.stringify(contribution) });
}

export function updateAdminContribution(id: string, contributionId: string, contribution: ContributionInput) {
  return request<AdminUserDetail>(`${adminUser(id)}/contributions/${encodeURIComponent(contributionId)}`, {
    method: "PUT",
    body: JSON.stringify(contribution),
  });
}

export function deleteAdminContribution(id: string, contributionId: string) {
  return request<AdminUserDetail>(`${adminUser(id)}/contributions/${encodeURIComponent(contributionId)}`, { method: "DELETE" });
}

// ---- Eventos ----

export type EventStatus = "draft" | "published" | "cancelled";

// Lo que envia el editor de eventos. Fechas como ISO con zona.
export type EventInput = {
  // Admite *palabras* en cursiva.
  name: string;
  description: string;
  venueName: string | null;
  location: string | null;
  meetingUrl: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number | null;
  // Ruta relativa en S3 de la foto de cabecera.
  imageUrl: string | null;
  status: EventStatus;
};

export type GattEvent = Omit<EventInput, "meetingUrl"> & {
  id: string;
  slug: string;
  // Solo llega para inscritos y admins.
  meetingUrl: string | null;
  isOnline: boolean;
  registeredCount: number;
  spotsLeft: number | null;
  isRegistered: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventAttendee = { userId: string; name: string; email: string; registeredAt: string };

export function createEvent(event: EventInput) {
  return request<GattEvent>("/events", { method: "POST", body: JSON.stringify(event) });
}

export function updateEvent(id: string, event: EventInput) {
  return request<GattEvent>(`/events/${id}`, { method: "PUT", body: JSON.stringify(event) });
}

export function deleteEvent(id: string) {
  return request<void>(`/events/${id}`, { method: "DELETE" });
}

export function registerForEvent(id: string) {
  return request<void>(`/events/${id}/registration`, { method: "PUT" });
}

export function cancelEventRegistration(id: string) {
  return request<void>(`/events/${id}/registration`, { method: "DELETE" });
}

export function setEventFavorite(id: string, favorite: boolean) {
  return request<void>(`/events/${id}/favorite`, { method: favorite ? "PUT" : "DELETE" });
}
