"use client";

import { useEffect, useState } from "react";
import { RAIN_EVENT, RAIN_LEVELS, readRainLevel, setRainLevel } from "./rain-intensity";

type Props = {
  // "pill": botón del menú de arriba. "rail": botón de la barra lateral, que solo
  // muestra el nombre del nivel cuando la barra está expandida.
  variant?: "pill" | "rail";
  expanded?: boolean;
};

// Cada clic sube la lluvia un nivel y después de "Tormenta" vuelve al inicio
export default function RainControl({ variant = "pill", expanded = false }: Props) {
  const [level, setLevel] = useState(0);

  // El nivel guardado solo existe en el navegador, se lee después de montar.
  // También escucha a los otros botones (menú y barra lateral) para quedar en sintonía.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con localStorage
    setLevel(readRainLevel());
    const onChange = (e: Event) => setLevel((e as CustomEvent<number>).detail);
    window.addEventListener(RAIN_EVENT, onChange);
    return () => window.removeEventListener(RAIN_EVENT, onChange);
  }, []);

  const next = () => setRainLevel((level + 1) % RAIN_LEVELS.length);

  const current = RAIN_LEVELS[level];
  const upcoming = RAIN_LEVELS[(level + 1) % RAIN_LEVELS.length];
  const label = `Intensidad de la lluvia: ${current.label}. Cambiar a ${upcoming.label}`;

  const drop = (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden>
      <path d="M12 2.5c-.3 0-.6.2-.8.4C9.6 5 6 9.8 6 14a6 6 0 0 0 12 0c0-4.2-3.6-9-5.2-11.1-.2-.2-.5-.4-.8-.4Z" />
    </svg>
  );

  // Tres barras: cuántos niveles de lluvia hay activos
  const bars = (
    <span className="flex items-end gap-0.5" aria-hidden>
      {RAIN_LEVELS.map((_, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-colors ${i <= level ? "bg-accent" : "bg-accent/25"}`}
          style={{ height: 6 + i * 4 }}
        />
      ))}
    </span>
  );

  if (variant === "rail") {
    return (
      <button
        type="button"
        onClick={next}
        aria-label={label}
        title={expanded ? undefined : label}
        className={`flex h-11 w-full items-center rounded-xl text-accent transition-colors hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-accent ${
          expanded ? "gap-3 px-3" : "justify-center"
        }`}
      >
        {drop}
        <span className={`flex-1 text-left text-sm whitespace-nowrap ${expanded ? "" : "sr-only"}`}>
          {current.label}
        </span>
        {expanded && bars}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={next}
      aria-label={label}
      className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent transition-colors hover:border-accent hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {drop}
      {/* Ancho fijo (Doto es monoespaciada): el menú no salta al cambiar de etiqueta */}
      <span className="w-[8ch] text-left">{current.label}</span>
      {bars}
    </button>
  );
}
