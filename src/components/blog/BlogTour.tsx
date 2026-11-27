"use client";

import GuidedTour, { type TourStep } from "@/components/editor/GuidedTour";

// Recorrido guiado del editor de blogs: resalta cada parte (marcada con
// data-tour="...") y explica que es, con flechas para avanzar y X para salir.


const SCRIPT_EXAMPLE = (
  <span className="mt-2 block rounded-md bg-white/10 px-3 py-2 font-ui text-[13px]">
    The Future of *Tax* Policy → The Future of <span className="font-script text-[1.3em]">Tax</span> Policy
  </span>
);

const STEPS: TourStep[] = [
  {
    target: "card",
    title: "The card in the blog list",
    body: (
      <>
        This is how the post appears in <em>Our blogs</em>. Set the cover image with the image button. The title and subtitle come from
        the post itself.
      </>
    ),
  },
  {
    target: "header",
    title: "Title and subtitle",
    body: (
      <>
        Click any text to edit it. Wrap a word in <strong>*asterisks*</strong> to show it in script:
        {SCRIPT_EXAMPLE}
        <span className="mt-2 block">The small label above the title (e.g. Latest Event Highlights) is optional.</span>
      </>
    ),
  },
  {
    target: "hero",
    title: "Header photos",
    body: (
      <>
        Add up to 5 photos. The layout adjusts to how many there are. Use the image button to set each photo&apos;s path in storage
        (e.g. <code>blogs/tax-policy/photo-1.jpg</code>), ← → to change the order and ✕ to remove one. Missing images show a gray
        placeholder.
      </>
    ),
  },
  {
    target: "meta",
    title: "Extra label and author",
    body: <>A short line such as “GATT DC | Event Recap | Washington, D.C.” and the author, shown as “by: …”. Both are optional.</>,
  },
  {
    target: "summary",
    title: "Summary",
    body: <>A short introduction that appears below the header.</>,
  },
  {
    target: "blocks",
    title: "Sections and their order",
    body: (
      <>
        Each section has a title and text. Leave a <strong>blank line</strong> between paragraphs. Use <strong>↑ ↓</strong> to change the
        order and ✕ to remove a section. <em>Our Panelists</em> moves the same way, so you can put sections before or after it.
      </>
    ),
  },
  {
    target: "panelists",
    title: "Our Panelists",
    body: (
      <>
        Add a card per panelist: photo (image button), name (click it) and LinkedIn (the “in” button). ← → reorder the cards. If there are
        no panelists, the section is hidden.
      </>
    ),
  },
  {
    target: "actions",
    title: "Publish or save as draft",
    body: (
      <>
        <strong>Publish</strong> makes the post visible to all members. <strong>Save draft</strong> keeps it private: only admins can see
        drafts. If something is missing, a message here tells you what.
      </>
    ),
  },
];

export default function BlogTour() {
  return <GuidedTour steps={STEPS} storageKey="gatt-blog-tour-seen" />;
}
