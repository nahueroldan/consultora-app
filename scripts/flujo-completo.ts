/**
 * Prueba del flujo completo contra una base de prueba (no producción).
 *
 * Uso: TEST_DATABASE_URL=postgres://... npm run test:flujo
 *
 * Recorre: crear idea -> votar -> comentar -> cambiar estado -> crear propuesta
 * desde la idea -> la idea queda convertida -> preferencias de widgets -> top de ideas.
 * Al final borra todo lo que creó.
 */
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { addComment, createIdea, getIdea, listTopIdeas, setIdeaStatus, toggleVote } from "@/lib/data/ideas";
import { createProposal, getProposal } from "@/lib/data/proposals";
import { createProject } from "@/lib/data/projects";
import { getUserWidgets, saveUserWidgets } from "@/lib/data/preferences";
import { DEFAULT_WIDGETS } from "@/lib/home/widgets";

const TAG = `TEST-${Date.now()}`;
const USER_A = `${TAG}-a@test.local`;
const USER_B = `${TAG}-b@test.local`;

let passed = 0;
function check(name: string, condition: boolean) {
  if (!condition) throw new Error(`Falló: ${name}`);
  passed++;
  console.log(`  ✓ ${name}`);
}

async function main() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    console.error("Falta TEST_DATABASE_URL. No se usa DATABASE_URL para evitar tocar producción.");
    process.exit(1);
  }
  process.env.DATABASE_URL = url;

  const projectId = await createProject({ name: `${TAG} proyecto`, client: null, description: null, status: "propuesta", createdByEmail: USER_A });
  const ideaId = await (async () => {
    await createIdea({ title: `${TAG} idea`, description: "Idea de prueba", createdByEmail: USER_A });
    const [row] = await db.select({ id: schema.ideas.id }).from(schema.ideas).where(eq(schema.ideas.title, `${TAG} idea`)).limit(1);
    return row.id;
  })();

  console.log("1. Crear idea");
  const created = await getIdea(ideaId, USER_A);
  check("la idea existe con estado abierta", created?.status === "abierta");

  console.log("2. Votar");
  check("el primer voto queda activo", (await toggleVote(ideaId, USER_A)) === true);
  check("otro usuario puede votar", (await toggleVote(ideaId, USER_B)) === true);
  check("el conteo de votos es 2", (await getIdea(ideaId, USER_A))?.votes === 2);
  check("quitar el voto lo baja a 1", (await toggleVote(ideaId, USER_B)) === false);

  console.log("3. Comentar");
  await addComment(ideaId, USER_B, "Me parece buena idea");
  check("el comentario aparece con su autor", (await getIdea(ideaId, USER_A))?.comments[0]?.authorEmail === USER_B);

  console.log("4. Cambiar estado");
  await setIdeaStatus(ideaId, "en_evaluacion");
  check("el estado cambia a en evaluación", (await getIdea(ideaId, USER_A))?.status === "en_evaluacion");

  console.log("5. Crear propuesta desde la idea");
  const proposalId = await createProposal({
    projectId,
    ideaId,
    title: `${TAG} propuesta`,
    discountPct: 0,
    notes: null,
    createdByEmail: USER_A,
    items: [{ role: "Dev", hours: 10, hourlyRate: 40 }],
  });
  const proposal = await getProposal(proposalId);
  check("la propuesta guarda la idea de origen", proposal !== null);
  check("la idea pasa a convertida", (await getIdea(ideaId, USER_A))?.status === "convertida");
  check("la idea muestra la propuesta vinculada", (await getIdea(ideaId, USER_A))?.linkedProposals.some((p) => p.id === proposalId) === true);

  console.log("6. Preferencias de widgets");
  const before = await getUserWidgets(USER_A);
  check("sin preferencias se usan los valores por defecto", before.length === DEFAULT_WIDGETS.length);
  await saveUserWidgets(USER_A, [{ id: "ideas-top", enabled: true, count: 7, source: "mias" }]);
  const after = await getUserWidgets(USER_A);
  check("la preferencia guardada se recupera", after.find((w) => w.id === "ideas-top")?.count === 7);
  check("los widgets faltantes se completan", after.length === DEFAULT_WIDGETS.length);

  console.log("7. Top de ideas");
  const top = await listTopIdeas({ userEmail: USER_A, source: "todas", limit: 5 });
  check("la idea aparece en el top de todas", top.some((i) => i.id === ideaId));
  const mine = await listTopIdeas({ userEmail: USER_B, source: "mias", limit: 5 });
  check("la fuente 'mías' no muestra ideas ajenas", !mine.some((i) => i.id === ideaId));

  console.log("Limpieza");
  await db.delete(schema.proposals).where(eq(schema.proposals.id, proposalId));
  await db.delete(schema.ideas).where(eq(schema.ideas.id, ideaId));
  await db.delete(schema.projects).where(eq(schema.projects.id, projectId));
  await db.delete(schema.userPreferences).where(eq(schema.userPreferences.userEmail, USER_A));
  console.log(`\nFlujo completo OK: ${passed} comprobaciones.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\n", err instanceof Error ? err.message : err);
  process.exit(1);
});
