"use client";

import { useEffect, useState } from "react";
import LottiePlayer from "./LottiePlayer";
import jeatdeam from "../lotties/jeatdeam_footer.json";
import pochita from "../lotties/pochita_pixel.json";

const TEXT = "Diseñado y desarrollado por:";
const TYPE_MS = 90; // por letra al escribir
const DELETE_MS = 45; // por letra al borrar
const HOLD_MS = 2200; // pausa con el texto completo
const EMPTY_MS = 600; // pausa con el texto vacío

// Escribe el texto letra por letra, espera y lo borra igual, como en un IDE
function useTypewriter(text: string) {
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let delay = deleting ? DELETE_MS : TYPE_MS;
    if (!deleting && count === text.length) delay = HOLD_MS;
    if (deleting && count === 0) delay = EMPTY_MS;

    const id = setTimeout(() => {
      if (!deleting && count === text.length) setDeleting(true);
      else if (deleting && count === 0) setDeleting(false);
      else setCount((c) => c + (deleting ? -1 : 1));
    }, delay);
    return () => clearTimeout(id);
  }, [count, deleting, text]);

  return text.slice(0, count);
}

export default function DevCredits() {
  const typed = useTypewriter(TEXT);

  return (
    <section
      aria-label={`${TEXT} jeatdeam`}
      className="flex flex-col items-center justify-center gap-3 bg-[#171717] px-4 py-6 text-white sm:flex-row sm:gap-6"
    >
      {/* El texto completo invisible reserva el ancho, así los Lotties no se mueven al tipear */}
      <p className="font-doto grid text-[14px] font-bold whitespace-pre" aria-hidden>
        <span className="invisible col-start-1 row-start-1">{TEXT}|</span>
        <span className="col-start-1 row-start-1">
          {typed}
          <span className="credits-caret">|</span>
        </span>
      </p>
      <div className="flex items-center justify-center gap-[20px]">
        <LottiePlayer animationData={jeatdeam} label="jeatdeam" style={{ width: 120, height: 50 }} />
        <LottiePlayer animationData={pochita} label="Pochita" style={{ width: 56, height: 50 }} />
      </div>
    </section>
  );
}
