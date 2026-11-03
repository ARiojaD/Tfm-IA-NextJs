import Link from "next/link";
import type { ReactNode } from "react";
import type { TopicDetail } from "@/application/use-cases/GetTopicDetailUseCase";
import { EraBadge } from "@/components/EraBadge";
import { SectionHeading } from "@/components/SectionHeading";
import { Timeline } from "@/components/Timeline";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { ERA_LABELS } from "@/lib/eraLabels";
import { formatHistoricalPeriod } from "@/lib/formatHistoricalPeriod";
import { categoryPath, eraPath } from "@/lib/routes";
import { CommentList } from "./CommentList";
import { RecommendationList } from "./RecommendationList";
import { TopicCard } from "./TopicCard";
import { TopicIntroduction } from "./TopicIntroduction";

// The page of a topic, the same for every topic and for the admin preview: only the data and the
// interactive parts change. The public page passes the save button, the playable quiz and the comment
// form; the preview passes placeholders, so a draft looks exactly as it will once published.
export function TopicView({
  detail,
  notice,
  actions,
  quiz,
  commentForm,
}: {
  detail: TopicDetail;
  notice?: ReactNode;
  actions?: ReactNode;
  quiz: ReactNode;
  commentForm: ReactNode;
}) {
  const { topic, events, comments, recommendations, relatedTopics } = detail;
  // The introduction sits right below the header, so it needs no shortcut.
  const sections = [
    { id: "cronologia", label: "Cronología", count: events.length },
    { id: "quiz", label: "Quiz", count: detail.quiz?.questions.length ?? 0 },
    { id: "comunidad", label: "Comunidad", count: comments.length },
    { id: "recomendaciones", label: "Recomendaciones", count: recommendations.length },
    ...(relatedTopics.length > 0 ? [{ id: "relacionados", label: "Relacionados", count: relatedTopics.length }] : []),
  ];

  return (
    <main className="flex-1">
      {notice}

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
          {actions && <div className="mt-6">{actions}</div>}

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
          {quiz}
        </div>
      </section>

      <section id="comunidad" className="scroll-mt-8 border-y border-border bg-surface/50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading eyebrow="Comunidad" title="La conversación" />
          <div className="space-y-8">
            {commentForm}
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
  );
}
