import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { TimelineMilestoneRepository } from "@/application/ports/TimelineMilestoneRepository";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { compareHistoricalDates, type HistoricalDate } from "@/domain/value-objects/HistoricalDate";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { HistoricalPeriod } from "@/domain/value-objects/HistoricalPeriod";

// Lo justo para enlazar a un tema desde la cronología.
export type TimelineTopicLink = Pick<HistoricalTopic, "title" | "era" | "category" | "slug">;

// Las piezas de la cronología, en una sola lista ordenada por fecha:
// - PERIOD: el inicio de una etapa (un tema de la categoría Etapas), con su resumen, que abre una banda.
// - MILESTONE: un hito de la civilización, enlazado a su tema si está publicado.
// - EVENT: un evento de un tema, solo si se piden (el detalle, además de los hitos).
export type TimelineItem =
  | { kind: "PERIOD"; key: string; date: HistoricalDate; period: HistoricalPeriod; summary: string; topic: TimelineTopicLink }
  | { kind: "MILESTONE"; key: string; date: HistoricalDate; title: string; description: string; topic: TimelineTopicLink | null }
  | { kind: "EVENT"; key: string; eventId: string; date: HistoricalDate; title: string; description: string; topic: TimelineTopicLink };

export interface EraTimeline {
  era: HistoricalEra;
  items: TimelineItem[];
  milestoneCount: number;
  // Se cuentan aunque no se muestren, para ofrecer el interruptor solo cuando hay algo que añadir.
  topicEventCount: number;
}

export interface GetEraTimelineDependencies {
  milestones: TimelineMilestoneRepository;
  // La cara pública: solo se enlaza a temas publicados y solo se muestran sus eventos y sus etapas.
  topics: TopicRepository;
  events: HistoricalEventRepository;
}

// En una misma fecha, primero se abre la etapa, luego el hito y después el detalle de los temas.
const KIND_ORDER: Record<TimelineItem["kind"], number> = { PERIOD: 0, MILESTONE: 1, EVENT: 2 };

// La cronología completa de una civilización: sus hitos ordenados por fecha, con las etapas como bandas y,
// si se piden, los eventos de sus temas. Es pública y solo lee: no necesita sesión ni límite de peticiones.
export class GetEraTimelineUseCase {
  constructor(private readonly dependencies: GetEraTimelineDependencies) {}

  async execute({ era, includeTopicEvents = false }: { era: HistoricalEra; includeTopicEvents?: boolean }): Promise<EraTimeline> {
    const { milestones, topics, events } = this.dependencies;

    const [eraMilestones, eraTopics] = await Promise.all([milestones.listByEra(era), topics.listByEra(era)]);
    // Un hito puede enlazar a un tema de otra civilización; los ids que no son de temas publicados se omiten.
    const linkedTopics = await topics.findByIds([...new Set(eraMilestones.flatMap((milestone) => milestone.topicId ?? []))]);
    const topicEvents = (await Promise.all(eraTopics.map((topic) => events.listByTopic(topic.id)))).flat();

    const topicsById = new Map([...eraTopics, ...linkedTopics].map((topic) => [topic.id, topic]));
    const linkTo = (topicId: string | undefined): TimelineTopicLink | null => {
      const topic = topicId === undefined ? undefined : topicsById.get(topicId);
      return topic ? { title: topic.title, era: topic.era, category: topic.category, slug: topic.slug } : null;
    };

    const items: TimelineItem[] = [
      ...eraTopics
        .filter((topic) => topic.category === "PERIODS")
        .map((topic): TimelineItem => ({
          kind: "PERIOD",
          key: `period-${topic.id}`,
          date: topic.period.start,
          period: topic.period,
          summary: topic.summary,
          topic: linkTo(topic.id)!,
        })),
      ...eraMilestones.map((milestone): TimelineItem => ({
        kind: "MILESTONE",
        key: `milestone-${milestone.id}`,
        date: milestone.date,
        title: milestone.title,
        description: milestone.description,
        topic: linkTo(milestone.topicId),
      })),
      ...(includeTopicEvents ? topicEvents : []).map((event): TimelineItem => ({
        kind: "EVENT",
        key: `event-${event.id}`,
        eventId: event.id,
        date: event.date,
        title: event.title,
        description: event.description,
        topic: linkTo(event.topicId)!,
      })),
    ];

    return {
      era,
      items: items.toSorted(
        (a, b) => compareHistoricalDates(a.date, b.date) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.key.localeCompare(b.key),
      ),
      milestoneCount: eraMilestones.length,
      topicEventCount: topicEvents.length,
    };
  }
}
