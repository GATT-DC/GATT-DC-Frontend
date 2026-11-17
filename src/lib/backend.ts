// Direccion del backend de Nest. El navegador nunca la usa directo: entra por
// /api/* de este mismo sitio y next.config.ts lo reenvia aqui.
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";
