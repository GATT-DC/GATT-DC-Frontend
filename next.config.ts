import type { NextConfig } from "next";
import { BACKEND_URL } from "./src/lib/backend";

const nextConfig: NextConfig = {
  // El backend de Nest se sirve bajo /api de este mismo sitio. Asi la cookie
  // de sesion queda en el dominio del front y no hace falta CORS.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
