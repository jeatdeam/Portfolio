"use client";

import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import LottiePlayer from "./LottiePlayer";

type LottieData = { w?: number; h?: number };

type Props = {
  animationData: LottieData;
  children?: ReactNode;
  as?: ElementType; // etiqueta del contenedor: 'div', 'header', 'nav'...
  fullLap?: boolean; // true → da la vuelta completa al contenedor sin esconderse
  start?: number; // dónde aparece arriba (fracción del ancho), solo sin fullLap
  hide?: number; // % del recorrido en que empieza a esconderse, solo sin fullLap
  fade?: number; // % que dura el desvanecido, solo sin fullLap
  repeat?: boolean; // false → camina una vez y queda escondido, solo sin fullLap
  duration?: number; // segundos por vuelta
  pace?: number; // px por segundo; si se pasa, reemplaza a duration
  speed?: number; // velocidad del Lottie (patas)
  size?: number; // px de ancho del Lottie
  sink?: number; // px que los pies se hunden en el borde
  flip?: boolean; // voltear horizontalmente
  inside?: boolean; // camina por dentro del borde
  showGuide?: boolean; // muestra el recorrido punteado
  className?: string;
  style?: CSSProperties;
};

/**
 * Envuelve cualquier elemento (una píldora, un header, una tarjeta...) y hace
 * que un Lottie camine por su borde. Lee el border-radius real del elemento y
 * recalcula el recorrido cuando cambia de tamaño, así que es responsive.
 */
export default function PillWalker({
  animationData,
  children,
  as: Tag = "div",
  fullLap = false,
  start = 0.55,
  hide = 80,
  fade = 10,
  repeat = true,
  duration = 6,
  pace,
  speed = 1,
  size = 48,
  sink = 2,
  flip = false,
  inside = false,
  showGuide = false,
  className = "",
  style,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [route, setRoute] = useState({ path: "", length: 0 });
  // Nombre de keyframes único por instancia (useId trae caracteres no válidos en CSS)
  const kfName = "recorrer-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // Recalcula el recorrido cuando cambia el tamaño del contenedor
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const r = Math.min(readRadius(el, w, h), w / 2, h / 2); // radio de las esquinas

      if (fullLap) {
        // Rectángulo redondeado cerrado: arriba → derecha → abajo → izquierda
        setRoute({
          path:
            `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h - r} ` +
            `A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 0 ${h - r} ` +
            `L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`,
          length: 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r,
        });
        return;
      }
      // Media vuelta: arriba → lado derecho → abajo
      const startX = Math.min(w * start, w - r);
      setRoute({
        path:
          `M ${startX} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h - r} ` +
          `A ${r} ${r} 0 0 1 ${w - r} ${h} L ${startX} ${h}`,
        length: 2 * (w - r - startX) + (h - 2 * r) + Math.PI * r,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [start, fullLap]);

  const { path, length } = route;
  const lap = pace ? length / pace : duration;

  // Caja con la misma proporción que el Lottie, para que no quede espacio vacío bajo las patas
  const height = animationData.w && animationData.h ? (size * animationData.h) / animationData.w : size;

  const end = Math.min(hide + fade, 99);
  const keyframes = fullLap
    ? `
@keyframes ${kfName} {
  0%   { offset-distance: 0%; opacity: 1; }
  100% { offset-distance: 100%; opacity: 1; }
}`
    : `
@keyframes ${kfName} {
  0%   { offset-distance: 0%; opacity: 0; transform: scale(0.4); }
  8%   { opacity: 1; transform: scale(1); }
  ${hide}% { offset-distance: ${hide}%; opacity: 1; transform: scale(1); }
  ${end}% { offset-distance: ${end}%; opacity: 0; transform: scale(0.4); }
  100% { offset-distance: 100%; opacity: 0; }
}`;

  // Por dentro se gira 180°, lo que también invierte hacia dónde mira
  const mirrored = flip !== inside;

  return (
    <Tag ref={ref} className={`pw-root ${className}`} style={style}>
      <style>{keyframes}</style>
      {children}

      {showGuide && (
        <svg className="pw-guide" aria-hidden>
          <path d={path} />
        </svg>
      )}

      {path && (
        <div
          // key fuerza a reiniciar la animación cuando cambian los ajustes
          key={`${hide}|${fade}|${repeat}|${sink}|${fullLap}|${inside}`}
          className={`pw-walker ${mirrored ? "flip" : ""}`}
          aria-hidden
          data-rain-hit="box" // la lluvia salpica al caerle encima
          style={{
            width: size,
            height,
            offsetPath: `path("${path}")`,
            offsetAnchor: `50% calc(100% - ${sink}px)`, // sus "pies" van pegados al borde
            offsetRotate: inside ? "auto 180deg" : "auto", // gira siguiendo la curva
            animation: `${kfName} ${lap}s linear ${repeat || fullLap ? "infinite" : "1 forwards"}`,
          }}
        >
          <div className="pw-lottie">
            <LottiePlayer animationData={animationData} speed={speed} style={{ width: size, height }} />
          </div>
        </div>
      )}
    </Tag>
  );
}

// Radio de la esquina superior derecha en px (admite px y %)
function readRadius(el: HTMLElement, w: number, h: number) {
  const value = getComputedStyle(el).borderTopRightRadius.split(" ")[0];
  const n = parseFloat(value) || 0;
  return value.endsWith("%") ? (n / 100) * Math.min(w, h) : n;
}
