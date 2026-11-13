import Link from "next/link";
import type { TimelineItem } from "@/application/use-cases/GetEraTimelineUseCase";
import { CivilizationCard } from "@/components/era/CivilizationCard";
import { Greca } from "@/components/Greca";
import { AntiquityTimeline, type AntiquityRow } from "@/components/home/AntiquityTimeline";
import { AskExample } from "@/components/home/AskExample";
import { HomeHero } from "@/components/home/HomeHero";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getContainer } from "@/composition/container";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { timelineDomain } from "@/lib/antiquityScale";
import { eraTimelinePath, topicPath } from "@/lib/routes";

// Se pinta en cada petición: las cifras, las tarjetas y la Línea de la Antigüedad salen de PostgreSQL, así
// que no pueden quedarse congeladas al compilar (y `next build` no debe necesitar la base de datos).
export const dynamic = "force-dynamic";

// El orden de la portada: Roma primero, que es la que más contenido tiene; en la línea del tiempo, de
// la más antigua a la más reciente.
const CIVILIZATIONS: HistoricalEra[] = ["ROMAN", "ANCIENT_GREECE", "HISPANIA"];
const TIMELINE_ORDER: HistoricalEra[] = ["ANCIENT_GREECE", "ROMAN", "HISPANIA"];

// La portada: la cabecera con la caja de pregunta, las civilizaciones, la Línea de la Antigüedad con los
// hitos reales, un ejemplo de consulta y una invitación a proponer lo que falta.
export default async function Home() {
  const { listTopicsByEra, getEraTimeline } = getContainer();
  const [overviews, timelines] = await Promise.all([
    Promise.all(CIVILIZATIONS.map((era) => listTopicsByEra.execute(era))),
    Promise.all(TIMELINE_ORDER.map((era) => getEraTimeline.execute({ era }))),
  ]);

  const rows = timelines.map(({ era, items }) => toAntiquityRow(era, items));
  const years = rows.flatMap((row) => [
    ...row.milestones.map((milestone) => milestone.year),
    ...row.periods.flatMap((period) => [period.start, period.end]),
  ]);
  const milestones = timelines.flatMap(({ items }) => items.filter((item) => item.kind === "MILESTONE"));
  const withoutTopic = milestones.filter((item) => item.kind === "MILESTONE" && item.topic === null).length;

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <HomeHero
          stats={{
            topics: overviews.reduce((total, overview) => total + overview.totalTopics, 0),
            milestones: milestones.length,
            civilizations: CIVILIZATIONS.length,
          }}
        />

        <section id="civilizaciones" className="scroll-mt-8 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Civilizaciones"
              title="¿A qué mundo antiguo viajas hoy?"
              text="Cada civilización reúne sus personajes, sus guerras y batallas y sus etapas, y su cronología completa con los momentos clave en orden."
            />
            <div className="grid gap-5 md:grid-cols-3">
              {overviews.map((overview) => (
                <CivilizationCard key={overview.era} era={overview.era} totalTopics={overview.totalTopics} />
              ))}
            </div>
          </div>
        </section>

        <section id="cronologia" className="scroll-mt-8 border-y border-border bg-surface/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Cronología"
              title="La Antigüedad de un vistazo"
              text="Las tres civilizaciones en una misma línea del tiempo, con sus etapas y sus hitos. Pasa por encima de un punto para ver qué ocurrió, y entra en la cronología completa de cada una."
            />
            <AntiquityTimeline rows={rows} domain={timelineDomain(years)} />
          </div>
        </section>

        <section id="consulta" className="scroll-mt-8 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Consulta"
              title="Pregunta a la enciclopedia"
              text="La respuesta sale solo del contenido revisado de la web, y cada dato enlaza al pasaje exacto donde se cuenta."
            />
            <AskExample />
          </div>
        </section>

        <Greca className="text-accent/30" />
        <section className="py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-5 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-serif text-3xl font-semibold">¿Echas algo en falta?</h2>
              <p className="mt-2 max-w-xl text-muted">
                {withoutTopic > 0
                  ? `${withoutTopic} hitos de la cronología todavía no tienen tema. Propón uno con su fuente y un administrador lo revisará.`
                  : "Propón un tema nuevo con su fuente y un administrador lo revisará."}
              </p>
            </div>
            <Link
              href="/mi-biblioteca/propuestas?tipo=tema-nuevo"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-medium transition-colors hover:border-foreground/30"
            >
              Proponer un tema
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

// De la cronología de una civilización a su franja en la Línea de la Antigüedad: las etapas grandes (las
// subetapas no caben a esta escala) y los hitos, cada uno enlazado a su tema o a la cronología completa.
function toAntiquityRow(era: HistoricalEra, items: TimelineItem[]): AntiquityRow {
  return {
    era,
    periods: items.flatMap((item) =>
      item.kind === "PERIOD" && !item.nested
        ? [
            {
              key: item.key,
              title: item.topic.title,
              start: item.period.start.year,
              end: (item.period.end ?? item.period.start).year,
              href: topicPath(item.topic),
            },
          ]
        : [],
    ),
    milestones: items.flatMap((item) =>
      item.kind === "MILESTONE"
        ? [{ key: item.key, title: item.title, year: item.date.year, href: item.topic ? topicPath(item.topic) : eraTimelinePath(era) }]
        : [],
    ),
  };
}
