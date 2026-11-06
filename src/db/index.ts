import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("Falta DATABASE_URL. Copiá .env.example a .env.local y completala.");
}

// Un solo pool por proceso. En serverless conviene usar un pooler de la base.
const client = postgres(url, { max: 10 });

export const db = drizzle(client, { schema });
export { schema };
