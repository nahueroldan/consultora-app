// Crea issues en GitHub desde la app. Usa un token con permiso solo de issues en este repo.

export type IssueInput = {
  title: string;
  body: string;
  labels: string[];
};

/** Arma el cuerpo del issue con el contexto que la app conoce. */
export function buildIssueBody(input: {
  description: string;
  reporterEmail: string;
  role: string | null;
  page: string;
}): string {
  return [
    input.description.trim(),
    "",
    "---",
    `Reportado por: ${input.reporterEmail}`,
    `Rol: ${input.role ?? "sin rol"}`,
    `Página: ${input.page}`,
  ].join("\n");
}

export async function createIssue(input: IssueInput): Promise<{ number: number; url: string }> {
  const token = process.env.GITHUB_ISSUES_TOKEN;
  if (!token) throw new Error("Falta GITHUB_ISSUES_TOKEN en las variables de entorno.");
  const repo = process.env.GITHUB_REPO ?? "nahueroldan/consultora-app";

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`GitHub respondió ${res.status} al crear el issue.`);
  }
  const data = (await res.json()) as { number: number; html_url: string };
  return { number: data.number, url: data.html_url };
}
