import { RagPreview } from "@/components/RagPreview";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Timeline } from "@/components/Timeline";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import { formatHistoricalDate } from "@/lib/formatHistoricalDate";
import { SAMPLE_EVENTS } from "@/lib/sampleEvents";

const FEATURES = [
  {
    title: "Cronologías vivas",
    text: "Registra eventos con fecha, época y descripción, y míralos ordenados en una línea del tiempo que crece con tus lecturas.",
  },
  {
    title: "Fuentes y notas",
    text: "Asocia cada evento a tus notas personales y a fuentes primarias o secundarias, para saber siempre de dónde sale cada dato.",
  },
  {
    title: "Consultas con RAG",
    text: "Pregunta en lenguaje natural y recibe respuestas basadas solo en tus notas, con las fuentes citadas.",
  },
  {
    title: "Fichas automáticas",
    text: "Pega un fragmento de lectura y la IA propone una ficha estructurada del evento, validada antes de guardarse.",
  },
];

const STEPS = [
  { title: "Registra", text: "Añade eventos, lecturas y notas desde tu panel." },
  { title: "Indexa", text: "Tus notas se convierten en embeddings y se guardan en PostgreSQL con pgvector." },
  { title: "Pregunta", text: "Claude responde usando únicamente el contexto recuperado de tu biblioteca." },
];

const firstEvent = SAMPLE_EVENTS[0];
const lastEvent = SAMPLE_EVENTS[SAMPLE_EVENTS.length - 1];

const STATS = [
  { value: String(SAMPLE_EVENTS.length), label: "eventos de ejemplo" },
  { value: String(HISTORICAL_ERAS.length), label: "épocas" },
  {
    value: `${formatHistoricalDate({ year: firstEvent.date.year })} – ${formatHistoricalDate({ year: lastEvent.date.year })}`,
    label: "arco temporal",
  },
];

export default function Home() {
  return (
    <>
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <a href="#" className="font-serif text-xl font-bold tracking-tight">
          Memnon<span className="text-accent">History</span> AI
        </a>
        <div className="flex items-center gap-6">
          <nav aria-label="Principal" className="hidden gap-6 text-sm text-muted sm:flex">
            <a href="#cronologia" className="hover:text-foreground">Cronología</a>
            <a href="#consulta" className="hover:text-foreground">Consulta</a>
            <a href="#como-funciona" className="hover:text-foreground">Cómo funciona</a>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        <section className="relative isolate">
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-gradient-to-r from-dawn-from to-dawn-to opacity-60 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-accent">
              Gestor inteligente de conocimiento histórico
            </p>
            <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Tus lecturas de historia, ordenadas en el tiempo y listas para preguntar.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Organiza eventos, fuentes y notas de Grecia, Roma o Hispania, y consulta tu propia
              biblioteca con IA que responde citando de dónde sale cada dato.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#cronologia"
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-85"
              >
                Explorar la cronología
              </a>
              <a
                href="#consulta"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface px-6 text-sm font-medium transition-colors hover:border-foreground/30"
              >
                Ver una consulta de ejemplo
              </a>
            </div>

            <dl className="mt-14 grid max-w-2xl grid-cols-1 gap-6 border-t border-border pt-8 sm:grid-cols-3">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-wider text-muted">{stat.label}</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="font-serif text-xl font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="cronologia" className="scroll-mt-8 border-y border-border bg-surface/50 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Cronología"
              title="De la fundación de Roma a Emerita Augusta"
              text="Una muestra de cómo se verán tus eventos. Cada uno se valida con el mismo esquema de dominio que usará la aplicación."
            />
            <Timeline events={SAMPLE_EVENTS} />
          </div>
        </section>

        <section id="consulta" className="scroll-mt-8 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Consulta"
              title="Pregunta a tu biblioteca"
              text="Las respuestas se apoyan solo en tus notas y fuentes, y cada afirmación enlaza a su origen."
            />
            <RagPreview />
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-8 border-t border-border py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading eyebrow="Cómo funciona" title="Tres pasos, una sola fuente de verdad" />
            <ol className="grid gap-4 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-border bg-surface p-6">
                  <span className="font-serif text-4xl font-semibold text-accent">{index + 1}</span>
                  <h3 className="mt-3 font-serif text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
          <p>Trabajo Fin de Máster · Máster en Desarrollo con IA · BigSchool</p>
          <p>Memnón, hijo de Eos, la Aurora: el amanecer del conocimiento histórico.</p>
        </div>
      </footer>
    </>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h2 className="font-serif text-4xl font-semibold tracking-tight">{title}</h2>
      {text && <p className="mt-4 leading-7 text-muted">{text}</p>}
    </div>
  );
}
