/**
 * Tooltip propio para botones de ícono. Aparece al pasar el mouse o al enfocar con teclado.
 * Va dentro de un contenedor "group"; el texto también queda como nombre accesible del control.
 */
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-ink px-2.5 py-1 text-xs font-medium text-cream opacity-0 shadow-lg transition duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
