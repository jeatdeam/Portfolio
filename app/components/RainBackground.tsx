"use client";

import { useEffect, useRef } from "react";
import { INTRO_FADE_MS, INTRO_SHOW_MS } from "./intro-timing";
import { RAIN_EVENT, RAIN_LEVELS, readRainLevel } from "./rain-intensity";

// Lluvia de fondo en canvas 2D: las gotas caen, revientan al tocar su "suelo"
// y dejan una onda y unas gotitas que salpican hacia arriba.
// Los elementos con data-rain-hit ("box", "circle", "pill" o "text") también reciben gotas:
// esas salpicaduras se dibujan en un segundo canvas por delante del contenido.

const DROPS_PER_1000PX = 90; // densidad según el ancho de la pantalla (nivel "Lluvia")
const GRAVITY = 1800; // px/s² para las gotitas de la salpicadura
const WIND = -60; // px/s, una leve inclinación hacia la izquierda
const HIT_AFTER_MS = INTRO_SHOW_MS + INTRO_FADE_MS; // no choca con nada mientras está la intro

type Drop = { x: number; y: number; z: number; speed: number; len: number; floor: number };
type Splash = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number };
type Ripple = { x: number; y: number; r: number; max: number; life: number; z: number };
type Obstacle = { el: Element; shape: string };

export default function RainBackground() {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const back = backRef.current;
    const front = frontRef.current;
    const ctx = back?.getContext("2d");
    const fctx = front?.getContext("2d");
    if (!back || !front || !ctx || !fctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mountedAt = performance.now();

    let width = 0;
    let height = 0;
    let drops: Drop[] = [];
    let density: number = RAIN_LEVELS[readRainLevel()].density;
    const splashes: Splash[] = [];
    const hitSplashes: Splash[] = [];
    const ripples: Ripple[] = [];

    // Los obstáculos se vuelven a buscar cada tanto (el walker se re-monta al cambiar de tamaño)
    let obstacles: Obstacle[] = [];
    const findObstacles = () => {
      obstacles = Array.from(document.querySelectorAll("[data-rain-hit]"), (el) => ({
        el,
        shape: el.getAttribute("data-rain-hit") || "box",
      }));
    };

    // z va de 0 (lejos) a 1 (cerca): las cercanas son más largas, rápidas y revientan más abajo
    const spawnDrop = (d: Partial<Drop> = {}, startAnywhere = false): Drop => {
      const z = Math.random() ** 1.5;
      const floor = height * (0.72 + z * 0.26) + Math.random() * 20;
      return {
        x: Math.random() * (width + 100),
        y: startAnywhere ? Math.random() * floor : -Math.random() * height * 0.3 - 20,
        z,
        speed: 700 + z * 900,
        len: 10 + z * 22,
        floor,
        ...d,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      for (const [canvas, c] of [[back, ctx], [front, fctx]] as const) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      drops = Array.from({ length: dropCount() }, () => spawnDrop({}, true));
    };

    const dropCount = () => Math.round((width / 1000) * DROPS_PER_1000PX * density);

    // Botón del menú: agrega gotas nuevas desde arriba o quita las que sobran
    const onIntensity = (e: Event) => {
      density = RAIN_LEVELS[(e as CustomEvent<number>).detail].density;
      const count = dropCount();
      if (count > drops.length) {
        drops.push(...Array.from({ length: count - drops.length }, () => spawnDrop()));
      } else {
        drops.length = count;
      }
      if (reduceMotion) drawStill();
    };

    // Gotitas en abanico hacia arriba desde (x, y)
    const spray = (list: Splash[], x: number, y: number, z: number, pieces: number, power: number) => {
      for (let i = 0; i < pieces; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
        const force = (120 + Math.random() * 200) * (0.5 + z) * power;
        list.push({
          x,
          y,
          vx: Math.cos(angle) * force,
          vy: Math.sin(angle) * force,
          life: 0,
          max: 0.35 + Math.random() * 0.25,
          size: 0.8 + z * 1.4,
        });
      }
    };

    const burst = (drop: Drop) => {
      ripples.push({ x: drop.x, y: drop.floor, r: 1, max: 8 + drop.z * 18, life: 0, z: drop.z });
      spray(splashes, drop.x, drop.floor, drop.z, 2 + Math.round(drop.z * 4), 1);
    };

    // Altura de la superficie del obstáculo bajo x, o null si la gota no pasa por encima
    const surfaceAt = (o: Obstacle, x: number) => {
      const r = o.el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < 0 || r.top > height) return null;
      if (o.shape === "circle") {
        const radius = r.width / 2;
        const dx = x - (r.left + radius);
        if (Math.abs(dx) >= radius) return null;
        return r.top + radius - Math.sqrt(radius * radius - dx * dx);
      }
      if (o.shape === "pill") {
        // Botón redondeado: borde recto arriba y medio círculo en cada punta
        const radius = r.height / 2;
        if (x < r.left || x > r.right) return null;
        const cx = Math.min(Math.max(x, r.left + radius), r.right - radius);
        const dx = x - cx;
        return r.top + radius - Math.sqrt(Math.max(radius * radius - dx * dx, 0));
      }
      if (o.shape === "text") {
        // Título: el alto de línea deja aire arriba, las letras empiezan un poco más abajo
        if (x < r.left || x > r.right) return null;
        return r.top + r.height * 0.18;
      }
      // Caja recortada: el Lottie tiene aire alrededor del dibujo
      const insetX = r.width * 0.2;
      if (x < r.left + insetX || x > r.right - insetX) return null;
      return r.top + r.height * 0.25;
    };

    const drawSplashes = (c: CanvasRenderingContext2D, list: Splash[], dt: number, alpha: number) => {
      for (let i = list.length - 1; i >= 0; i--) {
        const s = list[i];
        s.life += dt;
        if (s.life >= s.max) {
          list.splice(i, 1);
          continue;
        }
        s.vy += GRAVITY * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        c.fillStyle = `rgba(200, 230, 255, ${(1 - s.life / s.max) * alpha})`;
        c.beginPath();
        c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        c.fill();
      }
    };

    let frame = 0;
    let last = performance.now();
    let lastScan = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // evita saltos al volver a la pestaña
      last = now;
      ctx.clearRect(0, 0, width, height);
      fctx.clearRect(0, 0, width, height);

      if (now - lastScan > 1000) {
        findObstacles();
        lastScan = now;
      }
      const canHit = now - mountedAt > HIT_AFTER_MS;

      // Gotas cayendo
      ctx.lineCap = "round";
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const prevY = d.y;
        d.x += WIND * dt * (0.5 + d.z);
        d.y += d.speed * dt;

        // ¿Cruzó la superficie de Pochita o de la foto en este fotograma?
        if (canHit) {
          let hitY: number | null = null;
          for (const o of obstacles) {
            const sy = surfaceAt(o, d.x);
            if (sy !== null && prevY < sy && d.y >= sy) {
              hitY = sy;
              break;
            }
          }
          if (hitY !== null) {
            spray(hitSplashes, d.x, hitY, d.z, 4 + Math.round(d.z * 4), 0.8);
            drops[i] = spawnDrop();
            continue;
          }
        }

        if (d.y >= d.floor) {
          burst(d);
          drops[i] = spawnDrop();
          continue;
        }

        const tilt = (WIND / d.speed) * d.len;
        ctx.strokeStyle = `rgba(173, 216, 255, ${0.15 + d.z * 0.45})`;
        ctx.lineWidth = 0.6 + d.z * 1.2;
        ctx.beginPath();
        ctx.moveTo(d.x - tilt, d.y - d.len);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }

      // Ondas en el suelo (elipses aplanadas por la perspectiva)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.life += dt * 2.2;
        if (r.life >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        r.r = r.max * (1 - (1 - r.life) ** 3); // ease-out
        ctx.strokeStyle = `rgba(173, 216, 255, ${(1 - r.life) * (0.2 + r.z * 0.4)})`;
        ctx.lineWidth = 0.8 + r.z * 0.6;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r, r.r * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      drawSplashes(ctx, splashes, dt, 0.8);
      drawSplashes(fctx, hitSplashes, dt, 0.95);

      frame = requestAnimationFrame(tick);
    };

    // Sin animación: solo un fotograma quieto de lluvia (también al redimensionar)
    const drawStill = () => {
      tick(last);
      cancelAnimationFrame(frame);
    };
    const onResize = () => {
      resize();
      if (reduceMotion) drawStill();
    };

    resize();
    window.addEventListener("resize", onResize);
    window.addEventListener(RAIN_EVENT, onIntensity);
    if (reduceMotion) drawStill();
    else frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener(RAIN_EVENT, onIntensity);
    };
  }, []);

  return (
    <>
      <canvas ref={backRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
      {/* Por delante del contenido pero por debajo de la pantalla de inicio (z-50) */}
      <canvas ref={frontRef} aria-hidden className="pointer-events-none fixed inset-0 z-40 h-full w-full" />
    </>
  );
}
