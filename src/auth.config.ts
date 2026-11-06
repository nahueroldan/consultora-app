// Configuración de Auth.js sin acceso a base de datos.
// La usa el proxy (que corre antes de cada request) y también auth.ts.
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [Google],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      const isPublic =
        request.nextUrl.pathname === "/login" || request.nextUrl.pathname.startsWith("/api/auth");
      if (isPublic) return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
