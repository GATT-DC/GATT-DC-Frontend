"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { MembershipType } from "@/lib/api";

export type UserFilterValues = {
  search: string;
  membershipTypeId: string;
  role: string;
  status: string;
  sort: string;
};

const SELECT =
  "h-10 rounded-full border border-texto/20 bg-superficie px-4 pr-9 font-ui text-[13px] text-texto outline-none transition-colors focus:border-amarillo";

// Filtros del listado de usuarios. Viven en la URL (se pueden compartir o
// recargar); al cambiar uno se vuelve a la primera pagina.
export default function UserFilters({ values, types }: { values: UserFilterValues; types: MembershipType[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(values.search);

  const apply = useCallback(
    (changes: Partial<UserFilterValues>) => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries({ ...values, ...changes })) if (value) params.set(key, value);
      const query = params.toString();
      startTransition(() => router.replace(`/admin/users${query ? `?${query}` : ""}`, { scroll: false }));
    },
    [values, router],
  );

  // La busqueda espera a que se deje de escribir.
  useEffect(() => {
    if (search.trim() === values.search) return;
    const timer = setTimeout(() => apply({ search: search.trim() }), 350);
    return () => clearTimeout(timer);
  }, [search, values.search, apply]);

  const active = values.search || values.membershipTypeId || values.role || values.status;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center" aria-busy={pending}>
      <label className="relative min-w-0 flex-1 lg:max-w-sm">
        <span className="sr-only">Search members</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-texto/45" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or organization"
          className="h-10 w-full rounded-full border border-texto/20 bg-superficie pl-10 pr-4 font-ui text-[14px] text-texto outline-none transition-colors placeholder:text-texto/40 focus:border-amarillo"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <select aria-label="Membership type" value={values.membershipTypeId} onChange={(e) => apply({ membershipTypeId: e.target.value })} className={SELECT}>
          <option value="">All types</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        <select aria-label="Role" value={values.role} onChange={(e) => apply({ role: e.target.value })} className={SELECT}>
          <option value="">All roles</option>
          <option value="admin">Admins</option>
          <option value="board">Board members</option>
        </select>
        <select aria-label="Status" value={values.status} onChange={(e) => apply({ status: e.target.value })} className={SELECT}>
          <option value="">Any status</option>
          <option value="incomplete">Profile incomplete</option>
          <option value="unverified">Email not verified</option>
          <option value="suspended">Suspended</option>
        </select>
        <select aria-label="Sort by" value={values.sort} onChange={(e) => apply({ sort: e.target.value })} className={SELECT}>
          <option value="">Sort: name</option>
          <option value="total">Sort: total donated</option>
          <option value="recent">Sort: newest</option>
        </select>
        {active && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              apply({ search: "", membershipTypeId: "", role: "", status: "" });
            }}
            className="h-10 rounded-full px-4 font-ui text-[13px] text-texto/70 underline-offset-2 hover:text-texto hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
