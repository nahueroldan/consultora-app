import { Suspense } from "react";
import { connection } from "next/server";
import { can, ROLES } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/users";
import { addUserAction, updateUserAction } from "@/app/(app)/usuarios/actions";

async function Content() {
  await connection();
  const user = await requireUser();
  if (!can(user.role, "usuario:gestionar")) {
    return <p className="text-zinc-600">No tenés permiso para ver esta página.</p>;
  }
  const users = await listUsers();

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">Usuarios</h1>

      <form action={addUserAction} className="grid gap-3 md:grid-cols-4">
        <input name="email" type="email" required placeholder="email@ejemplo.com" className="rounded-md border px-3 py-2 md:col-span-2" />
        <select name="role" defaultValue="colaborador" className="rounded-md border px-3 py-2">
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-white">Dar de alta</button>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="border-b text-zinc-500">
          <tr>
            <th className="py-2">Email</th>
            <th>Rol</th>
            <th>Persona vinculada (ID)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.email}</td>
              <td colSpan={3}>
                <form action={updateUserAction} className="flex items-center gap-2 py-1">
                  <input type="hidden" name="id" value={u.id} />
                  <select name="role" defaultValue={u.role} className="rounded-md border px-2 py-1">
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input
                    name="personId"
                    type="number"
                    defaultValue={u.personId ?? ""}
                    placeholder="ID de persona"
                    className="w-40 rounded-md border px-2 py-1"
                  />
                  <span className="text-xs text-zinc-500">
                    {u.personName ? `${u.personName} ${u.personLast}` : "sin vincular"}
                  </span>
                  <button type="submit" className="ml-auto rounded-md border px-2 py-1">Guardar</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function UsuariosPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-400">Cargando…</p>}>
      <Content  />
    </Suspense>
  );
}
