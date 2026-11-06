// Cálculo de totales de una propuesta. Sin efectos: fácil de testear.

export type ProposalItem = {
  role: string;
  hours: number;
  hourlyRate: number; // en USD enteros
};

export type ProposalTotals = {
  subtotal: number;
  discount: number;
  total: number;
  totalHours: number;
};

/** Suma horas × tarifa y aplica un descuento porcentual (0 a 100). Redondea a centavos. */
export function computeProposalTotals(items: ProposalItem[], discountPct = 0): ProposalTotals {
  if (discountPct < 0 || discountPct > 100) {
    throw new RangeError("El descuento debe estar entre 0 y 100");
  }
  for (const item of items) {
    if (item.hours < 0 || item.hourlyRate < 0) {
      throw new RangeError("Horas y tarifas no pueden ser negativas");
    }
  }
  const subtotal = round2(items.reduce((acc, i) => acc + i.hours * i.hourlyRate, 0));
  const discount = round2((subtotal * discountPct) / 100);
  const totalHours = items.reduce((acc, i) => acc + i.hours, 0);
  return { subtotal, discount, total: round2(subtotal - discount), totalHours };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
