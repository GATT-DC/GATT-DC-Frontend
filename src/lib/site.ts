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
