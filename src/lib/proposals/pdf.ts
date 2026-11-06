// Genera el PDF de una propuesta. Sin acceso a base de datos: recibe los datos ya armados.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ProposalItem, ProposalTotals } from "@/lib/proposals/total";

export type ProposalPdfData = {
  title: string;
  projectName: string;
  client: string | null;
  createdAt: Date;
  items: ProposalItem[];
  totals: ProposalTotals;
  discountPct: number;
  notes: string | null;
};

const money = (n: number) =>
  `USD ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Texto seguro para la fuente estándar (WinAnsi): reemplaza caracteres fuera de Latin-1. */
function safe(text: string): string {
  return text.replace(/[^\x20-\x7E -ÿ]/g, "?");
}

export async function buildProposalPdf(data: ProposalPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.1, 0.1, 0.1);
  const muted = rgb(0.45, 0.45, 0.45);
  const margin = 50;
  let y = 792;

  const line = (text: string, opts: { size?: number; f?: typeof font; color?: ReturnType<typeof rgb>; x?: number } = {}) => {
    page.drawText(safe(text), {
      x: opts.x ?? margin,
      y,
      size: opts.size ?? 11,
      font: opts.f ?? font,
      color: opts.color ?? ink,
    });
    y -= (opts.size ?? 11) + 6;
  };

  line("Propuesta comercial", { size: 10, color: muted });
  line(data.title, { size: 20, f: bold });
  y -= 6;
  line(`Proyecto: ${data.projectName}`);
  line(`Cliente: ${data.client ?? "—"}`);
  line(`Fecha: ${data.createdAt.toLocaleDateString("es-AR")}`);
  y -= 14;

  // Encabezado de tabla
  page.drawRectangle({ x: margin, y: y - 4, width: 495, height: 20, color: rgb(0.93, 0.93, 0.93) });
  page.drawText("Rol", { x: margin + 6, y: y + 2, size: 10, font: bold, color: ink });
  page.drawText("Horas", { x: 340, y: y + 2, size: 10, font: bold, color: ink });
  page.drawText("Tarifa/h", { x: 410, y: y + 2, size: 10, font: bold, color: ink });
  page.drawText("Subtotal", { x: 487, y: y + 2, size: 10, font: bold, color: ink });
  y -= 24;

  for (const item of data.items) {
    const subtotal = item.hours * item.hourlyRate;
    page.drawText(safe(item.role).slice(0, 48), { x: margin + 6, y, size: 10, font: font, color: ink });
    page.drawText(String(item.hours), { x: 340, y, size: 10, font, color: ink });
    page.drawText(money(item.hourlyRate), { x: 410, y, size: 10, font, color: ink });
    page.drawText(money(subtotal), { x: 487, y, size: 10, font, color: ink });
    y -= 18;
  }

  y -= 10;
  const totalsRow = (label: string, value: string, f = font) => {
    page.drawText(label, { x: 340, y, size: 11, font: f, color: ink });
    page.drawText(value, { x: 470, y, size: 11, font: f, color: ink });
    y -= 18;
  };
  totalsRow("Horas totales", String(data.totals.totalHours));
  totalsRow("Subtotal", money(data.totals.subtotal));
  if (data.discountPct > 0) {
    totalsRow(`Descuento (${data.discountPct}%)`, `- ${money(data.totals.discount)}`);
  }
  totalsRow("Total", money(data.totals.total), bold);

  if (data.notes) {
    y -= 20;
    line("Notas", { f: bold });
    for (const chunk of wrap(safe(data.notes), 95)) {
      line(chunk, { size: 10 });
    }
  }

  return doc.save();
}

/** Corta texto en líneas de hasta `max` caracteres, respetando saltos de línea. */
export function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      if ((current + " " + word).trim().length > max) {
        if (current) out.push(current);
        current = word;
      } else {
        current = (current + " " + word).trim();
      }
    }
    out.push(current);
  }
  return out;
}
