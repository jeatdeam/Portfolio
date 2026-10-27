"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import LottiePlayer from "./LottiePlayer";
import jeatdeam from "../lotties/firmaJeatdeam.json";

const TEXT = "Diseñado y desarrollado por:";
const SHORT_TEXT = "Desarrollado por:"; // celular y tablet
const DESKTOP_QUERY = "(min-width: 64rem)"; // el mismo corte que lg de Tailwind
const TYPE_MS = 90; // por letra al escribir
const DELETE_MS = 45; // por letra al borrar
const HOLD_MS = 2200; // pausa con el texto completo
const EMPTY_MS = 600; // pausa con el texto vacío
const SIGNATURE_SCALE = { desktop: 3.2, mobile: 2 }; // cuánto se agranda la firma de jeatdeam
// px que se sube la firma: el trazo queda dentro de la franja por abajo y sobresale por arriba
const SIGNATURE_LIFT = { desktop: -8, mobile: -6 };
const SIGNATURE_TILT = -7; // grados que se inclina hacia arriba, como una firma hecha a mano

// Escribe el texto letra por letra, espera y lo borra igual, como en un IDE
function useTypewriter(text: string) {
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let delay = deleting ? DELETE_MS : TYPE_MS;
    if (!deleting && count >= text.length) delay = HOLD_MS;
    if (deleting && count === 0) delay = EMPTY_MS;

    const id = setTimeout(() => {
      // >= por si el texto cambia a uno más corto a mitad de la animación
      if (!deleting && count >= text.length) setDeleting(true);
      else if (deleting && count === 0) setDeleting(false);
      else setCount((c) => c + (deleting ? -1 : 1));
    }, delay);
    return () => clearTimeout(id);
  }, [count, deleting, text]);

  return text.slice(0, count);
}

// En escritorio va el texto completo; en celular y tablet, el corto
function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

export default function DevCredits() {
  const isDesktop = useIsDesktop();
  const text = isDesktop ? TEXT : SHORT_TEXT;
  const scale = isDesktop ? SIGNATURE_SCALE.desktop : SIGNATURE_SCALE.mobile;
  const lift = isDesktop ? SIGNATURE_LIFT.desktop : SIGNATURE_LIFT.mobile;
  const typed = useTypewriter(text);

  return (
    <section
      aria-label={`${text} jeatdeam`}
      // Franja baja: la firma va en absolute y sobresale sobre el fondo oscuro de la página
      className="flex h-[73px] items-center justify-center gap-3 bg-[#171717] px-4 text-white lg:h-[80px] lg:gap-6"
    >
      {/* El texto completo invisible reserva el ancho, así la firma no se mueve al tipear */}
      <p className="font-doto grid text-[14px] font-bold whitespace-pre" aria-hidden>
        <span className="invisible col-start-1 row-start-1">{text}|</span>
        <span className="col-start-1 row-start-1">
          {typed}
          <span className="credits-caret">|</span>
        </span>
      </p>
      {/* La caja de 120×50 reserva el lugar; la firma, agrandada e inclinada, va encima en absolute y
          sobresale de la franja. El margen a los lados evita que tape el texto */}
      <div className="relative mx-6 h-[50px] w-[120px] shrink-0 lg:mx-12">
        <LottiePlayer
          animationData={jeatdeam}
          label="jeatdeam"
          className="absolute inset-0"
          style={{
            width: 120,
            height: 50,
            transform: `translateY(${lift}px) rotate(${SIGNATURE_TILT}deg) scale(${scale})`,
          }}
        />
      </div>
    </section>
  );
}
