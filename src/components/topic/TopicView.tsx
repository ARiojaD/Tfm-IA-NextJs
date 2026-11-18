import type { ReactNode } from "react";
import type { TopicDetail } from "@/application/use-cases/GetTopicDetailUseCase";
import { EraBadge } from "@/components/EraBadge";
import { Breadcrumbs, PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Timeline } from "@/components/Timeline";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { ERA_IMAGES } from "@/lib/eraImages";
import { ERA_LABELS } from "@/lib/eraLabels";
import { formatHistoricalPeriod } from "@/lib/formatHistoricalPeriod";
import { categoryPath, eraPath } from "@/lib/routes";
import { CommentList } from "./CommentList";
import { RecommendationList } from "./RecommendationList";
import { TopicCard } from "./TopicCard";
import { TopicIntroduction } from "./TopicIntroduction";

// La página de un tema, igual para todos los temas y para la vista previa del panel: solo cambian los datos
// y las partes interactivas. La página pública pasa el botón de guardar, el quiz jugable y el formulario de
// comentarios; la vista previa pasa marcadores, así que un borrador se ve tal como quedará al publicarse.
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
  // La introducción va justo debajo de la cabecera, así que no necesita atajo.
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

      {/* La cabecera lleva de fondo la imagen del tema (o la de su civilización, si no tiene). Con un aviso
          encima (la vista previa del panel), no sube por detrás de la barra de navegación. */}
      <PageHero image={topic.image?.src ?? ERA_IMAGES[topic.era].src} width="max-w-4xl" underHeader={!notice}>
        <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: ERA_LABELS[topic.era], href: eraPath(topic.era) },
          { label: CATEGORY_LABELS[topic.category], href: categoryPath(topic.era, topic.category) },
          { label: topic.title },
        ]}
        />

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
      </PageHero>

      <section id="introduccion" className="scroll-mt-8 pb-16 pt-12">
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
