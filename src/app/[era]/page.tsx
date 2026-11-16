import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EraBadge } from "@/components/EraBadge";
import { Breadcrumbs, PageHero } from "@/components/PageHero";
import { FollowEraButton } from "@/components/library/FollowEraButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TopicCard } from "@/components/topic/TopicCard";
import { getContainer } from "@/composition/container";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { ERA_IMAGES } from "@/lib/eraImages";
import { ERA_DESCRIPTIONS, ERA_LABELS } from "@/lib/eraLabels";
import { CATEGORY_ROUTE_SLUGS, eraFromRouteSlug, eraTimelinePath } from "@/lib/routes";

// Una sola plantilla para todas las civilizaciones (/roma, /grecia, /hispania): la cabecera con su imagen
// y sus temas agrupados por categoría.

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

  const container = getContainer();
  const [overview, libraryStatus] = await Promise.all([
    container.listTopicsByEra.execute(era),
    container.getLibraryStatus.execute(),
  ]);

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <PageHero image={ERA_IMAGES[era].src}>
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: ERA_LABELS[era] }]} />

          <EraBadge era={era} />
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {ERA_LABELS[era]}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{ERA_DESCRIPTIONS[era]}</p>
          <div className="mt-6">
            <FollowEraButton era={era} status={libraryStatus} />
          </div>

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
              {/* La cronología es una página propia, no una sección: resume toda la civilización. */}
              <li>
                <Link
                  href={eraTimelinePath(era)}
                  className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent-soft px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-background"
                >
                  Cronología completa <span aria-hidden="true">→</span>
                </Link>
              </li>
            </ul>
          </nav>
        </PageHero>

        <div className="mx-auto max-w-6xl space-y-16 px-4 pb-20 pt-14 sm:px-6">
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
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
