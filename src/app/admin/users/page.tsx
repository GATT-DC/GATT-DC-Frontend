import type { Metadata } from "next";
import Link from "next/link";
import Avatar from "@/components/admin/Avatar";
import UserBadges from "@/components/admin/UserBadges";
import UserFilters, { type UserFilterValues } from "@/components/admin/UserFilters";
import MemberShell from "@/components/member/MemberShell";
import { requireAdmin } from "@/lib/admin";
import { formatMoney, formatTimestamp } from "@/lib/format";
import { getAdminUsers, getMembershipTypes } from "@/lib/session";

export const metadata: Metadata = {
  title: "Manage members — GATT DC",
};

const FILTER_KEYS = ["search", "membershipTypeId", "role", "status", "sort"] as const;

// Panel de admin: todos los usuarios, con filtros y paginas de 25.
export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const { name } = await requireAdmin("/admin/users");
  const params = await searchParams;
  const pick = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const values = Object.fromEntries(FILTER_KEYS.map((key) => [key, pick(key)])) as UserFilterValues;
  const page = Math.max(1, Number(pick("page")) || 1);

  const filters = Object.fromEntries(Object.entries({ ...values, page: page > 1 ? String(page) : "" }).filter(([, v]) => v));
  const [result, types] = await Promise.all([getAdminUsers(filters), getMembershipTypes()]);
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const pageHref = (n: number) => {
    const query = new URLSearchParams({ ...filters, page: String(n) });
    if (n === 1) query.delete("page");
    const text = query.toString();
    return `/admin/users${text ? `?${text}` : ""}`;
  };

  return (
    <MemberShell name={name} current="/admin/users" isAdmin>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-[44px] font-normal leading-none text-texto lg:text-[56px]">
          <span className="font-script mr-4 text-[1.15em] text-verde">Manage</span>members
        </h1>
        <p className="font-ui text-[14px] text-texto/60">
          {result.total} {result.total === 1 ? "account" : "accounts"}
        </p>
      </div>

      <UserFilters values={values} types={types} />

      {result.items.length === 0 ? (
        <p className="mt-8 rounded-[22px] bg-superficie p-8 text-center font-serif text-[16px] text-texto/70">
          No members match these filters.
        </p>
      ) : (
        <>
          {/* Escritorio: tabla. */}
          <div className="mt-6 hidden overflow-hidden rounded-[22px] bg-superficie md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-texto/10 font-ui text-[12px] uppercase tracking-wide text-texto/50">
                  <th scope="col" className="px-5 py-3 font-medium">Member</th>
                  <th scope="col" className="px-4 py-3 font-medium">Organization</th>
                  <th scope="col" className="px-4 py-3 font-medium">Type</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Total donated</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((user) => (
                  <tr key={user.id} className="group relative border-b border-texto/5 last:border-0 hover:bg-texto/[0.04]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} image={user.image} />
                        <div className="min-w-0">
                          {/* El enlace cubre toda la fila. */}
                          <Link href={`/admin/users/${user.id}`} className="font-ui text-[14px] font-medium text-texto after:absolute after:inset-0 group-hover:underline">
                            {user.name}
                          </Link>
                          <p className="truncate font-ui text-[13px] text-texto/55">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-ui text-[13px] text-texto/75">{user.organization ?? "—"}</td>
                    <td className="px-4 py-3 font-ui text-[13px] text-texto">{user.membershipType?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-ui text-[14px] tabular-nums text-texto">{formatMoney(user.totalContributed)}</td>
                    <td className="px-4 py-3">
                      <UserBadges
                        isAdmin={user.isAdmin}
                        isBoardMember={user.isBoardMember}
                        isSuspended={user.isSuspended}
                        emailVerified={user.emailVerified}
                        hasProfile={user.profileId !== null}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-ui text-[13px] text-texto/60">{formatTimestamp(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Celular: tarjetas. */}
          <ul className="mt-6 space-y-3 md:hidden">
            {result.items.map((user) => (
              <li key={user.id}>
                <Link href={`/admin/users/${user.id}`} className="block rounded-[18px] bg-superficie p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} image={user.image} />
                    <div className="min-w-0 flex-1">
                      <p className="font-ui text-[15px] font-medium text-texto">{user.name}</p>
                      <p className="truncate font-ui text-[13px] text-texto/55">{user.email}</p>
                    </div>
                    <span className="font-ui text-[14px] tabular-nums text-texto">{formatMoney(user.totalContributed)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 font-ui text-[12px] text-texto/60">
                    <span>{user.membershipType?.name ?? "No type"}</span>
                    <UserBadges
                      isAdmin={user.isAdmin}
                      isBoardMember={user.isBoardMember}
                      isSuspended={user.isSuspended}
                      emailVerified={user.emailVerified}
                      hasProfile={user.profileId !== null}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Pages" className="mt-6 flex items-center justify-between font-ui text-[14px]">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="rounded-full border border-texto/30 px-4 py-1.5 text-texto hover:bg-texto/[0.06]">
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-texto/60">
                Page {page} of {pages}
              </span>
              {page < pages ? (
                <Link href={pageHref(page + 1)} className="rounded-full border border-texto/30 px-4 py-1.5 text-texto hover:bg-texto/[0.06]">
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </MemberShell>
  );
}
