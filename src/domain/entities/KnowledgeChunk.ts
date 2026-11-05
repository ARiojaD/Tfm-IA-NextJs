import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";
import { compareHistoricalDates, formatHistoricalDate } from "../value-objects/HistoricalDate";
import type { HistoricalEvent } from "./HistoricalEvent";
import type { HistoricalTopic } from "./HistoricalTopic";

// A piece of a published topic that the RAG can find and cite: a paragraph of the introduction, a key
// fact or an event of the timeline. Only content written and reviewed by an admin is indexed; comments
// and recommendations are not (unverified text in the prompt is the door to prompt injection, LLM01).
export const KNOWLEDGE_SOURCES = ["INTRODUCTION", "KEY_FACT", "EVENT"] as const;

export const KnowledgeSourceSchema = z.enum(KNOWLEDGE_SOURCES);

export type KnowledgeSource = z.infer<typeof KnowledgeSourceSchema>;

export const KnowledgeChunkSchema = z
  .strictObject({
    topicId: EntityIdSchema,
    source: KnowledgeSourceSchema,
    // Order within its source, so a citation can point to the right paragraph.
    position: z.number().int().nonnegative(),
    // Events are linked by id: their order changes when the timeline is edited.
    eventId: EntityIdSchema.optional(),
    // The text as shown in a citation: it reads on its own ("Nacimiento: 12 de julio del 100 a.C.").
    content: z.string().trim().min(1),
  })
  .refine((chunk) => (chunk.source === "EVENT") === (chunk.eventId !== undefined), {
    message: "Solo los fragmentos de la cronología llevan el id de su evento, y todos lo llevan",
    path: ["eventId"],
  });

export type KnowledgeChunk = z.infer<typeof KnowledgeChunkSchema>;

const SOURCE_NAMES: Record<KnowledgeSource, string> = {
  INTRODUCTION: "Introducción",
  KEY_FACT: "Dato clave",
  EVENT: "Cronología",
};

// The fragments of a topic, in the order the page shows them: introduction, key facts, timeline.
export function buildTopicChunks(topic: HistoricalTopic, events: HistoricalEvent[]): KnowledgeChunk[] {
  const topicId = topic.id;
  const timeline = events
    .filter((event) => event.topicId === topicId)
    .sort((a, b) => compareHistoricalDates(a.date, b.date));

  return [
    ...topic.introduction.map((paragraph, position) => ({
      topicId,
      source: "INTRODUCTION" as const,
      position,
      content: paragraph,
    })),
    ...topic.keyFacts.map((fact, position) => ({
      topicId,
      source: "KEY_FACT" as const,
      position,
      content: `${fact.label}: ${fact.value}`,
    })),
    ...timeline.map((event, position) => ({
      topicId,
      source: "EVENT" as const,
      position,
      eventId: event.id,
      content: `${formatHistoricalDate(event.date)} — ${event.title}. ${event.description}`,
    })),
  ];
}

// What is turned into a vector: the fragment with its topic's title and summary in front. A paragraph
// rarely repeats the topic's name, and without it a question about "Julio César" would miss it.
export function chunkEmbeddingText(topic: Pick<HistoricalTopic, "title" | "summary">, chunk: KnowledgeChunk): string {
  return `${topic.title}. ${topic.summary}\n${SOURCE_NAMES[chunk.source]}: ${chunk.content}`;
}
