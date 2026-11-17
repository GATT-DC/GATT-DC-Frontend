"use client";

import { useRouter } from "next/navigation";
import ProfileForm from "@/components/auth/ProfileForm";
import { createProfile } from "@/lib/api";

// El nombre de la cuenta (por ejemplo, el de Google) se separa en nombre y
// apellido para no tener que escribirlo de nuevo. Se puede corregir.
function splitName(name: string) {
  const [firstName = "", ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

export default function CompleteProfileForm({ name }: { name: string }) {
  const router = useRouter();
  return (
    <ProfileForm
      initial={splitName(name)}
      submitLabel="Save profile"
      onSubmit={async (profile) => {
        await createProfile(profile);
        router.replace("/account");
        router.refresh();
      }}
    />
  );
}
