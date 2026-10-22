import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EraBadge } from "@/components/EraBadge";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TopicCard } from "@/components/topic/TopicCard";
import { getContainer } from "@/composition/container";
import { TOPIC_CATEGORIES } from "@/domain/value-objects/TopicCategory";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { ERA_DESCRIPTIONS, ERA_LABELS } from "@/lib/eraLabels";
import { CATEGORY_ROUTE_SLUGS, eraFromRouteSlug } from "@/lib/routes";

// One template for every civilization (/roma, /grecia, /hispania): its topics grouped by category.

export async function generateMetadata({ params }: PageProps<"/[era]">): Promise<Metadata> {
  const era = eraFromRouteSlug((await params).era);

  return era
    ? { title: `${ERA_LABELS[era]} · MemnonHistory AI`, description: ERA_DESCRIPTIONS[era] }
    : { title: "Civilización no encontrada · MemnonHistory AI" };
}

export default async function EraPage({ params }: PageProps<"/[era]">) {
  const era = eraFromRouteSlug((await params).era);
  if (!era) {
    notFound();
  }

  const overview = await getContainer().listTopicsByEra.execute(era);
  const upcomingCategories = TOPIC_CATEGORIES.filter(
    (category) => !overview.categories.some((group) => group.category === category),
  );

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative isolate">
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-gradient-to-r from-dawn-from to-dawn-to opacity-50 blur-3xl"
            aria-hidden="true"
          />
          <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pt-16">
            <nav aria-label="Ruta de navegación" className="mb-8 text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-foreground">Inicio</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-foreground">{ERA_LABELS[era]}</li>
              </ol>
            </nav>

            <EraBadge era={era} />
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {ERA_LABELS[era]}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{ERA_DESCRIPTIONS[era]}</p>

            {overview.categories.length > 0 && (
              <nav aria-label="Categorías" className="mt-10">
                <ul className="flex flex-wrap gap-2">
                  {overview.categories.map((group) => (
                    <li key={group.category}>
                      <a
                        href={`#${CATEGORY_ROUTE_SLUGS[group.category]}`}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/30"
                      >
                        {CATEGORY_LABELS[group.category]}
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                          {group.topics.length}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-16 px-4 pb-20 sm:px-6">
          {overview.totalTopics === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              Muy pronto añadiremos los primeros temas de {ERA_LABELS[era]}.
            </p>
          )}

          {overview.categories.map((group) => (
            <section key={group.category} id={CATEGORY_ROUTE_SLUGS[group.category]} className="scroll-mt-8">
              <h2 className="mb-6 font-serif text-3xl font-semibold tracking-tight">{CATEGORY_LABELS[group.category]}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.topics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </section>
          ))}

          {overview.totalTopics > 0 && upcomingCategories.length > 0 && (
            <p className="text-sm text-muted">
              Próximamente: {upcomingCategories.map((category) => CATEGORY_LABELS[category]).join(" · ")}
            </p>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
