"use client";

import { useEffect, useRef } from "react";
import { RAIN_EVENT, RAIN_LEVELS, readRainLevel } from "./rain-intensity";

// Lluvia de fondo en canvas 2D: las gotas caen, revientan al tocar su "suelo"
// y dejan una onda y unas gotitas que salpican hacia arriba.
// Los elementos con data-rain-hit ("box", "circle", "pill" o "text") también reciben gotas:
// esas salpicaduras se dibujan en un segundo canvas por delante del contenido.
// Dentro de [data-rain-words] las gotas revientan sobre una sola palabra, botón [data-rain-pill]
// o caja [data-rain-card] elegida al azar; tras unas cuantas gotas salta a otra, en un ciclo sin fin.

const DROPS_PER_1000PX = 90; // densidad según el ancho de la pantalla (nivel "Lluvia")
const GRAVITY = 1800; // px/s² para las gotitas de la salpicadura
const WIND = -60; // px/s, una leve inclinación hacia la izquierda
const HIT_AFTER_MS = 700; // no choca con nada mientras dura la entrada de la página (.page-enter)
const WORD_HITS = [8, 16]; // gotas que recibe cada palabra antes de saltar a otra (mín, máx)
const BOOST_HITS = [25, 40]; // palabras con data-rain-boost (nombre y subtítulo): reciben más gotas
const BOOST_PICK = 0.5; // probabilidad de que el siguiente turno sea para una palabra con data-rain-boost
const BOOST_AIM = 0.15; // fracción de gotas nuevas que apuntan a una palabra con data-rain-boost
const WORD_MAX_MS = 4000; // pasado este tiempo se salta a otra, aunque no haya recibido todas sus gotas

type Drop = { x: number; y: number; z: number; speed: number; len: number; floor: number };
type Splash = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number };
type Ripple = { x: number; y: number; r: number; max: number; life: number; z: number };
type Obstacle = { el: Element; shape: string; cover: Element | null };
// Una palabra suelta (un Range sobre el texto) o un botón / caja entero
type WordTarget =
  | { shape: "text"; range: Range; node: Node; key: string }
  | { shape: "pill" | "card"; el: Element; radius: number; key: Element };

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
        // Un contenedor con data-rain-cover lo tapa cuando pasa por debajo (Pochita bajo el menú)
        cover: el.parentElement?.closest("[data-rain-cover]") ?? null,
      }));
      findWords();
    };

    // Palabras, botones y cajas de la página. Se rearman en cada búsqueda porque el texto cambia
    // (la máquina de escribir de los créditos); la palabra activa se reconoce por su clave.
    let words: WordTarget[] = [];
    let active: WordTarget | null = null;
    let hitsLeft = 0;
    let activeSince = 0;

    const findWords = () => {
      words = [];
      for (const root of document.querySelectorAll("[data-rain-words]")) {
        // Botones y cajas cuentan como uno solo: la gota revienta en su borde de arriba
        for (const el of root.querySelectorAll("[data-rain-pill], [data-rain-card]")) {
          const pill = el.hasAttribute("data-rain-pill");
          const radius = pill ? 0 : parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
          words.push({ shape: pill ? "pill" : "card", el, radius, key: el });
        }
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const parent = node.parentElement;
          if (!parent || parent.closest("[data-rain-pill], [data-rain-card]")) continue;
          // Texto invisible que solo reserva espacio (el de los créditos)
          if (!parent.checkVisibility({ visibilityProperty: true })) continue;
          for (const m of (node.textContent ?? "").matchAll(/\S+/g)) {
            const range = document.createRange();
            range.setStart(node, m.index);
            range.setEnd(node, m.index + m[0].length);
            words.push({ shape: "text", range, key: `${m.index}`, node });
          }
        }
      }
      // La palabra activa pasa a ser la de la nueva lista (o se suelta si ya no existe)
      if (active) active = words.find((w) => sameWord(w, active!)) ?? null;
    };

    const sameWord = (a: WordTarget, b: WordTarget) =>
      a.key === b.key && (a.shape !== "text" || (b.shape === "text" && a.node === b.node));

    const wordRect = (w: WordTarget) => (w.shape === "text" ? w.range : w.el).getBoundingClientRect();

    const isVisible = (w: WordTarget) => {
      const r = wordRect(w);
      return r.width > 1 && r.bottom > 0 && r.top < height;
    };

    // Elige otra palabra visible al azar (nunca la misma dos veces seguidas)
    const pickWord = (now: number) => {
      // Primero un elemento (título, párrafo, botón, caja…) y luego una de sus palabras:
      // así un párrafo largo no tiene más chances que "Paulo Aylas" o un botón
      const groups = new Map<Element, WordTarget[]>();
      for (const w of words) {
        if ((active && sameWord(w, active)) || !isVisible(w)) continue;
        const g = w.shape === "text" ? w.node.parentElement! : w.el;
        groups.set(g, [...(groups.get(g) ?? []), w]);
      }
      // El nombre y el subtítulo (data-rain-boost) tienen prioridad: salen la mitad de las veces
      const all = [...groups.entries()];
      const priority = all.filter(([g]) => g.closest("[data-rain-boost]"));
      const options = (priority.length && Math.random() < BOOST_PICK ? priority : all).map(([, ws]) => ws);
      const group = options[Math.floor(Math.random() * options.length)];
      active = group ? group[Math.floor(Math.random() * group.length)] : null;
      const el = active && (active.shape === "text" ? active.node.parentElement : active.el);
      boosted = !!el?.closest("[data-rain-boost]");
      const [min, max] = boosted ? BOOST_HITS : WORD_HITS;
      hitsLeft = min + Math.floor(Math.random() * (max - min + 1));
      activeSince = now;
    };

    // Rectángulo de la palabra activa en este fotograma (lo usa spawnDrop para apuntar)
    let activeRect: DOMRect | null = null;
    let boosted = false;

    // z va de 0 (lejos) a 1 (cerca): las cercanas son más largas, rápidas y revientan más abajo
    const spawnDrop = (d: Partial<Drop> = {}, startAnywhere = false): Drop => {
      const z = Math.random() ** 1.5;
      let floor = height * (0.72 + z * 0.26) + Math.random() * 20;
      const speed = 700 + z * 900;
      const y = startAnywhere ? Math.random() * floor : -Math.random() * height * 0.3 - 20;
      let x = Math.random() * (width + 100);
      // Palabra con data-rain-boost: parte de las gotas nuevas caen justo encima de ella.
      // Se resta lo que el viento la va a correr hasta llegar a la palabra.
      if (!startAnywhere && boosted && activeRect && Math.random() < BOOST_AIM) {
        const fall = (activeRect.top - y) / speed;
        x = activeRect.left + Math.random() * activeRect.width - WIND * (0.5 + z) * fall;
        floor = Math.max(floor, activeRect.bottom);
      }
      return { x, y, z, speed, len: 10 + z * 22, floor, ...d };
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
      const y = rawSurfaceAt(o, x);
      if (y === null || !o.cover) return y;
      // Si el contenedor está encima de ese punto, la gota choca con él y nunca llega al obstáculo
      const c = o.cover.getBoundingClientRect();
      return x >= c.left && x <= c.right && y > c.top ? null : y;
    };

    const rawSurfaceAt = (o: Obstacle, x: number) => shapeSurfaceAt(o.shape, o.el.getBoundingClientRect(), x);

    const shapeSurfaceAt = (shape: string, r: DOMRect, x: number, radius = 0) => {
      if (r.width === 0 || r.bottom < 0 || r.top > height) return null;
      if (shape === "circle") {
        const radius = r.width / 2;
        const dx = x - (r.left + radius);
        if (Math.abs(dx) >= radius) return null;
        return r.top + radius - Math.sqrt(radius * radius - dx * dx);
      }
      if (shape === "pill" || shape === "card") {
        // Borde recto arriba y esquinas redondeadas; el botón es medio círculo en cada punta
        if (shape === "pill") radius = r.height / 2;
        if (x < r.left || x > r.right) return null;
        const cx = Math.min(Math.max(x, r.left + radius), r.right - radius);
        const dx = x - cx;
        return r.top + radius - Math.sqrt(Math.max(radius * radius - dx * dx, 0));
      }
      if (shape === "text") {
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

      // Cambia de palabra si ya recibió sus gotas, si tardó demasiado o si salió de la pantalla
      if (canHit && words.length && (!active || hitsLeft <= 0 || now - activeSince > WORD_MAX_MS || !isVisible(active))) {
        pickWord(now);
      }
      activeRect = canHit && active ? wordRect(active) : null;

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
          if (hitY === null && active && activeRect) {
            const sy = shapeSurfaceAt(active.shape, activeRect, d.x, active.shape === "card" ? active.radius : 0);
            if (sy !== null && prevY < sy && d.y >= sy) {
              hitY = sy;
              hitsLeft--;
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
