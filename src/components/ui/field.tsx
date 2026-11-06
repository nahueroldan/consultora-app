/** Clase común de campos de texto, select y textarea. Una sola fuente de verdad para el estilo. */
export const fieldClass =
  "w-full rounded-2xl border border-line bg-cream px-4 py-2.5 text-sm font-normal placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent";

/** Etiqueta de un campo: el texto va arriba y el control debajo. */
export function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}
