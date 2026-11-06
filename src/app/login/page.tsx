import { signIn } from "@/auth";
import { SubmitButton } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-accent">Consultora</h1>
          <p className="text-sm text-muted">
            Ingresá con tu cuenta de Google. Si todavía no tenés acceso, pedíselo a un administrador.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <SubmitButton pendingLabel="Redirigiendo…" className="w-full">
            Ingresar con Google
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
