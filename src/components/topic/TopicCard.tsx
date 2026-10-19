import Link from "next/link";
import type { TopicDetail } from "@/application/use-cases/GetTopicDetailUseCase";
import { EraBadge } from "@/components/EraBadge";
import { topicPath } from "@/lib/eraRoutes";

export function TopicCard({ detail }: { detail: TopicDetail }) {
  const { topic, events, quiz, recommendations } = detail;
  const stats = [
    `${events.length} eventos`,
    `Quiz de ${quiz?.questions.length ?? 0} preguntas`,
    `${recommendations.length} recomendaciones`,
  ];

  return (
    <Link
      href={topicPath(topic)}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-foreground/30"
    >
      <div>
        <EraBadge era={topic.era} />
      </div>
      <h3 className="mt-4 font-serif text-2xl font-semibold">{topic.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{topic.summary}</p>
      <p className="mt-4 text-xs text-muted">{stats.join(" · ")}</p>
      <span className="mt-5 text-sm font-medium text-accent">
        Explorar el tema <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}

export function UpcomingTopicCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col rounded-2xl border border-dashed border-border p-6">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">Próximamente</span>
      <h3 className="mt-4 font-serif text-2xl font-semibold text-muted">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}
