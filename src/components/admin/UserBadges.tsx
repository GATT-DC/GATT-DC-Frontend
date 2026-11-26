// Etiquetas del estado de un usuario en el panel de admin.

const BADGE = "inline-flex items-center rounded-full px-2.5 py-0.5 font-ui text-[11px] font-medium leading-5 whitespace-nowrap";

export function Badge({ tone, children }: { tone: "admin" | "board" | "suspended" | "warning" | "muted"; children: string }) {
  const tones = {
    admin: "bg-amarillo text-[#141414]",
    board: "bg-morado text-white",
    suspended: "bg-rojo text-white",
    warning: "border border-naranja text-naranja",
    muted: "border border-texto/30 text-texto/60",
  };
  return <span className={`${BADGE} ${tones[tone]}`}>{children}</span>;
}

export default function UserBadges({
  isAdmin,
  isBoardMember,
  isSuspended,
  emailVerified,
  hasProfile,
}: {
  isAdmin: boolean;
  isBoardMember: boolean;
  isSuspended: boolean;
  emailVerified: boolean;
  hasProfile: boolean;
}) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {isSuspended && <Badge tone="suspended">Suspended</Badge>}
      {isAdmin && <Badge tone="admin">Admin</Badge>}
      {isBoardMember && <Badge tone="board">Board</Badge>}
      {!emailVerified && <Badge tone="warning">Email not verified</Badge>}
      {!hasProfile && <Badge tone="muted">Profile incomplete</Badge>}
    </span>
  );
}

// Iniciales para cuando no hay foto.
export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? parts[parts.length - 1][0] : ""}`.toUpperCase() || "?";
}
