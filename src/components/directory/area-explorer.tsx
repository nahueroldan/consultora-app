"use client";

import { useState } from "react";
import { Building2, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cardSurface } from "@/components/ui/card";
import { AreaPeople } from "@/components/directory/area-people";

export function AreaExplorer({ areas }: { areas: { area: string; count: number }[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map(({ area, count }) => (
          <li key={area}>
            <button
              type="button"
              onClick={() => setSelected(area)}
              className={`group flex h-full w-full items-center gap-4 p-5 text-left ${cardSurface} transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-accent`}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Building2 size={22} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{area}</span>
                <span className="font-mono text-xs text-muted">{count} personas</span>
              </span>
              <ChevronRight size={18} aria-hidden className="text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ?? ""}
        description="Buscá dentro del área. La lista carga de a poco al desplazarte."
        size="lg"
      >
        {selected && <AreaPeople area={selected} />}
      </Modal>
    </>
  );
}
