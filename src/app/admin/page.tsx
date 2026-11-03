import type { Metadata } from "next";
import Link from "next/link";
import { EraBadge } from "@/components/EraBadge";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getContainer } from "@/composition/container";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { ERA_LABELS } from "@/lib/eraLabels";
import { formatHistoricalPeriod } from "@/lib/formatHistoricalPeriod";
import { topicPath } from "@/lib/routes";
import { denyAdminPage } from "./adminPageAccess";

// The title also depends on access: a static one would show "Panel de administración" in the tab of the
// 404 that non-admins get, revealing that the panel exists.
export async function generateMetadata(): Promise<Metadata> {
  const access = await getContainer().getAdminAccess.execute();

  return {
    title: access.success ? "Panel de administración · MemnonHistory AI" : "Página no encontrada · MemnonHistory AI",
    robots: { index: false, follow: false },
  };
}

// The admin panel's home: every civilization with its topics. The use case checks the ADMIN role itself.
export default async function AdminPage() {
  const result = await getContainer().listTopicsForAdmin.execute();
  if (!result.success) {
    denyAdminPage(result.error, "/admin");
  }

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Administración</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold leading-[1.05] tracking-tight">Panel</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">Los temas de cada civilización.</p>

          <div className="mt-12 space-y-12">
            {result.data.map(({ era, topics }) => (
              <section key={era} aria-labelledby={`admin-${era}`}>
                <div className="flex items-center gap-3">
                  <h2 id={`admin-${era}`} className="font-serif text-3xl font-semibold tracking-tight">
                    {ERA_LABELS[era]}
                  </h2>
                  <EraBadge era={era} />
                  <span className="text-sm text-muted">
                    {topics.length} {topics.length === 1 ? "tema" : "temas"}
                  </span>
                </div>

                {topics.length > 0 ? (
                  <ul className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                    {topics.map((topic) => (
                      <li key={topic.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div>
                          <p className="font-medium">{topic.title}</p>
                          <p className="text-sm text-muted">
                            {CATEGORY_LABELS[topic.category]} · {formatHistoricalPeriod(topic.period)}
                          </p>
                        </div>
                        <Link href={topicPath(topic)} className="text-sm font-medium text-accent hover:underline">
                          Ver en la web
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
