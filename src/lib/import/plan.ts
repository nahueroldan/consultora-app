import { z } from "zod";
import { canonicalSkill, cleanText, matchKey, splitStack } from "@/lib/normalize";

// Forma del archivo exportado desde el portal de talento.
const rawPersonSchema = z.object({
  pais: z.string().nullish(),
  nombre: z.string(),
  apellido: z.string(),
  area: z.string().nullish(),
  puesto: z.string().nullish(),
  rol: z.string().nullish(),
  ubicacion: z.string().nullish(),
  stack: z.string().nullish(),
  linkedin: z.string().nullish(),
  links: z.array(z.unknown()).nullish(),
});

export const importFileSchema = z.object({
  updatedAt: z.string().optional(),
  paises: z.array(z.string()).optional(),
  roles: z
    .array(z.object({ familia: z.string(), rol: z.string() }))
    .optional(),
  people: z.array(rawPersonSchema),
});

export type ImportFile = z.infer<typeof importFileSchema>;

export type PersonRow = {
  /** Clave para detectar la misma persona al reimportar. */
  externalKey: string;
  firstName: string;
  lastName: string;
  country: string | null;
  area: string | null;
  position: string | null;
  role: string | null;
  city: string | null;
  linkedin: string | null;
  skills: string[];
};

export type ImportPlan = {
  people: PersonRow[];
  /** Claves de personas con mismo nombre y apellido, para revisión manual. */
  possibleDuplicates: string[];
  skillNames: string[];
};

/** Clave base por persona: nombre + apellido normalizados. */
export function personKey(firstName: string, lastName: string): string {
  return `${matchKey(firstName)}|${matchKey(lastName)}`;
}

function nullIfEmpty(value: string | null | undefined): string | null {
  const v = cleanText(value);
  return v.length > 0 ? v : null;
}

/**
 * Convierte el JSON validado en filas listas para insertar. No escribe nada.
 * Si dos personas comparten nombre y apellido, la clave lleva su número de
 * aparición (#1, #2...) para que no se pisen, y se marcan como posible duplicado.
 */
export function buildImportPlan(file: ImportFile): ImportPlan {
  const seen = new Map<string, number>();

  const people: PersonRow[] = file.people.map((p) => {
    const firstName = cleanText(p.nombre);
    const lastName = cleanText(p.apellido);
    const base = personKey(firstName, lastName);
    const occurrence = (seen.get(base) ?? 0) + 1;
    seen.set(base, occurrence);

    const skills = splitStack(p.stack).map(canonicalSkill);
    return {
      externalKey: `${base}#${occurrence}`,
      firstName,
      lastName,
      country: nullIfEmpty(p.pais),
      area: nullIfEmpty(p.area),
      position: nullIfEmpty(p.puesto),
      role: nullIfEmpty(p.rol),
      city: nullIfEmpty(p.ubicacion),
      linkedin: nullIfEmpty(p.linkedin),
      skills: [...new Set(skills)],
    };
  });

  const possibleDuplicates = [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([key]) => key);

  const skillNames = [...new Set(people.flatMap((p) => p.skills))].sort();

  return { people, possibleDuplicates, skillNames };
}
