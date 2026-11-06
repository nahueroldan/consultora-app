"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/ui/button";
import { ServerForm } from "@/components/ui/server-form";
import { VISIBLE_FIELDS, normalizeVisibility, type VisibleField } from "@/lib/profile/visibility";
import type { ActionResult } from "@/lib/form-result";

type OwnProfile = {
  position: string | null;
  city: string | null;
  country: string | null;
  linkedin: string | null;
  visibility: unknown;
};

const LABELS: Record<VisibleField, string> = {
  country: "País",
  city: "Ciudad",
  position: "Puesto",
  linkedin: "LinkedIn",
  skills: "Skills",
};

const input = "w-full rounded-2xl border border-line bg-cream px-4 py-2.5 text-sm font-normal focus-visible:outline-2 focus-visible:outline-accent";

/** Editor del propio perfil. Elegís qué ve el resto del directorio, campo por campo. */
export function MyProfileModal({
  profile,
  action,
  trigger,
}: {
  profile: OwnProfile;
  action: (fd: FormData) => Promise<ActionResult>;
  trigger: (open: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const vis = normalizeVisibility(profile.visibility);
  return (
    <>
      {trigger(() => setOpen(true))}
      <Modal open={open} onClose={() => setOpen(false)} title="Mi perfil" description="Editá tus datos. Elegí qué ve el resto de la consultora." size="lg">
        <div className="h-full overflow-y-auto">
          <ServerForm action={action} onSuccess={() => setOpen(false)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm font-medium">
                Puesto
                <input name="position" defaultValue={profile.position ?? ""} className={input} />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Ciudad
                <input name="city" defaultValue={profile.city ?? ""} className={input} />
              </label>
              <label className="space-y-1 text-sm font-medium">
                País
                <input name="country" defaultValue={profile.country ?? ""} className={input} />
              </label>
              <label className="space-y-1 text-sm font-medium">
                LinkedIn (https://…)
                <input name="linkedin" type="url" defaultValue={profile.linkedin ?? ""} className={input} />
              </label>
            </div>

            <fieldset className="space-y-2 rounded-3xl border border-line bg-surface p-4">
              <legend className="px-1 text-sm font-semibold">Visible para el resto</legend>
              <p className="text-xs text-muted">Lo que apagues lo ve solo vos y los admin.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {VISIBLE_FIELDS.map((f) => (
                  <label key={f} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-sm">
                    {LABELS[f]}
                    <input type="checkbox" name={`v_${f}`} defaultChecked={vis[f]} className="size-4 accent-accent" />
                  </label>
                ))}
              </div>
            </fieldset>

            <SubmitButton pendingLabel="Guardando…" className="w-full">Guardar perfil</SubmitButton>
          </ServerForm>
        </div>
      </Modal>
    </>
  );
}
