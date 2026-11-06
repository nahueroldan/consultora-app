// Roles y permisos de la aplicación.
//
// admin:        gestiona usuarios y roles, y todo lo que hace un líder.
// lider:        crea y edita squads, proyectos e ideas.
// colaborador:  solo consulta (directorio, squads, propuestas).

export const ROLES = ["admin", "lider", "colaborador"] as const;
export type Role = (typeof ROLES)[number];

export const ACTIONS = [
  "directorio:ver",
  "squad:editar",
  "proyecto:editar",
  "idea:editar",
  "propuesta:crear",
  "usuario:gestionar",
] as const;
export type Action = (typeof ACTIONS)[number];

const PERMISSIONS: Record<Role, readonly Action[]> = {
  colaborador: ["directorio:ver"],
  lider: [
    "directorio:ver",
    "squad:editar",
    "proyecto:editar",
    "idea:editar",
    "propuesta:crear",
  ],
  admin: [...ACTIONS],
};

/** Devuelve true si el rol puede ejecutar la acción. Rol desconocido: sin permisos. */
export function can(role: string | null | undefined, action: Action): boolean {
  if (!role || !(ROLES as readonly string[]).includes(role)) return false;
  return PERMISSIONS[role as Role].includes(action);
}

/** Lanza error si el rol no tiene permiso. Pensado para usar en server actions. */
export function assertCan(role: string | null | undefined, action: Action): void {
  if (!can(role, action)) {
    throw new ForbiddenError(action);
  }
}

export class ForbiddenError extends Error {
  constructor(public readonly action: Action) {
    super(`Sin permiso para: ${action}`);
    this.name = "ForbiddenError";
  }
}
