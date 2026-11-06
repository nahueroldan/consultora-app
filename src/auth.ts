// Login con Google. Solo entran emails registrados en la tabla users.
// El rol se guarda en el token JWT al iniciar sesión.
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { db, schema } from "@/db";
import { normalizeEmail } from "@/lib/auth/email";
import { ROLES, type Role } from "@/lib/auth/roles";

async function findUserByEmail(email: string) {
  const [row] = await db
    .select({ role: schema.users.role, personId: schema.users.personId })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return row ?? null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user }) {
      const email = normalizeEmail(user.email);
      if (!email) return false;

      if (await findUserByEmail(email)) return true;

      // Alta inicial: el email de ADMIN_EMAIL entra como admin la primera vez.
      if (email === normalizeEmail(process.env.ADMIN_EMAIL)) {
        await db.insert(schema.users).values({
          email,
          name: user.name ?? null,
          role: "admin",
        });
        return true;
      }

      return false;
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
