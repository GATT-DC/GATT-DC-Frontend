// Datos de contacto y redes de GATT DC, compartidos por el menu lateral y el
// footer.
export const CONTACT_EMAIL = "gattdc@gmail.com";

// Perfiles de GATT en redes. Sin `href` todavia: se muestran como texto,
// sin enlace, hasta tener las direcciones.
export const SOCIAL_LINKS: { name: "Instagram" | "Facebook" | "LinkedIn"; href: string | null }[] = [
  { name: "Instagram", href: null },
  { name: "Facebook", href: null },
  { name: "LinkedIn", href: null },
];

// ---- Donaciones ----
// Por ahora las donaciones no se sincronizan solas: el equipo las registra
// en "Manage members". Los enlaces son publicos (no son claves).

// Campaña principal de GoFundMe. Falta la URL: mientras sea null el boton
// se muestra como "proximamente".
export const GOFUNDME_URL: string | null = null;

// Boton de donacion de PayPal (hosted_button_id). Lo crea el dueño de la
// cuenta (treasurer@gattdc.org) en PayPal: Pay & Get Paid > Donate button.
// No es secreto. Con solo el Merchant ID (E9ZAZ5UUTQJQJ) PayPal rechaza la
// donacion si la cuenta no esta habilitada, por eso se usa el boton. Mientras
// sea null el boton se muestra como "proximamente".
export const PAYPAL_DONATE_BUTTON_ID: string | null = null;

export function paypalDonateUrl(): string | null {
  return PAYPAL_DONATE_BUTTON_ID
    ? `https://www.paypal.com/donate/?hosted_button_id=${encodeURIComponent(PAYPAL_DONATE_BUTTON_ID)}`
    : null;
}

// Payment Link de Stripe (se crea en el panel de Stripe: Payment Links).
// Mientras sea null el boton se muestra como "proximamente".
export const STRIPE_DONATION_URL: string | null = null;

// Niveles de patrocinio segun el aporte anual (los mismos tipos de miembro
// del backend).
export const SPONSOR_TIERS = [
  { name: "Bronze", amount: 1500, color: "#d9925f" },
  { name: "Silver", amount: 3000, color: "#8c8c8c" },
  { name: "Gold", amount: 5000, color: "var(--color-amarillo)" },
  { name: "Platinum", amount: 10000, color: "var(--color-texto)" },
] as const;
