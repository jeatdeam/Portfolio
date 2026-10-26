import PillWalker from "./PillWalker";
import pochita from "../lotties/pochita_caminando.json";
import RainControl from "./RainControl";
import { NAV_LINKS } from "./nav-links";

export default function SiteHeader() {
  return (
    // En celular y tablet no hay menú arriba: lo reemplaza el botón de SideRail
    <div className="mx-auto hidden w-full max-w-5xl px-4 pt-14 lg:block">
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
        className="glass flex items-center justify-between rounded-3xl px-6 py-4"
      >
        <a href="#inicio" className="font-mono text-lg font-black tracking-tight text-white">
          Paulo<span className="text-accent">Dev</span>
        </a>
        <div className="flex items-center gap-6">
          <nav aria-label="Principal">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-50">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-accent">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <RainControl />
        </div>
      </PillWalker>
    </div>
  );
}
