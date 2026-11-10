import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProposalDetails } from "@/components/proposals/ProposalDetails";
import { ProposalForm } from "@/components/proposals/ProposalForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getContainer } from "@/composition/container";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import { SlugSchema } from "@/domain/value-objects/Slug";
import { submitProposal } from "./actions";

export const metadata: Metadata = { title: "Mis propuestas · MemnonHistory AI" };

// "Mis propuestas": propose an event, a recommendation, a correction or a new topic, and follow how
// each one was reviewed. ?tema=julio-cesar comes from a topic's "Proponer una mejora" link, and
// ?tipo=tema-nuevo from the "Proponer un tema nuevo" of a question without an answer.
export default async function MyProposalsPage({ searchParams }: PageProps<"/mi-biblioteca/propuestas">) {
  const { tema: rawTopic, tipo } = await searchParams;
  const tema = SlugSchema.safeParse(rawTopic);
  const proposesNewTopic = tipo === "tema-nuevo";
  const container = getContainer();
  const mine = await container.listMyProposals.execute();
  if (!mine.success) {
    const back = `/mi-biblioteca/propuestas${proposesNewTopic ? "?tipo=tema-nuevo" : tema.success ? `?tema=${tema.data}` : ""}`;
    redirect(`/iniciar-sesion?volver=${encodeURIComponent(back)}`);
  }

  // The topics a proposal can be about: the published ones.
  const topics = (await Promise.all(HISTORICAL_ERAS.map((era) => container.listTopicsByEra.execute(era)))).flatMap(
    (overview) => overview.categories.flatMap((group) => group.topics.map(({ slug, title, era }) => ({ slug, title, era }))),
  );
  const initialTopic = tema.success && topics.some((topic) => topic.slug === tema.data) ? tema.data : undefined;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
          <Link href="/mi-biblioteca" className="text-sm text-muted hover:text-foreground">
            ← Mi biblioteca
          </Link>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Mis propuestas</h1>
          <p className="mt-4 text-muted">
            Ayuda a completar la enciclopedia: propón un evento, una recomendación, una corrección o un tema nuevo. Un
            administrador lo revisa antes de publicarlo.
          </p>

          <section aria-labelledby="nueva-propuesta" className="mt-10 rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <h2 id="nueva-propuesta" className="mb-6 font-serif text-2xl font-semibold">
              Nueva propuesta
            </h2>
            <ProposalForm action={submitProposal} topics={topics} initialTopicSlug={initialTopic} initialKind={proposesNewTopic ? "NEW_TOPIC" : undefined} />
          </section>

          <section aria-labelledby="enviadas" className="mt-12">
            <h2 id="enviadas" className="font-serif text-2xl font-semibold">
              Enviadas
            </h2>
            {mine.data.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Todavía no has enviado ninguna propuesta.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {mine.data.map((proposal) => (
                  <li key={proposal.id} className="rounded-2xl border border-border p-5">
                    <ProposalDetails proposal={proposal} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
