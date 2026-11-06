import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos. Usado por los componentes de motion-primitives. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
