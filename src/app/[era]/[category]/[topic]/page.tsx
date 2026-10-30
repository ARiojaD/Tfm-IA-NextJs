import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { EraBadge } from "@/components/EraBadge";
import { SaveTopicButton } from "@/components/library/SaveTopicButton";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Timeline } from "@/components/Timeline";
import { CommentForm } from "@/components/topic/CommentForm";
import { SignInToComment } from "@/components/topic/SignInToComment";
import { CommentList } from "@/components/topic/CommentList";
import { QuizGame } from "@/components/topic/QuizGame";
import { RecommendationList } from "@/components/topic/RecommendationList";
import { TopicCard } from "@/components/topic/TopicCard";
import { TopicIntroduction } from "@/components/topic/TopicIntroduction";
import { getContainer } from "@/composition/container";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { ERA_LABELS } from "@/lib/eraLabels";
import { formatHistoricalPeriod } from "@/lib/formatHistoricalPeriod";
import { categoryFromRouteSlug, categoryPath, eraFromRouteSlug, eraPath, topicPath } from "@/lib/routes";
import { addComment, answerQuizQuestion } from "./actions";

// One template for every topic (/roma/personajes/julio-cesar, /grecia/guerras-y-batallas/…): only the data changes.

// cache() dedupes the lookup between generateMetadata and the page within one request.
const getTopicDetail = cache((topicSlug: string) => getContainer().getTopicDetail.execute(topicSlug));

// The topic must exist and match the era and category in the URL:
// /grecia/personajes/julio-cesar and /roma/guerras-y-batallas/julio-cesar are 404s.
async function loadTopic(params: PageProps<"/[era]/[category]/[topic]">["params"]) {
  const { era, category, topic } = await params;
  const result = await getTopicDetail(topic);

  if (
    !result.success ||
    eraFromRouteSlug(era) !== result.data.topic.era ||
    categoryFromRouteSlug(category) !== result.data.topic.category
  ) {
    return null;
  }
  return result.data;
}

export async function generateMetadata({ params }: PageProps<"/[era]/[category]/[topic]">): Promise<Metadata> {
  const detail = await loadTopic(params);

  return detail
    ? { title: `${detail.topic.title} · MemnonHistory AI`, description: detail.topic.summary }
    : { title: "Tema no encontrado · MemnonHistory AI" };
}

export default async function TopicPage({ params }: PageProps<"/[era]/[category]/[topic]">) {
  const detail = await loadTopic(params);
  if (!detail) {
    notFound();
  }

  const { topic, events, quiz, comments, recommendations, relatedTopics } = detail;
  const container = getContainer();
  const [currentUser, libraryStatus] = await Promise.all([
    container.getCurrentUser.execute(),
    container.getLibraryStatus.execute(),
  ]);
  // The introduction sits right below the header, so it needs no shortcut.
  const sections = [
    { id: "cronologia", label: "Cronología", count: events.length },
    { id: "quiz", label: "Quiz", count: quiz?.questions.length ?? 0 },
    { id: "comunidad", label: "Comunidad", count: comments.length },
    { id: "recomendaciones", label: "Recomendaciones", count: recommendations.length },
    ...(relatedTopics.length > 0 ? [{ id: "relacionados", label: "Relacionados", count: relatedTopics.length }] : []),
  ];

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative isolate">
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-gradient-to-r from-dawn-from to-dawn-to opacity-50 blur-3xl"
            aria-hidden="true"
          />
          <div className="mx-auto max-w-4xl px-4 pb-14 pt-10 sm:px-6 sm:pt-16">
            <nav aria-label="Ruta de navegación" className="mb-8 text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-foreground">Inicio</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={eraPath(topic.era)} className="hover:text-foreground">{ERA_LABELS[topic.era]}</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={categoryPath(topic.era, topic.category)} className="hover:text-foreground">
                    {CATEGORY_LABELS[topic.category]}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-foreground">{topic.title}</li>
              </ol>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <EraBadge era={topic.era} />
              <span className="text-sm font-medium text-muted">{formatHistoricalPeriod(topic.period)}</span>
            </div>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {topic.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{topic.summary}</p>
            <div className="mt-6">
              <SaveTopicButton topic={topic} status={libraryStatus} />
            </div>

            <nav aria-label="Secciones del tema" className="mt-10">
              <ul className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/30"
                    >
                      {section.label}
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">{section.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        <section id="introduccion" className="scroll-mt-8 pb-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <TopicIntroduction topic={topic} />
          </div>
        </section>

        <section id="cronologia" className="scroll-mt-8 border-y border-border bg-surface/50 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionHeading eyebrow="Cronología" title="Los momentos clave" />
            <Timeline events={events} />
          </div>
        </section>

        <section id="quiz" className="scroll-mt-8 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionHeading eyebrow="Quiz" title="¿Cuánto sabes?" />
            {quiz ? (
              <QuizGame quiz={quiz} topicSlug={topic.slug} answerQuestion={answerQuizQuestion} />
            ) : (
              <p className="text-muted">Este tema todavía no tiene quiz.</p>
            )}
          </div>
        </section>

        <section id="comunidad" className="scroll-mt-8 border-y border-border bg-surface/50 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionHeading eyebrow="Comunidad" title="La conversación" />
            <div className="space-y-8">
              {currentUser ? (
                <CommentForm topicSlug={topic.slug} authorName={currentUser.name} action={addComment} />
              ) : (
                <SignInToComment returnTo={topicPath(topic)} />
              )}
              <CommentList comments={comments} />
            </div>
          </div>
        </section>

        <section id="recomendaciones" className="scroll-mt-8 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionHeading eyebrow="Recomendaciones" title="Para seguir aprendiendo" />
            <RecommendationList recommendations={recommendations} />
          </div>
        </section>

        {relatedTopics.length > 0 && (
          <section id="relacionados" className="scroll-mt-8 border-t border-border bg-surface/50 py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <SectionHeading eyebrow="Relacionados" title="Sigue explorando" />
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedTopics.map((related) => (
                  <TopicCard key={related.id} topic={related} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
