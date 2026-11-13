import Image from "next/image";
import { Greca } from "@/components/Greca";
import { HERO_IMAGE } from "@/lib/eraImages";

export interface HomeStats {
  topics: number;
  milestones: number;
  civilizations: number;
}

// La cabecera de la portada: el Foro romano velado de fondo, el título, una caja para preguntar a la
// enciclopedia y las cifras reales de lo que hay dentro. La caja es un formulario GET a /preguntar, así
// que funciona sin JavaScript y la pregunta llega escrita a la página de preguntar.
export function HomeHero({ stats }: { stats: HomeStats }) {
  const figures = [
    { value: stats.topics, label: stats.topics === 1 ? "tema" : "temas" },
    { value: stats.milestones, label: stats.milestones === 1 ? "hito en la cronología" : "hitos en la cronología" },
    { value: stats.civilizations, label: "civilizaciones" },
  ];

  return (
    // -mt-20 y pt-20: la foto sube por detrás de la barra de navegación, que es transparente.
    <section className="relative isolate -mt-20 overflow-hidden pt-20">
      <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="-z-20 object-cover object-center" />
      {/* El velo: la foto se intuye, pero el texto se lee siempre, en claro y en oscuro. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/88 to-background" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 -top-32 -z-10 mx-auto h-80 max-w-4xl rounded-full bg-gradient-to-r from-dawn-from to-dawn-to opacity-50 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <p className="mb-5 font-display text-sm font-medium uppercase tracking-[0.3em] text-accent">Enciclopedia de la Antigüedad</p>
        <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          La historia antigua, ordenada en el tiempo y lista para preguntar.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          Grecia, Roma e Hispania por civilizaciones, temas y cronologías, con una enciclopedia revisada que responde
          citando de dónde sale cada dato.
        </p>

        <form action="/preguntar" method="get" role="search" className="mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <label htmlFor="home-question" className="sr-only">
            Tu pregunta a la enciclopedia
          </label>
          <input
            id="home-question"
            name="q"
            type="search"
            maxLength={300}
            placeholder="¿Por qué cruzó César el Rubicón?"
            className="h-12 w-full appearance-none rounded-full border border-border bg-surface/90 px-5 text-sm outline-none backdrop-blur focus:border-accent sm:flex-1"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            Preguntar
          </button>
        </form>
        <a href="#civilizaciones" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
          O explora las civilizaciones <span aria-hidden="true">↓</span>
        </a>

        <dl className="mt-12 flex max-w-2xl flex-wrap gap-x-10 gap-y-4">
          {figures.map((figure) => (
            <div key={figure.label} className="flex flex-col-reverse">
              <dt className="text-xs uppercase tracking-wider text-muted">{figure.label}</dt>
              <dd className="font-serif text-3xl font-semibold">{figure.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <Greca />
    </section>
  );
}
