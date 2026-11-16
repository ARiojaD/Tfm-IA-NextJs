import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { EraBadge } from "@/components/EraBadge";
import { Breadcrumbs, PageHero } from "@/components/PageHero";
import { EraTimelineView } from "@/components/era/EraTimelineView";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getContainer } from "@/composition/container";
import { ERA_IMAGES } from "@/lib/eraImages";
import { ERA_LABELS } from "@/lib/eraLabels";
import { eraFromRouteSlug, eraPath, eraTimelinePath, TIMELINE_EVENTS_PARAM } from "@/lib/routes";

// La cronología completa de una civilización (/roma/cronologia): sus hitos, con las etapas como bandas, y
// los eventos de sus temas solo si se piden en la URL (?eventos=todos).

export async function generateMetadata({ params }: PageProps<"/[era]/cronologia">): Promise<Metadata> {
  const era = eraFromRouteSlug((await params).era);

  return era
    ? {
        title: `Cronología de ${ERA_LABELS[era]} · MemnonHistory AI`,
        description: `Los momentos clave de ${ERA_LABELS[era]} en orden, enlazados a sus temas.`,
      }
    : { title: "Civilización no encontrada · MemnonHistory AI" };
}

export default async function EraTimelinePage({ params, searchParams }: PageProps<"/[era]/cronologia">) {
  const era = eraFromRouteSlug((await params).era);
  if (!era) {
    notFound();
  }
  // Cualquier otro valor del parámetro vale como "solo los hitos": la URL no es de fiar.
  const includeTopicEvents = (await searchParams)[TIMELINE_EVENTS_PARAM.name] === TIMELINE_EVENTS_PARAM.value;

  const timeline = await getContainer().getEraTimeline.execute({ era, includeTopicEvents });
  const isEmpty = timeline.milestoneCount === 0 && !timeline.items.some((item) => item.kind === "PERIOD");

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <PageHero image={ERA_IMAGES[era].src} width="max-w-5xl">
          <Breadcrumbs
          items={[{ label: "Inicio", href: "/" }, { label: ERA_LABELS[era], href: eraPath(era) }, { label: "Cronología completa" }]}
          />

          <EraBadge era={era} />
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Cronología de {ERA_LABELS[era]}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Los momentos clave en orden, de un vistazo. Cada hito lleva a su tema, y los que aún no tienen tema se
            pueden proponer.
          </p>

          {timeline.topicEventCount > 0 && (
            <nav aria-label="Qué mostrar" className="mt-8">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <ViewOption href={eraTimelinePath(era)} current={!includeTopicEvents}>
                    Solo los hitos
                  </ViewOption>
                </li>
                <li>
                  <ViewOption href={eraTimelinePath(era, { withTopicEvents: true })} current={includeTopicEvents}>
                    Con los eventos de los temas
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                      {timeline.topicEventCount}
                    </span>
                  </ViewOption>
                </li>
              </ul>
            </nav>
          )}
        </PageHero>

        <div className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-6">
          {isEmpty ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              Muy pronto añadiremos la cronología de {ERA_LABELS[era]}.
            </p>
          ) : (
            <EraTimelineView items={timeline.items} />
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function ViewOption({ href, current, children }: { href: string; current: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        current ? "border-accent bg-accent-soft text-accent" : "border-border bg-surface hover:border-foreground/30"
      }`}
    >
      {children}
    </Link>
  );
}
