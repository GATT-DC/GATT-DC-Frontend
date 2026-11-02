"use client";

import { useRouter } from "next/navigation";
import ProfileForm from "@/components/auth/ProfileForm";
import { createProfile } from "@/lib/api";

export default function CompleteProfileForm() {
  const router = useRouter();
  return (
    <ProfileForm
      submitLabel="Save profile"
      onSubmit={async (profile) => {
        await createProfile(profile);
        router.replace("/account");
        router.refresh();
      }}
    />
  );
}
