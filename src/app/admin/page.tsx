import type { Metadata } from "next";
import Link from "next/link";
import { TopicStatusBadge } from "@/components/admin/TopicStatusBadge";
import { EraBadge } from "@/components/EraBadge";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getContainer } from "@/composition/container";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { ERA_LABELS } from "@/lib/eraLabels";
import { formatHistoricalPeriod } from "@/lib/formatHistoricalPeriod";
import { adminPageMetadata, denyAdminPage } from "./adminPageAccess";

export function generateMetadata(): Promise<Metadata> {
  return adminPageMetadata("Panel de administración");
}

// The admin panel's home: every civilization with its topics, drafts included. The use case checks the
// ADMIN role itself.
export default async function AdminPage() {
  const result = await getContainer().listTopicsForAdmin.execute();
  if (!result.success) {
    denyAdminPage(result.error, "/admin");
  }

  // A reminder for the admins only: the public pages never say "no image", they just show none.
  const withoutImage = result.data.flatMap(({ topics }) => topics).filter((topic) => !topic.image).length;

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Administración</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
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
          {withoutImage > 0 && (
            <p className="mt-2 text-sm text-muted">
              {withoutImage} {withoutImage === 1 ? "tema sin imagen" : "temas sin imagen"}: puedes elegirla en su editor cuando la haya en el catálogo.
            </p>
          )}

          <div className="mt-12 space-y-12">
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
                  <Link href={`/admin/temas/nuevo?era=${era}`} className="ml-auto text-sm font-medium text-accent hover:underline">
                    Añadir tema a {ERA_LABELS[era]}
                  </Link>
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
