"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search } from "lucide-react";
import { loadAreaPageAction } from "@/app/(app)/directorio/actions";
import { Badge } from "@/components/ui/card";

type Person = { id: number; firstName: string; lastName: string; position: string | null; status: string };

const ROW_HEIGHT = 72;

/**
 * Lista virtualizada de personas de un área. Pide páginas de 40 al acercarse
 * al final, y descarta respuestas viejas si el usuario cambia la búsqueda.
 */
export function AreaPeople({ area }: { area: string }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Person[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [pending, startTransition] = useTransition();
  const requestId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchPage = (offset: number, query: string, reset: boolean) => {
    const id = ++requestId.current;
    startTransition(async () => {
      const page = await loadAreaPageAction({ area, q: query, offset });
      if (id !== requestId.current) return; // respuesta vieja: se descarta
      setItems((prev) => (reset ? page.items : [...prev, ...page.items]));
      setHasMore(page.hasMore);
    });
  };

  // Primera página al abrir.
  useEffect(() => {
    fetchPage(0, "", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area]);

  // Búsqueda con debounce: reinicia la lista.
  useEffect(() => {
    const t = setTimeout(() => fetchPage(0, q, true), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const virtualizer = useVirtualizer({
    count: items.length + (hasMore ? 1 : 0),
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastIndex = virtualItems.at(-1)?.index ?? -1;

  // Carga la siguiente página cuando el usuario se acerca al final.
  useEffect(() => {
    if (hasMore && !pending && lastIndex >= items.length - 8) {
      fetchPage(items.length, q, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastIndex, items.length, hasMore, pending]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <label className="relative block">
        <span className="sr-only">Buscar en {area}</span>
        <Search size={16} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre o puesto"
          className="w-full rounded-2xl border border-line bg-cream py-2.5 pl-10 pr-4 text-sm focus-visible:outline-2 focus-visible:outline-accent"
        />
      </label>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1" aria-busy={pending}>
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualItems.map((vi) => {
            const person = items[vi.index];
            return (
              <div
                key={vi.key}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${vi.start}px)`, height: ROW_HEIGHT }}
              >
                {person ? (
                  <Link
                    href={`/directorio/${person.id}`}
                    className="flex h-[64px] items-center justify-between gap-3 rounded-2xl border border-transparent px-3 transition hover:border-line hover:bg-cream focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{person.firstName} {person.lastName}</span>
                      <span className="block truncate text-xs text-muted">{person.position ?? "Sin puesto"}</span>
                    </span>
                    {person.status === "pending" && (
                      <span className="shrink-0"><Badge tone="warning">Pendiente</Badge></span>
                    )}
                  </Link>
                ) : (
                  <div className="flex h-[64px] items-center px-3">
                    <span className="h-3 w-1/2 animate-pulse rounded-full bg-line" aria-label="Cargando más" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!pending && items.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">No hay personas con esa búsqueda.</p>
        )}
      </div>
    </div>
  );
}
