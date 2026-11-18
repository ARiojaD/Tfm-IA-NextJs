import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EraBadge } from "@/components/EraBadge";
import { FollowEraButton } from "@/components/library/FollowEraButton";
import { SaveTopicButton } from "@/components/library/SaveTopicButton";
import { Eyebrow, PageHero } from "@/components/PageHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TopicCard } from "@/components/topic/TopicCard";
import { getContainer } from "@/composition/container";
import { HERO_IMAGE } from "@/lib/eraImages";
import { ERA_LABELS } from "@/lib/eraLabels";
import { eraPath } from "@/lib/routes";

export const metadata: Metadata = { title: "Mi biblioteca · MemnonHistory AI" };

const LIBRARY_PATH = "/mi-biblioteca";

// La biblioteca del usuario con sesión: las civilizaciones que sigue (con todos sus temas) y los temas que
// guardó. Sin sesión, a iniciar sesión y de vuelta aquí.
export default async function MyLibraryPage() {
  const container = getContainer();
  const [library, status] = await Promise.all([container.getMyLibrary.execute(), container.getLibraryStatus.execute()]);
  if (!library.success || !status) {
    redirect(`/iniciar-sesion?volver=${encodeURIComponent(LIBRARY_PATH)}`);
  }

  const { followedEras, savedTopics } = library.data;
  const isEmpty = followedEras.length === 0 && savedTopics.length === 0;

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <PageHero image={HERO_IMAGE}>
          <Eyebrow>Tu cuenta</Eyebrow>
          <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Mi biblioteca</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Las civilizaciones que sigues, con todos sus temas, y los temas que has guardado.
          </p>
          <Link href="/mi-biblioteca/propuestas" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
            Mis propuestas: ayuda a completar la enciclopedia →
          </Link>
        </PageHero>

        <div className="mx-auto max-w-6xl space-y-16 px-4 pb-20 pt-12 sm:px-6">
          {isEmpty && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              <p>Tu biblioteca está vacía.</p>
              <p className="mt-2">
                Sigue una civilización o guarda un tema con <span className="font-medium text-foreground">☆ Guardar</span>{" "}
                y aparecerá aquí.
              </p>
              <Link
                href="/#civilizaciones"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
              >
                Explorar civilizaciones
              </Link>
            </div>
          )}

          {followedEras.length > 0 && (
            <section aria-labelledby="civilizaciones-seguidas" className="space-y-10">
              <h2 id="civilizaciones-seguidas" className="font-serif text-3xl font-semibold tracking-tight">
                Civilizaciones que sigues
              </h2>
              {followedEras.map(({ era, topics }) => (
                <section key={era} aria-label={ERA_LABELS[era]} className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link href={eraPath(era)} className="flex items-center gap-3 hover:text-accent">
                      <EraBadge era={era} />
                      <span className="text-sm text-muted">
                        {topics.length} {topics.length === 1 ? "tema" : "temas"}
                      </span>
                    </Link>
                    <FollowEraButton era={era} status={status} />
                  </div>
                  {topics.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {topics.map((topic) => (
                        <TopicCard key={topic.id} topic={topic} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Muy pronto añadiremos sus primeros temas: aparecerán aquí solos.</p>
                  )}
                </section>
              ))}
            </section>
          )}

          {savedTopics.length > 0 && (
            <section aria-labelledby="temas-guardados" className="space-y-6">
              <h2 id="temas-guardados" className="font-serif text-3xl font-semibold tracking-tight">
                Temas guardados
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedTopics.map((topic) => (
                  <li key={topic.id} className="flex flex-col gap-3">
                    <TopicCard topic={topic} />
                    <SaveTopicButton topic={topic} status={status} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
