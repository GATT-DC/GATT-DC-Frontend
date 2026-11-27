import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventEditor from "@/components/events/EventEditor";
import MemberShell from "@/components/member/MemberShell";
import { requireAdmin } from "@/lib/admin";
import { getEvent } from "@/lib/session";

export const metadata: Metadata = {
  title: "Edit event — GATT DC",
};

// Editar un evento. Solo admins; a los demas la pagina no existe.
export default async function EditEventPage({ params }: PageProps<"/events/[slug]/edit">) {
  const { slug } = await params;
  const { name } = await requireAdmin(`/events/${slug}/edit`);
  const event = await getEvent(slug);
  if (!event) notFound();
  return (
    <MemberShell name={name} current="/events" isAdmin>
      <h1 className="font-heading mb-6 text-[40px] font-normal leading-none text-texto lg:text-[48px]">
        <span className="font-script mr-4 text-[1.15em] text-morado">Edit</span>event
      </h1>
      <EventEditor event={event} />
    </MemberShell>
  );
}
