import Link from "next/link";

// Un ejemplo de consulta, para enseñar cómo responde la enciclopedia antes de iniciar sesión. Es fijo (no
// llama al modelo), pero sus fuentes son reales: cada cita lleva al párrafo o al evento exacto del tema de
// Julio César, como en una respuesta de verdad.
const SOURCES = [
  { number: 1, section: "Introducción", label: "Julio César", href: "/roma/personajes/julio-cesar#introduccion-2" },
  { number: 2, section: "Cronología", label: "Cruce del Rubicón (enero del 49 a.C.)", href: "/roma/personajes/julio-cesar#evento-event-rubicon" },
];

export function AskExample() {
  return (
    <figure className="relative rounded-3xl border border-border bg-surface p-6 sm:p-10">
      <span className="absolute right-6 top-6 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
        Ejemplo
      </span>
      <p className="font-display text-xs uppercase tracking-[0.25em] text-muted">Pregunta</p>
      <blockquote className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">¿Por qué cruzó César el Rubicón?</blockquote>

      <p className="mt-8 font-display text-xs uppercase tracking-[0.25em] text-muted">Respuesta</p>
      <p className="mt-2 max-w-2xl font-serif text-lg leading-8">
        Cuando el Senado le ordenó licenciar su ejército, César cruzó el Rubicón con sus tropas y desencadenó la guerra
        civil contra Pompeyo
        <a href={SOURCES[0].href} className="ml-0.5 align-super text-xs font-semibold text-accent hover:underline">[1]</a>.
        Fue en enero del 49 a.C.
        <a href={SOURCES[1].href} className="ml-0.5 align-super text-xs font-semibold text-accent hover:underline">[2]</a>.
      </p>

      <figcaption className="mt-8 border-t border-border pt-5">
        <ul className="space-y-2 text-sm">
          {SOURCES.map((source) => (
            <li key={source.number} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold text-accent">[{source.number}]</span>
              {/* <a> y no Link: así el navegador activa :target y el tema resalta el pasaje citado. */}
              <a href={source.href} className="hover:underline">
                <span className="font-medium">{source.section}</span>
                <span className="text-muted"> · {source.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </figcaption>
      <div className="mt-8">
        <Link
          href="/preguntar"
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          Hacer mi pregunta
        </Link>
      </div>
    </figure>
  );
}
