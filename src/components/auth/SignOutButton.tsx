"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="w-full rounded-full bg-texto/[0.06] py-2 font-ui text-[15px] text-texto transition-colors hover:bg-texto/10 disabled:opacity-50"
    >
      {pending ? "Signing out…" : "Sign Out"}
    </button>
  );
}
