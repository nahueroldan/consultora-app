"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CircleHelp, LogOut, Settings, UserRound, Users } from "lucide-react";
import { useTour } from "@/components/onboarding/tour";
import { MyProfileModal } from "@/components/profile/my-profile";
import type { ActionResult } from "@/lib/form-result";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Menú de configuración del usuario. Reemplaza el botón "Salir".
 * Incluye tema, gestión de usuarios (solo admin) y cierre de sesión.
 */
export function UserMenu({
  email,
  role,
  isAdmin,
  signOutAction,
  ownProfile,
  updateProfileAction,
}: {
  email: string;
  role: string | null;
  isAdmin: boolean;
  signOutAction: () => Promise<void>;
  /** Perfil vinculado a la cuenta; null si todavía no eligió uno. */
  ownProfile: { position: string | null; city: string | null; country: string | null; linkedin: string | null; visibility: unknown } | null;
  updateProfileAction: (fd: FormData) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { openTour } = useTour();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Cierra con Escape o clic afuera.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const initial = email.charAt(0).toUpperCase();

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        data-tour="configuracion"
        aria-label="Configuración"
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 items-center justify-center rounded-2xl border border-line bg-surface font-display text-accent transition hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        {initial || <Settings size={18} aria-hidden />}
      </button>

      {ownProfile && (
        <MyProfileModal
          profile={ownProfile}
          action={updateProfileAction}
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      )}

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-72 space-y-3 rounded-3xl border border-line bg-surface p-3 shadow-xl"
        >
          <div className="px-2 py-1">
            <p className="truncate text-sm font-semibold">{email}</p>
            <p className="font-mono text-xs text-muted">{role ?? "sin rol"}</p>
          </div>

          <ThemeToggle />

          <div className="space-y-1">
            {ownProfile && (
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  setProfileOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm hover:bg-cream"
              >
                <UserRound size={16} aria-hidden /> Mi perfil
              </button>
            )}
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                openTour();
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm hover:bg-cream"
            >
              <CircleHelp size={16} aria-hidden /> Ver recorrido de nuevo
            </button>
            {isAdmin && (
              <Link
                role="menuitem"
                href="/usuarios"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm hover:bg-cream"
              >
                <Users size={16} aria-hidden /> Gestión de usuarios
              </Link>
            )}
            <form action={signOutAction}>
              <button
                role="menuitem"
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
              >
                <LogOut size={16} aria-hidden /> Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
