import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";

// Cliente de Better Auth para el navegador. Habla con /api/auth/* en este
// mismo dominio; next.config.ts lo pasa al backend de Nest.
export const authClient = createAuthClient({
  plugins: [phoneNumberClient()],
});
