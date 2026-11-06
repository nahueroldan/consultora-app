import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Consultora</h1>
        <p className="text-sm text-zinc-500">
          Ingresá con tu cuenta de Google. Si todavía no tenés acceso, pedíselo a un administrador.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
          >
            Ingresar con Google
          </button>
        </form>
      </div>
    </main>
  );
}
