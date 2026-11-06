import { matchKey } from "@/lib/normalize";

// Agrupación amplia de áreas. Las áreas no listadas caen en "Otros".
// La clave se compara con matchKey: sin mayúsculas, acentos ni espacios extra.
const GROUPS: Record<string, string[]> = {
  "Diseño y UX": ["Diseño", "UX", "Diseño UX / UI", "Diseño UX/UI", "Service Design"],
  Desarrollo: [
    "Software Development",
    "Desarrollo",
    "Frontend (Web / Mobile)",
    "Mobile",
    "Mobile, Backend",
    "Desarrollo Oracle",
    "Salesforce",
  ],
  "Datos e IA": ["Data", "AI", "Analytics Engineering", "Data Platform", "Research"],
  "Infraestructura y operaciones": [
    "Plataforma",
    "Platform",
    "SRE",
    "SRE/NOC",
    "SRE - NOC",
    "SRE / NOC",
    "NOC / IT / Telco",
    "NOC - IT - Telco",
    "Endpoint",
    "Operaciones",
  ],
  "IT general": ["IT", "It"],
  Calidad: ["QA Engineer", "QA SR", "Calidad"],
  Producto: [
    "Producto",
    "Producto / Operaciones",
    "Producto fraude - riesgo de crédito",
    "Producto fraude / riesgo de crédito",
    "Transformación",
  ],
  Personas: ["People", "HR, Recursos Humanos"],
  "Comercial y marketing": ["Comercial", "Comercial Viviendas", "Marketing/Growth", "Marketing / Growth"],
  Finanzas: ["Accounting / Finance", "Accounting/Finance"],
};

const INDEX = new Map<string, string>();
for (const [group, names] of Object.entries(GROUPS)) {
  for (const name of names) INDEX.set(matchKey(name), group);
}

export const OTHER_GROUP = "Otros";

/** Devuelve el grupo de un área cruda del portal. */
export function groupOfArea(rawArea: string): string {
  return INDEX.get(matchKey(rawArea)) ?? OTHER_GROUP;
}
