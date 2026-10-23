"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";

// lottie-web toca `document` al cargarse, así que el reproductor solo se carga en el cliente
const Lottie = dynamic(() => import("lottie-react").then((m) => m.Lottie), { ssr: false });

type Props = {
  animationData: object;
  speed?: number; // velocidad de la animación (1 = normal)
  className?: string;
  style?: CSSProperties;
  label?: string;
};

export default function LottiePlayer({ animationData, speed = 1, className, style, label }: Props) {
  return (
    <Lottie
      src={animationData}
      speed={speed}
      loop
      autoplay
      className={className}
      style={style}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
    />
  );
}
