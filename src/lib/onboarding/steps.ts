// Pasos del recorrido de primer ingreso. Datos puros: el icono se resuelve en el cliente.
import type { Role } from "@/lib/auth/roles";

export type TourIcon = "home" | "widgets" | "users" | "lightbulb" | "file" | "folder" | "settings" | "shield";

export type TourStep = {
  id: string;
  title: string;
  body: string;
  icon: TourIcon;
  /** Roles que ven este paso. Si no se indica, lo ven todos. */
  roles?: Role[];
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "inicio",
    title: "Tu inicio",
    body: "Acá ves tu resumen. Cada widget muestra algo para mirar o algo para hacer, como votar una idea.",
    icon: "home",
  },
  {
    id: "personalizar",
    title: "Personalizá tu inicio",
    body: "Tocá Personalizar inicio para elegir qué widgets ver, cuántos elementos y de qué fuente son las ideas.",
    icon: "widgets",
  },
  {
    id: "directorio",
    title: "Directorio",
    body: "Elegí un área para ver a sus integrantes. Confirmá tu propio perfil para aparecer en squads y propuestas.",
    icon: "users",
  },
  {
    id: "ideas",
    title: "Ideas",
    body: "Una idea es algo que todavía no tiene cliente ni precio. Votala, comentala y, si madura, convertila en propuesta.",
    icon: "lightbulb",
  },
  {
    id: "propuestas",
    title: "Propuestas",
    body: "Armá el equipo por roles, con horas y tarifas, y descargá el PDF para el cliente.",
    icon: "file",
  },
  {
    id: "proyectos",
    title: "Proyectos y squads",
    body: "Cada proyecto tiene sus squads. Desde acá sumás integrantes confirmados y cambiás el estado del proyecto.",
    icon: "folder",
    roles: ["lider", "admin"],
  },
  {
    id: "estado-ideas",
    title: "Estado de las ideas",
    body: "Podés cambiar el estado de una idea: abierta, en evaluación o cerrada.",
    icon: "shield",
    roles: ["lider", "admin"],
  },
  {
    id: "usuarios",
    title: "Usuarios",
    body: "Desde el menú de configuración das de alta cuentas, cambiás roles y vinculás cada cuenta con su persona.",
    icon: "settings",
    roles: ["admin"],
  },
  {
    id: "configuracion",
    title: "Configuración",
    body: "En el avatar de arriba a la derecha está el tema claro u oscuro, y cerrar sesión. Podés volver a ver este recorrido desde ahí.",
    icon: "settings",
  },
];

/** Pasos que corresponden a un rol. Sin rol, solo los generales. */
export function tourStepsFor(role: Role | null): TourStep[] {
  return TOUR_STEPS.filter((s) => !s.roles || (role !== null && s.roles.includes(role)));
}
