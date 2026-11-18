import type { Metadata } from "next";
import Link from "next/link";
import { TopicStatusBadge } from "@/components/admin/TopicStatusBadge";
import { EraBadge } from "@/components/EraBadge";
import { Eyebrow, PageHero } from "@/components/PageHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getContainer } from "@/composition/container";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { HERO_IMAGE } from "@/lib/eraImages";
import { ERA_LABELS } from "@/lib/eraLabels";
import { formatHistoricalPeriod } from "@/lib/formatHistoricalPeriod";
import { ERA_ROUTE_SLUGS } from "@/lib/routes";
import { adminPageMetadata, denyAdminPage } from "./adminPageAccess";

export function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("Panel de administración");
}

// La portada del panel: cada civilización con sus temas, borradores incluidos. El caso de uso comprueba
// el rol ADMIN por su cuenta.
export default async function AdminPage() {
  const container = getContainer();
  const [result, pending] = await Promise.all([
    container.listTopicsForAdmin.execute(),
    container.listPendingProposals.execute(),
  ]);
  if (!result.success) {
    denyAdminPage(result.error, "/admin");
  }
  const pendingCount = pending.success ? pending.data.length : 0;

  // Un aviso solo para los administradores: las páginas públicas nunca dicen «sin imagen», simplemente no la muestran.
  const withoutImage = result.data.flatMap(({ topics }) => topics).filter((topic) => !topic.image).length;

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <PageHero image={HERO_IMAGE}>
          <Eyebrow>Administración</Eyebrow>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight">Panel</h1>
            <Link
              href="/admin/temas/nuevo"
              className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              ＋ Nuevo tema
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            Los temas de cada civilización. Los borradores solo los ven los administradores.
          </p>
          <Link href="/admin/propuestas" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
            Propuestas de los usuarios
            <span className={pendingCount > 0 ? "rounded-full bg-accent px-2 py-0.5 text-xs text-background" : "text-muted"}>
              {pendingCount > 0 ? `${pendingCount} pendiente${pendingCount === 1 ? "" : "s"}` : "ninguna pendiente"}
            </span>
          </Link>
          {withoutImage > 0 && (
            <p className="mt-2 text-sm text-muted">
              {withoutImage} {withoutImage === 1 ? "tema sin imagen" : "temas sin imagen"}: puedes elegirla en su editor cuando la haya en el catálogo.
            </p>
          )}
        </PageHero>

        <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6">
          <div className="space-y-12">
            {result.data.map(({ era, topics }) => (
              <section key={era} aria-labelledby={`admin-${era}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 id={`admin-${era}`} className="font-serif text-3xl font-semibold tracking-tight">
                    {ERA_LABELS[era]}
                  </h2>
                  <EraBadge era={era} />
                  <span className="text-sm text-muted">
                    {topics.length} {topics.length === 1 ? "tema" : "temas"}
                  </span>
                  <div className="ml-auto flex flex-wrap gap-4">
                    <Link href={`/admin/cronologia/${ERA_ROUTE_SLUGS[era]}`} className="text-sm font-medium text-accent hover:underline">
                      Editar la cronología de {ERA_LABELS[era]}
                    </Link>
                    <Link href={`/admin/temas/nuevo?era=${era}`} className="text-sm font-medium text-accent hover:underline">
                      Añadir tema a {ERA_LABELS[era]}
                    </Link>
                  </div>
                </div>

                {topics.length > 0 ? (
                  <ul className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                    {topics.map((topic) => (
                      <li key={topic.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{topic.title}</p>
                            <TopicStatusBadge status={topic.status} />
                            {!topic.image && <span className="text-xs text-muted">Sin imagen</span>}
                          </div>
                          <p className="text-sm text-muted">
                            {CATEGORY_LABELS[topic.category]} · {formatHistoricalPeriod(topic.period)}
                          </p>
                        </div>
                        <Link
                          href={`/admin/temas/${topic.id}`}
                          className="text-sm font-medium text-accent hover:underline"
                          aria-label={`Editar ${topic.title}`}
                        >
                          Editar
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 rounded-2xl border border-dashed border-border p-5 text-sm text-muted">
                    Todavía no hay temas.
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
