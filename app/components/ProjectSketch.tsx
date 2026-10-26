// Bocetos en líneas blancas de cada proyecto: la ventana del navegador con solo los bordes
// de los bloques de su pantalla principal y los íconos pequeños, sin contenido.

export type SketchKind = "andes" | "appsql" | "marketplace";

export default function ProjectSketch({ kind }: { kind: SketchKind }) {
  return (
    <svg
      viewBox="0 0 320 200"
      className="sketch h-full w-full text-white"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <BrowserFrame />
      {kind === "andes" && <Andes />}
      {kind === "appsql" && <AppSql />}
      {kind === "marketplace" && <Marketplace />}
    </svg>
  );
}

// Ventana: barra de título con los tres botones y la barra de direcciones
function BrowserFrame() {
  return (
    <g className="sketch-frame">
      <rect x="8" y="8" width="304" height="184" rx="8" />
      <path d="M8 24h304" />
      <circle cx="18" cy="16" r="2.2" />
      <circle cx="26" cy="16" r="2.2" />
      <circle cx="34" cy="16" r="2.2" />
      <rect x="60" y="12" width="200" height="8" rx="4" />
    </g>
  );
}

/* ---------- Íconos pequeños ---------- */

function Search({ x, y }: { x: number; y: number }) {
  return (
    <g className="sketch-icon">
      <circle cx={x - 1} cy={y - 1} r="2.6" />
      <path d={`M${x + 1} ${y + 1}l2.4 2.4`} />
    </g>
  );
}

function Bag({ x, y }: { x: number; y: number }) {
  return (
    <g className="sketch-icon">
      <rect x={x - 3.5} y={y - 2} width="7" height="6.5" rx="1" />
      <path d={`M${x - 1.8} ${y - 2}v-1a1.8 1.8 0 0 1 3.6 0v1`} />
    </g>
  );
}

function Menu({ x, y }: { x: number; y: number }) {
  return (
    <path className="sketch-icon" d={`M${x - 4} ${y - 3}h8M${x - 4} ${y}h8M${x - 4} ${y + 3}h8`} />
  );
}

function Gear({ x, y }: { x: number; y: number }) {
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `M${x + Math.cos(a) * 3} ${y + Math.sin(a) * 3}L${x + Math.cos(a) * 4.4} ${y + Math.sin(a) * 4.4}`;
  }).join("");
  return (
    <g className="sketch-icon">
      <circle cx={x} cy={y} r="3" />
      <circle cx={x} cy={y} r="1.1" />
      <path d={ticks} />
    </g>
  );
}

function Heart({ x, y }: { x: number; y: number }) {
  return (
    <path
      className="sketch-icon"
      d={`M${x} ${y + 2.4}l-2.6-2.6a1.5 1.5 0 0 1 2.6-2a1.5 1.5 0 0 1 2.6 2z`}
    />
  );
}

/* ---------- Los Andes: tienda de EPP ---------- */
function Andes() {
  return (
    <g>
      {/* Ícono de la franja de anuncio */}
      <circle className="sketch-icon" cx="194" cy="31" r="2" />

      {/* Menú en píldora: buscador, bolsa y menú */}
      <rect x="20" y="38" width="280" height="22" rx="6" />
      <rect x="182" y="44" width="76" height="10" rx="5" />
      <Search x={190} y={49} />
      <Bag x={270} y={49} />
      <Menu x={287} y={49} />

      {/* Banner principal con sus indicadores */}
      <rect x="20" y="65" width="280" height="80" rx="6" />
      <circle className="sketch-icon" cx="146" cy="141" r="1.2" />
      <circle className="sketch-icon" cx="151" cy="141" r="1.2" />
      <circle className="sketch-icon" cx="156" cy="141" r="1.2" />
      <rect className="sketch-icon" x="160" y="139.8" width="12" height="2.4" rx="1.2" />

      {/* Fila de marcas */}
      {[24, 70, 116, 162, 208].map((x) => (
        <rect key={x} x={x} y="160" width="40" height="24" rx="3" />
      ))}

      {/* Botón flotante de WhatsApp */}
      <circle className="sketch-icon" cx="282" cy="172" r="11" />
      <path
        className="sketch-icon"
        d="M278 168.5c0 4 3.5 7.5 7.5 7.5l1.6-1.6-2.2-1.4-1 1c-1.5-.6-2.8-1.9-3.4-3.4l1-1-1.4-2.2z"
      />
    </g>
  );
}

/* ---------- APPSQL: práctica de SQL ---------- */
function AppSql() {
  return (
    <g>
      <rect x="80" y="32" width="160" height="154" rx="4" />

      {/* Cabecera: base de datos, vidas y selector de tema */}
      <rect x="121" y="38" width="28" height="10" rx="2" />
      <Heart x={158} y={43} />
      <Heart x={165} y={43} />
      <Heart x={172} y={43} />
      <rect x="206" y="38" width="26" height="10" rx="2" />
      <path className="sketch-icon" d="M224 42l2 2 2-2" />
      <path d="M80 53h160" />

      {/* Fila de niveles */}
      <Menu x={92} y={60} />
      <path className="sketch-icon" d="M228 58.5h5l-2.5 3z" />
      <path d="M80 67h160" />

      {/* Editor con la columna de números de línea */}
      <rect x="88" y="102" width="144" height="38" rx="2" />
      <path d="M98 102v38" />

      {/* Botones: ejecutar, comprobar, pista y ver solución */}
      <rect x="88" y="145" width="26" height="10" rx="2" />
      <path className="sketch-icon" d="M95 147.5v5l4-2.5z" />
      <rect x="118" y="145" width="28" height="10" rx="2" />
      <path className="sketch-icon" d="M123 150l1.6 1.6 3-3.2" />
      <rect x="150" y="145" width="24" height="10" rx="2" />
      <rect x="178" y="145" width="32" height="10" rx="2" />
      <path className="sketch-icon" d="M181 150q3-3 6 0q-3 3-6 0z" />
      <path d="M80 160h160" />

      {/* Tablas de la base */}
      {[
        [104, 164, 22],
        [130, 164, 26],
        [160, 164, 26],
        [190, 164, 38],
        [88, 175, 22],
        [114, 175, 24],
        [142, 175, 24],
      ].map(([x, y, w]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height="8" rx="2" />
      ))}
    </g>
  );
}

/* ---------- Marketplace: tienda K-moon ---------- */
function Marketplace() {
  return (
    <g>
      {/* Franja de envío gratis con camioncito */}
      <g className="sketch-icon">
        <rect x="89" y="27.5" width="6" height="4.5" rx="0.6" />
        <path d="M95 29h2.4l1.6 1.6V32H95" />
        <circle cx="91" cy="33" r="0.9" />
        <circle cx="97" cy="33" r="0.9" />
      </g>
      <path d="M8 36h304" />

      {/* Cabecera con los tres íconos */}
      <Search x={248} y={48} />
      <Bag x={264} y={48} />
      <Gear x={281} y={48} />
      <path d="M20 61h280" />

      {/* Fila de marcas */}
      <path d="M8 78h304" />

      {/* Carrusel con sus flechas */}
      <rect x="14" y="84" width="292" height="102" rx="4" />
      <path className="sketch-icon" d="M22 128l-5 5 5 5M298 128l5 5-5 5" />
    </g>
  );
}
