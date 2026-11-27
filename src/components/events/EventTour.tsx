"use client";

import GuidedTour, { type TourStep } from "@/components/editor/GuidedTour";

// Guia paso a paso del editor de eventos.
const STEPS: TourStep[] = [
  {
    target: "hero",
    title: "Title",
    body: (
      <>
        Click the title to edit it. Wrap a word in <strong>*asterisks*</strong> to show it in script on its own line:
        <span className="mt-2 block rounded-md bg-white/10 px-3 py-2 font-ui text-[13px]">
          Monthly Networking *mixer* → Monthly Networking <span className="font-script text-[1.3em]">mixer</span>
        </span>
      </>
    ),
  },
  {
    target: "photo",
    title: "Event photo",
    body: <>The path of the photo in storage (S3). It&apos;s used in the header, on the event cards and on the home page. Without one, a placeholder is shown.</>,
  },
  {
    target: "description",
    title: "Description",
    body: <>What the event is about. Leave a blank line between paragraphs.</>,
  },
  {
    target: "date",
    title: "Date and time",
    body: (
      <>
        Choose the day and the start time; the end time is optional. Times are always in <strong>Washington, D.C.</strong> time, and the
        countdown on the right counts down to the start.
      </>
    ),
  },
  {
    target: "location",
    title: "Location",
    body: (
      <>
        Write the venue name and the address: the map is built from the address. For an online event, leave both empty and check
        &ldquo;It&apos;s an online event&rdquo;.
      </>
    ),
  },
  {
    target: "online",
    title: "Online events",
    body: <>Paste the Zoom or Meet link here. Only members who registered (and admins) can see it.</>,
  },
  {
    target: "capacity",
    title: "Capacity",
    body: <>Optional. When the limit is reached, the event shows &ldquo;Event full&rdquo; and nobody else can register.</>,
  },
  {
    target: "actions",
    title: "Publish, draft or cancel",
    body: (
      <>
        <strong>Publish</strong> shows the event to everyone, also on the home page (the nearest event first). <strong>Save draft</strong>{" "}
        keeps it visible only to admins. <strong>Cancel event</strong> keeps it visible with a notice and closes registration.
      </>
    ),
  },
];

export default function EventTour() {
  return <GuidedTour steps={STEPS} storageKey="gatt-event-tour-seen" />;
}
