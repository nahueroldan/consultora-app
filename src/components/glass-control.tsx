"use client";

import { useEffect, useRef } from "react";

const KEY = "glass-level";

/** Aplica el nivel de cristal (0 = sólido, 100 = máximo) a las superficies translúcidas. */
function apply(level: number) {
  const root = document.documentElement.style;
  root.setProperty("--glass-alpha", String(1 - (0.5 * level) / 100));
  root.setProperty("--glass-blur", `${Math.round(4 + (20 * level) / 100)}px`);
}

/** Deslizador de cristal. Se guarda en este navegador. */
export function GlassControl() {
  const ref = useRef<HTMLInputElement>(null);

  // Lee lo guardado después del render (el servidor no conoce el navegador).
  useEffect(() => {
    const level = Number(localStorage.getItem(KEY) ?? 35);
    if (ref.current) ref.current.value = String(level);
    apply(level);
  }, []);

  return (
    <label className="flex flex-col gap-2 rounded-2xl bg-cream px-4 py-3 text-sm">
      <span className="flex items-center justify-between">
        Cristal
        <span className="font-mono text-xs text-muted">transparencia y desenfoque</span>
      </span>
      <input
        ref={ref}
        type="range"
        min={0}
        max={100}
        defaultValue={35}
        aria-label="Intensidad del cristal"
        className="w-full accent-accent"
        onChange={(e) => {
          const level = Number(e.target.value);
          localStorage.setItem(KEY, String(level));
          apply(level);
        }}
      />
    </label>
  );
}
