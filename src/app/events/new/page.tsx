import type { Metadata } from "next";
import EventEditor from "@/components/events/EventEditor";
import MemberShell from "@/components/member/MemberShell";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "New event — GATT DC",
};

// Crear un evento. Solo admins; a los demas la pagina no existe.
export default async function NewEventPage() {
  const { name } = await requireAdmin("/events/new");
  return (
    <MemberShell name={name} current="/events" isAdmin>
      <h1 className="font-heading mb-6 text-[40px] font-normal leading-none text-texto lg:text-[48px]">
        <span className="font-script mr-4 text-[1.15em] text-morado">New</span>event
      </h1>
      <EventEditor />
    </MemberShell>
  );
}
