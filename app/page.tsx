import Image from "next/image";
import fotoPerfil from "../public/foto-perfil.png";
import SiteHeader from "./components/SiteHeader";
import DevCredits from "./components/DevCredits";
import IntroScreen from "./components/IntroScreen";
import RainBackground from "./components/RainBackground";
import SideRail from "./components/SideRail";
import ProjectSketch, { type SketchKind } from "./components/ProjectSketch";
import { INTRO_SHOW_MS } from "./components/intro-timing";

type Project = {
  title: string;
  description: string;
  tags: string[];
  logos: string[]; // SVGs de public/stack que van al lado del nombre
  sketch: SketchKind;
  live?: string; // sitio publicado en Vercel; sin live se enlaza al repositorio y se marca "Próximamente"
  repo: string;
};

const PROJECTS: Project[] = [
  {
    title: "Los Andes",
    description:
      "Tienda de equipos de protección personal para minería y construcción. El cliente arma su carrito y recibe una cotización en PDF por correo o WhatsApp.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Express", "PostgreSQL", "Prisma"],
    logos: ["nextjs", "tailwindcss", "express", "postgresql"],
    sketch: "andes",
    live: "https://andes-epps-rosy.vercel.app",
    repo: "https://github.com/jeatdeam/AndesEpps",
  },
  {
    title: "APPSQL",
    description:
      "App para practicar SQL estilo SQL Server con la base Northwind. Escribes la consulta, se ejecuta en el navegador y te dice si coincide con la solución.",
    tags: ["React", "TypeScript", "Vite", "SQLite WASM"],
    logos: ["react", "typescript", "vite", "sqlite"],
    sketch: "appsql",
    live: "https://app-sql-self.vercel.app",
    repo: "https://github.com/jeatdeam/APPSQL",
  },
  {
    title: "Marketplace",
    description: "Tienda en línea con catálogo de productos y carrito: frontend en React y API en Express, todo en TypeScript.",
    tags: ["React", "TypeScript", "Vite", "Express"],
    logos: ["react", "typescript", "vite", "express"],
    sketch: "marketplace",
    repo: "https://github.com/jeatdeam/Marketplace",
  },
];

// Logos negros que se aclaran sobre el fondo oscuro
const DARK_LOGOS = ["nextjs", "github", "express"];

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
    <h2 className="mb-8 font-mono text-sm uppercase tracking-[0.2em] text-accent">
      {children}
    </h2>
  );
}

function ProjectDetails({ project }: { project: Project }) {
  return (
    <>
      <p className="text-[13px] leading-snug text-zinc-100">{project.description}</p>
      <ul className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <li key={tag} className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent">
            {tag}
          </li>
        ))}
      </ul>
      <span className="text-sm font-black text-accent">{project.live ? "Ver sitio ↗" : "Ver código ↗"}</span>
    </>
  );
}

// Tarjeta: el boceto de la pantalla y el nombre con sus logos (en tablet, uno al lado del otro). Con mouse, la descripción y las
// tecnologías aparecen sobre el boceto al pasar el cursor; en pantallas táctiles van debajo, siempre visibles.
function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.live ?? project.repo}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl sm:max-lg:flex-row border border-white/10 bg-surface transition-colors hover:border-accent/60 focus-visible:border-accent focus-visible:outline-none"
    >
      <div className="relative aspect-[16/10] border-b border-white/10 bg-[#0b1734] p-3 sm:max-lg:w-[48%] sm:max-lg:shrink-0 sm:max-lg:border-r sm:max-lg:border-b-0">
        <ProjectSketch kind={project.sketch} />
        {!project.live && (
          <span className="absolute top-4 right-4 rounded-full border border-amber-300/50 bg-background/80 px-2 py-0.5 text-xs text-amber-200">
            Próximamente
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col sm:max-lg:justify-center">
        <div className="flex flex-col items-start gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h3 className="text-lg font-black text-white">{project.title}</h3>
          <span className="flex shrink-0 items-center gap-1.5" aria-label={`Hecho con ${project.tags.join(", ")}`}>
            {project.logos.map((logo) => (
              <Image
                key={logo}
                src={`/stack/${logo}.svg`}
                alt=""
                width={20}
                height={20}
                className={`size-5 ${DARK_LOGOS.includes(logo) ? "invert" : ""}`}
              />
            ))}
          </span>
        </div>
        <div className="flex flex-col gap-3 px-5 pb-5 pointer-fine:hidden">
          <ProjectDetails project={project} />
        </div>
      </div>
      <div className="absolute inset-0 hidden flex-col justify-center gap-3 overflow-y-auto bg-background/92 p-4 opacity-0 backdrop-blur-sm transition-[opacity,translate] duration-300 ease-out pointer-fine:flex translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <ProjectDetails project={project} />
      </div>
    </a>
  );
}

export default function Home() {
  return (
    <>
      <IntroScreen />
      <RainBackground />
      <SideRail />
      <div className="page-enter flex flex-1 flex-col" style={{ animationDelay: `${INTRO_SHOW_MS}ms` }}>
        <SiteHeader />

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-28 px-6 py-24">
          <section
            id="inicio"
            className="flex scroll-mt-24 flex-col-reverse items-center gap-12 md:flex-row md:justify-between"
          >
            <div>
              <p className="mb-4 font-mono text-accent">Hola, soy</p>
              <h1 data-rain-hit="text" className="text-5xl font-black tracking-tight text-white sm:text-7xl">Paulo Aylas</h1>
              <p className="mt-4 text-2xl text-zinc-100 sm:text-3xl">Desarrollador web front-end.</p>
              <p className="mt-6 max-w-xl leading-relaxed text-zinc-100">
                Construyo interfaces rápidas, accesibles y con animaciones que les dan personalidad.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <a href="#proyectos" data-rain-hit="pill" className="rounded-full bg-sky-600 px-6 py-3 text-center font-black text-white transition-colors hover:bg-sky-500">
                  Ver proyectos
                </a>
                <a href="#contacto" data-rain-hit="pill" className="rounded-full text-center border border-white/20 bg-surface px-6 py-3 font-black text-white transition-colors hover:border-accent/60 hover:bg-surface-hover">
                  Contactar
                </a>
                <a
                  href={GITHUB_URL}
                  data-rain-hit="pill"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-surface px-6 py-3 font-black text-white transition-colors hover:border-accent/60 hover:bg-surface-hover"
                >
                  <Image src="/stack/github.svg" alt="" width={20} height={20} className="invert" />
                  GitHub
                </a>
              </div>
            </div>
            <div className="relative w-56 shrink-0 sm:w-72" data-rain-hit="circle">
              <div className="absolute -inset-3 rounded-full bg-accent/20 blur-2xl" aria-hidden />
              <Image
                src={fotoPerfil}
                alt="Foto de perfil de Paulo Aylas"
                placeholder="blur"
                preload
                sizes="(min-width: 640px) 288px, 224px"
                className="relative aspect-square w-full rounded-full border-4 border-surface object-cover object-[50%_25%] ring-2 ring-accent/70"
              />
            </div>
          </section>

          <section id="sobre-mi" className="scroll-mt-24">
            <SectionTitle>Sobre mí</SectionTitle>
            <div className="max-w-2xl space-y-4 leading-relaxed text-zinc-100">
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
            <ul className="grid gap-6 lg:grid-cols-3">
              {PROJECTS.map((project) => (
                <li key={project.title}>
                  <ProjectCard project={project} />
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
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-surface px-3 py-4 text-center transition-colors hover:border-accent/60 sm:flex-row sm:gap-3 sm:px-4 sm:py-3 sm:text-left"
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
                  <span className="text-sm leading-tight text-white">
                    {tech.name}
                    {tech.note && <span className="block text-xs text-zinc-300">({tech.note})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section id="contacto" className="scroll-mt-24">
            <SectionTitle>Contacto</SectionTitle>
            <p className="max-w-xl leading-relaxed text-zinc-100">
              ¿Tienes un proyecto en mente o quieres trabajar juntos? Escríbeme.
            </p>
            <a
              href="mailto:tu-correo@ejemplo.com"
              className="mt-6 inline-block rounded-full bg-sky-600 px-6 py-3 font-black text-white transition-colors hover:bg-sky-500"
            >
              Enviar correo
            </a>
            <p className="mt-6 text-sm text-zinc-100">
              También puedes ver mi código en{" "}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-accent underline-offset-4 hover:underline"
              >
                github.com/jeatdeam
              </a>
            </p>
          </section>
        </main>

        <DevCredits />
      </div>
    </>
  );
}
