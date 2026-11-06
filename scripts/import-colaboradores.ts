/**
 * Importa colaboradores desde el JSON exportado del portal de talento.
 *
 * Uso: npm run import:colaboradores -- /ruta/al/colaboradores.json
 *
 * Todas las personas entran con status "pending". Solo cuando confirman su
 * perfil pasan a "confirmed" y pueden aparecer en squads y propuestas.
 * El script solo imprime conteos: no muestra datos personales.
 */
import { readFileSync } from "node:fs";
import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { buildImportPlan, importFileSchema } from "@/lib/import/plan";

loadEnvConfig(process.cwd());

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("Uso: npm run import:colaboradores -- /ruta/colaboradores.json");
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(path, "utf-8"));
  const parsed = importFileSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("El archivo no tiene la estructura esperada:");
    for (const issue of parsed.error.issues.slice(0, 10)) {
      console.error(`- ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  const plan = buildImportPlan(parsed.data);
  const duplicateBases = new Set(plan.possibleDuplicates);

  // Import dinámico: el cliente de base se crea solo cuando hace falta.
  const { db, schema } = await import("@/db");
  const { people, skills, personSkills } = schema;

  let inserted = 0;
  let skipped = 0;

  await db.transaction(async (tx) => {
    // 1) Skills: insertar las que falten y leer sus ids.
    for (const name of plan.skillNames) {
      await tx.insert(skills).values({ name }).onConflictDoNothing();
    }
    const skillRows = await tx
      .select({ id: skills.id, name: skills.name })
      .from(skills)
      .where(inArray(skills.name, plan.skillNames));
    const skillId = new Map(skillRows.map((s) => [s.name, s.id]));

    // 2) Personas: no sobrescribir si ya existen (reimportación segura).
    for (const row of plan.people) {
      const existing = await tx
        .select({ id: people.id })
        .from(people)
        .where(eq(people.externalKey, row.externalKey))
        .limit(1);
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      const baseKey = row.externalKey.replace(/#\d+$/, "");
      const [created] = await tx
        .insert(people)
        .values({
          externalKey: row.externalKey,
          firstName: row.firstName,
          lastName: row.lastName,
          country: row.country,
          area: row.area,
          position: row.position,
          role: row.role,
          city: row.city,
          linkedin: row.linkedin,
          status: "pending",
          needsReview: duplicateBases.has(baseKey),
        })
        .returning({ id: people.id });

      // 3) Relación persona-skill, sin nivel declarado todavía.
      const links = row.skills
        .map((name) => skillId.get(name))
        .filter((id): id is number => id !== undefined)
        .map((skillIdValue) => ({
          personId: created.id,
          skillId: skillIdValue,
          level: null,
        }));
      if (links.length > 0) {
        await tx.insert(personSkills).values(links);
      }
      inserted++;
    }
  });

  console.log("Importación terminada.");
  console.log(`- Personas en el archivo: ${plan.people.length}`);
  console.log(`- Nuevas (pendientes de confirmación): ${inserted}`);
  console.log(`- Ya existentes (omitidas): ${skipped}`);
  console.log(`- Skills distintas detectadas: ${plan.skillNames.length}`);
  console.log(`- Posibles duplicados para revisar: ${plan.possibleDuplicates.length}`);
  process.exit(0);
}

main().catch((err) => {
  // Mensaje sin datos personales: solo el error técnico.
  console.error("Error durante la importación:", err instanceof Error ? err.message : err);
  process.exit(1);
});
