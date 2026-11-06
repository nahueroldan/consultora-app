import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// Sin DATABASE_URL no se lanza error al importar: el build (CI y Vercel) no necesita la base.
// Las consultas fallan en ejecución, y el aviso queda en el log del servidor.
const url = process.env.DATABASE_URL;
if (!url) {
  console.warn("DATABASE_URL no está definida: las consultas a la base van a fallar.");
}

// Un solo pool por proceso. En serverless conviene usar el pooler de Neon (URL con -pooler).
const client = postgres(url ?? "", { max: 10 });

export const db = drizzle(client, { schema });
export { schema };
