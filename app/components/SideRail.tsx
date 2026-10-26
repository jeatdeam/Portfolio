"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import RainControl from "./RainControl";
import { NAV_LINKS } from "./nav-links";
import { INTRO_SHOW_MS } from "./intro-timing";

// Íconos de cada sección, en trazo para que combinen con los bocetos de los proyectos
const ICONS: Record<string, ReactNode> = {
  "#inicio": <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />,
  "#sobre-mi": (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  "#proyectos": (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  "#habilidades": <path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4M13.5 5.5l-3 13" />,
  "#contacto": (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/**
 * Menú de celular y tablet: un solo botón flotante arriba a la izquierda. Al tocarlo se estira
 * hacia abajo en una barra angosta con solo los íconos de cada sección y el de la lluvia.
 * Se cierra con la X, tocando fuera, eligiendo una sección o con Escape. En escritorio no se muestra.
 */
export default function SideRail() {
  const [open, setOpen] = useState(false);
  const railRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Abierta: Escape o un toque fuera de la barra la cierran
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!railRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <aside
      ref={railRef}
      aria-label="Menú"
      // Entra junto con el resto del portfolio, cuando termina la pantalla de inicio.
      // Va sobre las salpicaduras (z-40) y bajo la pantalla de inicio (z-50).
      style={{ animationDelay: `${INTRO_SHOW_MS}ms` }}
      className={`page-enter glass fixed top-4 left-4 z-[45] flex w-12 flex-col items-center rounded-2xl p-0.5 lg:hidden ${
        open ? "rail-open" : ""
      }`}
    >
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="side-rail-icons"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex size-11 items-center justify-center rounded-xl text-white transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Icon>{open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</Icon>
      </button>

      {/* Los íconos se despliegan hacia abajo; cerrada la barra quedan fuera del orden de tabulación */}
      <div
        id="side-rail-icons"
        inert={!open}
        className={`grid w-full transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <nav aria-label="Secciones" className="mt-1 border-t border-white/10 pt-1">
            <ul className="flex flex-col items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-label={link.label}
                    title={link.label}
                    className="flex size-11 items-center justify-center rounded-xl text-zinc-50 transition-colors hover:bg-white/10 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <Icon>{ICONS[link.href]}</Icon>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-1 border-t border-white/10 pt-1">
            <RainControl variant="rail" />
          </div>
        </div>
      </div>
    </aside>
  );
}
