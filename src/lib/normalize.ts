// Normalización de texto libre proveniente del portal de talento.

/** Quita espacios sobrantes y colapsa espacios internos. */
export function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

/** Clave para comparar valores sin importar mayúsculas ni acentos. */
export function matchKey(value: string): string {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Términos que contienen separadores y no deben partirse.
const PROTECTED_TERMS = ["CI/CD", "I/O", "TCP/IP", "UI/UX", "B2B/B2C"];

// Alias conocidos: clave normalizada -> nombre canónico.
const SKILL_ALIASES: Record<string, string> = {
  "react.js": "React",
  reactjs: "React",
  react: "React",
  "next.js": "Next.js",
  nextjs: "Next.js",
  "node.js": "Node.js",
  nodejs: "Node.js",
  node: "Node.js",
  "nest.js": "NestJS",
  nestjs: "NestJS",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  "vue.js": "Vue.js",
  vuejs: "Vue.js",
  "angular.js": "Angular",
  angularjs: "Angular",
  "aws": "AWS",
  "amazon web services": "AWS",
  "gcp": "Google Cloud",
  "google cloud platform": "Google Cloud",
  "k8s": "Kubernetes",
};

/**
 * Parte un campo de stack en skills individuales.
 * Acepta separadores: coma, barra, +, punto y coma, barra vertical.
 */
export function splitStack(raw: string | null | undefined): string[] {
  let text = cleanText(raw);
  if (!text) return [];

  // Protege términos con separadores internos antes de partir.
  const placeholders = new Map<string, string>();
  PROTECTED_TERMS.forEach((term, i) => {
    const token = `__PROTECTED_${i}__`;
    if (text.includes(term)) {
      placeholders.set(token, term);
      text = text.split(term).join(token);
    }
  });

  const parts = text
    .split(/[,/+;|]/)
    .map((p) => cleanText(p))
    .map((p) => {
      let restored = p;
      for (const [token, term] of placeholders) {
        restored = restored.split(token).join(term);
      }
      return restored;
    })
    .filter((p) => p.length > 0);

  // Quita duplicados conservando el orden.
  return [...new Set(parts)];
}

/** Devuelve el nombre canónico de una skill, usando alias si existen. */
export function canonicalSkill(raw: string): string {
  const cleaned = cleanText(raw);
  const alias = SKILL_ALIASES[matchKey(cleaned)];
  return alias ?? cleaned;
}
