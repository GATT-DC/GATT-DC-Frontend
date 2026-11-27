import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import MemberHeader from "@/components/member/MemberHeader";
import { formatMoney } from "@/lib/format";
import { getMyProfile, getSessionUser } from "@/lib/session";
import { CONTACT_EMAIL, GOFUNDME_URL, SPONSOR_TIERS, STRIPE_DONATION_URL, paypalDonateUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Donate — GATT DC",
  description: "Support GATT DC's educational, networking and career programs for LGBTQ+ and allied professionals in international trade.",
};

const CARD = "rounded-[22px] bg-superficie p-6 sm:p-8";

function Soon() {
  return (
    <span className="inline-flex cursor-default items-center rounded-full border border-texto/25 px-5 py-2 font-ui text-[14px] text-texto/55" title="The link will be added soon">
      Link coming soon
    </span>
  );
}

// Pagina de donaciones (publica). GoFundMe es la principal; PayPal y Stripe
// son alternativas. Por ahora las donaciones no se registran solas: el
// equipo las agrega al perfil del miembro.
export default async function DonatePage() {
  const user = await getSessionUser();
  const profile = user ? await getMyProfile().catch(() => null) : null;
  const name = user ? (profile ? `${profile.firstName} ${profile.lastName}` : user.name) : null;
  const paypal = paypalDonateUrl();

  return (
    <div className="min-h-svh bg-fondo">
      <MemberHeader name={name} signInNext="/donate">
        <div className="px-4 pb-12 pt-10 text-center sm:pb-16 lg:pt-16">
          <p className="font-serif text-[15px] font-light text-white/85 sm:text-[17px]">GATT DC Member Fundraiser</p>
          <h1 className="font-heading mt-2 text-[44px] leading-none text-white sm:text-[64px]">
            Support <span className="font-script text-[1.2em]">our community</span>
          </h1>
        </div>
      </MemberHeader>

      <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <p className="mx-auto max-w-3xl text-center font-serif text-[17px] font-light leading-[1.4] text-texto lg:text-[19px]">
          Donations to GATT DC go toward supporting our mission of providing educational, networking, and career advancement opportunities
          to LGBTQ+ and allied professionals in international trade and development.
        </p>

        {/* Principal: GoFundMe. */}
        <section aria-labelledby="gofundme-title" className={`${CARD} mt-12 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between`}>
          <div className="max-w-xl">
            <p className="font-ui text-[12px] uppercase tracking-[0.14em] text-verde">Recommended</p>
            <h2 id="gofundme-title" className="font-heading mt-1 text-[30px] leading-tight text-texto">
              Donate on <span className="font-script text-[1.2em]">GoFundMe</span>
            </h2>
            <p className="mt-2 font-serif text-[16px] leading-relaxed text-texto/80">
              Our main fundraiser. Every contribution helps us reach our next funding milestone.
            </p>
          </div>
          {GOFUNDME_URL ? (
            <a
              href={GOFUNDME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-gradient-to-b from-[#bbff00] to-[#4fd400] px-7 py-3 font-ui text-[16px] font-medium text-[#102000] transition-[filter] hover:brightness-110"
            >
              Donate Now
            </a>
          ) : (
            <Soon />
          )}
        </section>

        {/* Alternativas. */}
        <h2 className="font-heading mt-14 text-[22px] text-texto">Other ways to give</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <section aria-labelledby="paypal-title" className={CARD}>
            <h3 id="paypal-title" className="font-heading text-[22px] text-texto">
              PayPal
            </h3>
            <p className="mb-5 mt-1 font-serif text-[15px] text-texto/75">Choose the amount on PayPal. It opens in a new tab.</p>
            {paypal ? (
              <a
                href={paypal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-[#ffc439] px-5 py-2 font-ui text-[14px] font-semibold text-[#003087] transition-[filter] hover:brightness-95"
              >
                Donate with PayPal
              </a>
            ) : (
              <Soon />
            )}
          </section>
          <section aria-labelledby="card-title" className={CARD}>
            <h3 id="card-title" className="font-heading text-[22px] text-texto">
              Credit or debit card
            </h3>
            <p className="mb-5 mt-1 font-serif text-[15px] text-texto/75">Secure payment with Stripe. You can also use Apple Pay or Google Pay.</p>
            {STRIPE_DONATION_URL ? (
              <a
                href={STRIPE_DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-[#635bff] px-5 py-2 font-ui text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Donate by card
              </a>
            ) : (
              <Soon />
            )}
          </section>
        </div>

        {/* Niveles de patrocinio. */}
        <section aria-labelledby="tiers-title" className="mt-14">
          <h2 id="tiers-title" className="font-heading text-[22px] text-texto">
            Sponsorship levels
          </h2>
          <p className="mt-1 font-serif text-[15px] text-texto/70">Your total annual contribution sets your membership level.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SPONSOR_TIERS.map((tier) => (
              <li key={tier.name} className="flex items-center gap-4 rounded-md bg-superficie-2 px-5 py-4">
                <span className="font-heading min-w-[5.5rem] shrink-0 text-[20px]" style={{ color: tier.color }}>
                  {tier.name}
                </span>
                <span className="leading-tight">
                  <span className="font-heading block text-[17px] text-texto">{formatMoney(tier.amount).replace(".00", "")}</span>
                  <span className="block whitespace-nowrap font-serif text-[14px] font-light text-texto">Annual Contribution</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 space-y-3 border-t border-texto/15 pt-8 font-serif text-[15px] leading-relaxed text-texto/75">
          <p>All donations to GATT DC are tax deductible.</p>
          <p>
            {user
              ? "Use the same email as your GATT DC account when you donate, so we can add the donation to your member profile."
              : "If you're a member, use the same email as your GATT DC account when you donate, so we can add the donation to your profile."}{" "}
            Donations are recorded by our team, so they may take a few days to show up.
          </p>
          <p>
            Questions about donations or sponsorship? Write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-texto">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
