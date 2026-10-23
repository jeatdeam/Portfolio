import Image from "next/image";
import fotoPerfil from "../public/foto-perfil.png";
import SiteHeader from "./components/SiteHeader";
import DevCredits from "./components/DevCredits";
import IntroScreen from "./components/IntroScreen";
import { INTRO_SHOW_MS } from "./components/intro-timing";

const PROJECTS = [
  {
    title: "Proyecto Uno",
    description: "Aplicación web full-stack con autenticación, panel de control y despliegue continuo.",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    href: "#",
  },
  {
    title: "Proyecto Dos",
    description: "Landing page animada con Lotties y diseño responsive enfocada en conversión.",
    tags: ["React", "Tailwind", "Lottie"],
    href: "#",
  },
  {
    title: "Proyecto Tres",
    description: "API REST para gestión de inventario con documentación y pruebas automatizadas.",
    tags: ["Node.js", "Express", "Docker"],
    href: "#",
  },
];

const GITHUB_URL = "https://github.com/jeatdeam";

// icons: SVGs de public/stack (Devicon). invert = logos negros que se aclaran sobre el fondo oscuro
const STACK: { name: string; icons: string[]; invert?: string[]; note?: string }[] = [
  { name: "JavaScript", icons: ["javascript"] },
  { name: "TypeScript", icons: ["typescript"] },
  { name: "React", icons: ["react"] },
  { name: "React + TS", icons: ["react", "typescript"] },
  { name: "Next.js", icons: ["nextjs"], invert: ["nextjs"] },
  { name: "Node.js", icons: ["nodejs"] },
  { name: "Node + TS", icons: ["nodejs", "typescript"] },
  { name: "Tailwind CSS", icons: ["tailwindcss"] },
  { name: "Git", icons: ["git"] },
  { name: "GitHub", icons: ["github"], invert: ["github"] },
  { name: "Docker", icons: ["docker"] },
  { name: "PostgreSQL", icons: ["postgresql"] },
  { name: "SQL", icons: ["sql"] },
  { name: "Python", icons: ["python"] },
  { name: "Angular", icons: ["angular"], note: "muy básico" },
  { name: "Java", icons: ["java"], note: "muy básico" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-8 font-mono text-sm uppercase tracking-[0.2em] text-sky-400">
      {children}
    </h2>
  );
}

export default function Home() {
  return (
    <>
      <IntroScreen />
      <div className="page-enter flex flex-1 flex-col" style={{ animationDelay: `${INTRO_SHOW_MS}ms` }}>
        <SiteHeader />

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-28 px-6 py-24">
          <section
            id="inicio"
            className="flex scroll-mt-24 flex-col-reverse items-center gap-12 md:flex-row md:justify-between"
          >
            <div>
              <p className="mb-4 font-mono text-sky-400">Hola, soy</p>
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">Paulo Aylas</h1>
              <p className="mt-4 text-2xl text-zinc-400 sm:text-3xl">Desarrollador web front-end.</p>
              <p className="mt-6 max-w-xl leading-relaxed text-zinc-400">
                Construyo interfaces rápidas, accesibles y con animaciones que les dan personalidad.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#proyectos" className="rounded-full bg-sky-600 px-6 py-3 font-medium text-white transition-colors hover:bg-sky-500">
                  Ver proyectos
                </a>
                <a href="#contacto" className="rounded-full border border-white/15 px-6 py-3 font-medium text-zinc-200 transition-colors hover:bg-white/5">
                  Contactar
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-medium text-zinc-200 transition-colors hover:bg-white/5"
                >
                  <Image src="/stack/github.svg" alt="" width={20} height={20} className="invert" />
                  GitHub
                </a>
              </div>
            </div>
            <div className="relative w-56 shrink-0 sm:w-72">
              <div className="absolute -inset-3 rounded-full bg-sky-500/20 blur-2xl" aria-hidden />
              <Image
                src={fotoPerfil}
                alt="Foto de perfil de Paulo Aylas"
                placeholder="blur"
                preload
                sizes="(min-width: 640px) 288px, 224px"
                className="relative aspect-square w-full rounded-full border-4 border-[#1f1f1f] object-cover object-[50%_25%] ring-2 ring-sky-500/60"
              />
            </div>
          </section>

          <section id="sobre-mi" className="scroll-mt-24">
            <SectionTitle>Sobre mí</SectionTitle>
            <div className="max-w-2xl space-y-4 leading-relaxed text-zinc-400">
              <p>
                Soy desarrollador web apasionado por crear experiencias digitales cuidadas en cada detalle,
                desde la arquitectura del código hasta la última microinteracción.
              </p>
              <p>
                Me gusta trabajar con React y Next.js, y disfruto llevar diseños a la web con animación y buen rendimiento.
              </p>
            </div>
          </section>

          <section id="proyectos" className="scroll-mt-24">
            <SectionTitle>Proyectos</SectionTitle>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((project) => (
                <li key={project.title}>
                  <a
                    href={project.href}
                    className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#171717] p-6 transition-colors hover:border-sky-500/50"
                  >
                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{project.description}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <li key={tag} className="rounded-full bg-sky-500/10 px-3 py-1 font-mono text-xs text-sky-300">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section id="habilidades" className="scroll-mt-24">
            <SectionTitle>Mi stack</SectionTitle>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {STACK.map((tech) => (
                <li
                  key={tech.name}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#171717] px-4 py-3 transition-colors hover:border-sky-500/50"
                >
                  <span className="flex shrink-0 -space-x-2">
                    {tech.icons.map((icon) => (
                      <Image
                        key={icon}
                        src={`/stack/${icon}.svg`}
                        alt=""
                        width={32}
                        height={32}
                        className={`size-8 ${tech.invert?.includes(icon) ? "invert" : ""}`}
                      />
                    ))}
                  </span>
                  <span className="text-sm leading-tight text-zinc-200">
                    {tech.name}
                    {tech.note && <span className="block text-xs text-zinc-500">({tech.note})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section id="contacto" className="scroll-mt-24">
            <SectionTitle>Contacto</SectionTitle>
            <p className="max-w-xl leading-relaxed text-zinc-400">
              ¿Tienes un proyecto en mente o quieres trabajar juntos? Escríbeme.
            </p>
            <a
              href="mailto:tu-correo@ejemplo.com"
              className="mt-6 inline-block rounded-full bg-sky-600 px-6 py-3 font-medium text-white transition-colors hover:bg-sky-500"
            >
              Enviar correo
            </a>
            <p className="mt-6 text-sm text-zinc-400">
              También puedes ver mi código en{" "}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky-400 underline-offset-4 hover:underline"
              >
                github.com/jeatdeam
              </a>
            </p>
          </section>
        </main>

        <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-zinc-500">
          © 2026 Paulo Aylas. Todos los derechos reservados.
        </footer>
        <DevCredits />
      </div>
    </>
  );
}
