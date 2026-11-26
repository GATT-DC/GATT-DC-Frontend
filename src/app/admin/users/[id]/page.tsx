import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminUserDetail from "@/components/admin/AdminUserDetail";
import MemberShell from "@/components/member/MemberShell";
import { requireAdmin } from "@/lib/admin";
import { getAdminUser, getMembershipTypes } from "@/lib/session";

export const metadata: Metadata = {
  title: "Member details — GATT DC",
};

// Detalle de un usuario en el panel de admin.
export default async function AdminUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  const { name, user } = await requireAdmin(`/admin/users/${id}`);
  const [detail, types] = await Promise.all([getAdminUser(id), getMembershipTypes()]);
  if (!detail) notFound();

  return (
    <MemberShell name={name} current="/admin/users" isAdmin>
      <Link
        href="/admin/users"
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-texto/40 px-4 py-1.5 font-ui text-[13px] text-texto transition-colors hover:bg-texto/[0.06]"
      >
        ← All members
      </Link>
      <AdminUserDetail initialUser={detail} types={types} currentUserId={user.id} />
    </MemberShell>
  );
}
