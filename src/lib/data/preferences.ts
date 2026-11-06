import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { DEFAULT_WIDGETS, normalizeWidgets, type WidgetConfig } from "@/lib/home/widgets";

/** Configuración de widgets del usuario, normalizada (siempre válida). */
export async function getUserWidgets(userEmail: string): Promise<WidgetConfig[]> {
  const [row] = await db
    .select({ widgets: schema.userPreferences.widgets })
    .from(schema.userPreferences)
    .where(eq(schema.userPreferences.userEmail, userEmail))
    .limit(1);
  return row ? normalizeWidgets(row.widgets) : DEFAULT_WIDGETS.map((w) => ({ ...w }));
}

export async function saveUserWidgets(userEmail: string, widgets: WidgetConfig[]) {
  await db
    .insert(schema.userPreferences)
    .values({ userEmail, widgets, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.userPreferences.userEmail,
      set: { widgets, updatedAt: new Date() },
    });
}
