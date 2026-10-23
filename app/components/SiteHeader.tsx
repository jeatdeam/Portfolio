import PillWalker from "./PillWalker";
import pochita from "../lotties/pochita_caminando.json";

const LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#habilidades", label: "Habilidades" },
  { href: "#contacto", label: "Contacto" },
];

export default function SiteHeader() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-14">
      {/* pochita_caminando mira a la izquierda de fábrica y el recorrido es horario → flip */}
      <PillWalker
        as="header"
        animationData={pochita}
        fullLap
        flip
        pace={40}
        speed={0.6}
        size={44}
        sink={2}
        className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-[#1f1f1f] px-6 py-4 sm:flex-row sm:justify-between"
      >
        <a href="#inicio" className="font-mono text-lg font-bold tracking-tight text-white">
          Paulo<span className="text-sky-500">Dev</span>
        </a>
        <nav aria-label="Principal">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-300">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-sky-400">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PillWalker>
    </div>
  );
}
