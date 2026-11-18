import type { Metadata } from "next";
import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy — GATT DC",
  description: "How GATT DC collects, uses and protects your personal data.",
};

type Section = { title: string; body: ReactNode[]; subsections?: Section[] };

const LINK = "text-primario underline underline-offset-2 hover:text-primario-hover";

const SECTIONS: Section[] = [
  {
    title: "Who we are",
    body: [
      <>
        Our website address is:{" "}
        <a href="https://gattdc.com/" className={LINK}>
          https://gattdc.com/
        </a>
        .
      </>,
    ],
  },
  {
    title: "What personal data we collect and why we collect it",
    body: [],
    subsections: [
      {
        title: "Comments",
        body: [
          "When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor’s IP address and browser user agent string to help spam detection.",
          <>
            An anonymized string created from your email address (also called a hash) may be
            provided to the Gravatar service to see if you are using it. The Gravatar service
            privacy policy is available here:{" "}
            <a href="https://automattic.com/privacy/" target="_blank" rel="noopener noreferrer" className={LINK}>
              https://automattic.com/privacy/
            </a>
            . After approval of your comment, your profile picture is visible to the public in the
            context of your comment.
          </>,
        ],
      },
      {
        title: "Media",
        body: [
          "If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.",
        ],
      },
      {
        title: "Contact forms",
        body: [
          "Any information you submit to us via our contact forms will be stored in our organization’s email account, using the same standard of safety measures our Board members deem appropriate for their own accounts.",
        ],
      },
      {
        title: "Cookies",
        body: [
          "If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.",
          "If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.",
          "When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select “Remember Me”, your login will persist for two weeks. If you log out of your account, the login cookies will be removed.",
          "If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.",
        ],
      },
      {
        title: "Embedded content from other websites",
        body: [
          "Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.",
          "These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.",
        ],
      },
      {
        title: "Analytics",
        body: [
          "Non-sensitive user data may be tracked via Google Analytics, to help us optimize your experience on our website.",
        ],
      },
    ],
  },
  {
    title: "Who we share your data with",
    body: ["If you request a password reset, your IP address will be included in the reset email."],
  },
  {
    title: "How long we retain your data",
    body: [
      "If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.",
      "For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.",
    ],
  },
  {
    title: "What rights you have over your data",
    body: [
      "If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.",
    ],
  },
  {
    title: "Where we send your data",
    body: ["Visitor comments may be checked through an automated spam detection service."],
  },
];

function Paragraphs({ body }: { body: ReactNode[] }) {
  return (
    <>
      {body.map((paragraph, i) => (
        <p key={i} className="font-serif text-[16px] font-light leading-[1.6] text-texto/90 lg:text-[17px]">
          {paragraph}
        </p>
      ))}
    </>
  );
}

// Politica de privacidad de GATT DC: una pagina de lectura con el estilo de
// la landing.
export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar onMedia={false} />
      <main className="bg-fondo px-6 pb-24 pt-32 sm:px-10 lg:pt-40">
        <article className="mx-auto max-w-[720px]">
          <h1 className="font-heading text-[44px] font-normal leading-none text-texto lg:text-[64px]">
            Privacy{" "}
            <span className="font-script inline-block px-1 text-[1.3em] leading-normal">
              Policy
            </span>
          </h1>

          <div className="mt-10 space-y-12">
            {SECTIONS.map((section) => (
              <section key={section.title} className="space-y-4">
                <h2 className="font-heading border-b border-texto/15 pb-3 text-[24px] font-normal text-texto lg:text-[28px]">
                  {section.title}
                </h2>
                <Paragraphs body={section.body} />
                {section.subsections?.map((sub) => (
                  <div key={sub.title} className="space-y-3 pt-2">
                    <h3 className="font-heading text-[18px] font-normal text-texto lg:text-[20px]">{sub.title}</h3>
                    <Paragraphs body={sub.body} />
                  </div>
                ))}
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
