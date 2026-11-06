// Login con Google. Solo entran emails registrados en la tabla users.
// El rol se guarda en el token JWT al iniciar sesión.
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { db, schema } from "@/db";
import { normalizeEmail } from "@/lib/auth/email";
import { ROLES, type Role } from "@/lib/auth/roles";
import { testLoginEnabled } from "@/lib/auth/test-login";

async function findUserByEmail(email: string) {
  const [row] = await db
    .select({ role: schema.users.role, personId: schema.users.personId })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return row ?? null;
}

/**
 * Login de prueba (solo desarrollo, ver test-login.ts). Crea o actualiza el usuario
 * con el rol pedido, para que las pruebas automáticas tengan la cuenta que necesitan.
 */
const testProvider = Credentials({
  id: "test",
  name: "Prueba",
  credentials: { email: {}, role: {} },
  async authorize(credentials) {
    if (!testLoginEnabled()) return null;
    const email = normalizeEmail(String(credentials?.email ?? ""));
    const role = String(credentials?.role ?? "colaborador");
    if (!email || !(ROLES as readonly string[]).includes(role)) return null;
    // Las cuentas de prueba no ven el recorrido: ya lo "cerraron" al crearse.
    await db
      .insert(schema.users)
      .values({ email, role: role as Role, tourClosedAt: new Date() })
      .onConflictDoUpdate({ target: schema.users.email, set: { role: role as Role } });
    return { id: email, email, name: email };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: testLoginEnabled() ? [...authConfig.providers, testProvider] : authConfig.providers,
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user }) {
      const email = normalizeEmail(user.email);
      if (!email) return false;

      if (await findUserByEmail(email)) return true;

      // Cualquier cuenta de Google puede entrar. Si no existe, se crea como colaborador;
      // ADMIN_EMAIL entra como admin. El perfil del directorio se vincula después.
      const isAdminEmail = email === normalizeEmail(process.env.ADMIN_EMAIL);
      await db.insert(schema.users).values({
        email,
        name: user.name ?? null,
        role: isAdminEmail ? "admin" : "colaborador",
      }).onConflictDoNothing();
      return true;
    },

    async jwt({ token }) {
      const email = normalizeEmail(token.email);
      if (email) {
        const row = await findUserByEmail(email);
        const role = row?.role;
        token.role = role && (ROLES as readonly string[]).includes(role) ? role : null;
        token.personId = row?.personId ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = (token.role as Role | null) ?? null;
      session.user.personId = (token.personId as number | null) ?? null;
      return session;
    },
  },
});
