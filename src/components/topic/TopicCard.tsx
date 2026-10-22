import Link from "next/link";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { topicPath } from "@/lib/routes";

export function TopicCard({ topic }: { topic: HistoricalTopic }) {
  return (
    <Link
      href={topicPath(topic)}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-foreground/30"
    >
      <h3 className="font-serif text-2xl font-semibold">{topic.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{topic.summary}</p>
      <span className="mt-5 text-sm font-medium text-accent">
        Explorar <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
