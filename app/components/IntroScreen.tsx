"use client";

import { useEffect, useState } from "react";
import LottiePlayer from "./LottiePlayer";
import pochitaDurmiendo from "../lotties/pochita_durmiendo.json";
import { INTRO_FADE_MS as FADE_MS, INTRO_SHOW_MS as SHOW_MS } from "./intro-timing";

const DOT_MS = SHOW_MS / 3; // ".", luego "..", luego "..." justo antes de entrar

// Pantalla de bienvenida: Pochita duerme un momento y luego se entra solo al portfolio
export default function IntroScreen() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [dots, setDots] = useState(1);

  // Agrega un punto cada DOT_MS y se queda en "..." hasta entrar
  useEffect(() => {
    const id = setInterval(() => setDots((d) => Math.min(d + 1, 3)), DOT_MS);
    return () => clearInterval(id);
  }, []);

  // Sin scroll mientras la pantalla de inicio está visible
  useEffect(() => {
    if (gone) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [gone]);

  useEffect(() => {
    const leave = setTimeout(() => setLeaving(true), SHOW_MS);
    const remove = setTimeout(() => setGone(true), SHOW_MS + FADE_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      role="status"
      aria-label="Cargando el portfolio"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background px-6 text-center transition-[opacity,transform,filter] ease-out"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? "scale(1.04)" : "scale(1)",
        filter: leaving ? "blur(6px)" : "none",
        transitionDuration: `${FADE_MS}ms`,
      }}
    >
      <LottiePlayer
        animationData={pochitaDurmiendo}
        label="Pochita durmiendo"
        // Alto explícito con la proporción del Lottie (460×470); lottie-react ignora aspect-ratio
        style={{ width: "min(70vw, 300px)", height: "calc(min(70vw, 300px) * 470 / 460)" }}
      />
      {/* Los puntos ocultos siguen ocupando su lugar, así nada se mueve al aparecer */}
      <div className="flex gap-2" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className="size-2.5 rounded-full bg-white transition-[opacity,transform] duration-200 ease-out"
            style={{ opacity: n <= dots ? 1 : 0, transform: n <= dots ? "scale(1)" : "scale(0.4)" }}
          />
        ))}
      </div>
    </div>
  );
}
