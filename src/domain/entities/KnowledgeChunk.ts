import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";
import { compareHistoricalDates, formatHistoricalDate } from "../value-objects/HistoricalDate";
import type { HistoricalEvent } from "./HistoricalEvent";
import type { HistoricalTopic } from "./HistoricalTopic";

// Un trozo de un tema publicado que el RAG puede encontrar y citar: un párrafo de la introducción, un dato
// clave o un evento de la cronología. Solo se indexa contenido escrito y revisado por un administrador;
// los comentarios y las recomendaciones no (un texto sin verificar en el prompt es la puerta a la
// inyección de prompts, OWASP LLM01).
export const KNOWLEDGE_SOURCES = ["INTRODUCTION", "KEY_FACT", "EVENT"] as const;

export const KnowledgeSourceSchema = z.enum(KNOWLEDGE_SOURCES);

export type KnowledgeSource = z.infer<typeof KnowledgeSourceSchema>;

export const KnowledgeChunkSchema = z
  .strictObject({
    topicId: EntityIdSchema,
    source: KnowledgeSourceSchema,
    // Posición dentro de su origen, para que una cita apunte al párrafo correcto.
    position: z.number().int().nonnegative(),
    // Los eventos se enlazan por id: su posición cambia cuando se edita la cronología.
    eventId: EntityIdSchema.optional(),
    // El texto tal como aparece en una cita: se entiende solo ("Nacimiento: 12 de julio del 100 a.C.").
    content: z.string().trim().min(1),
  })
  .refine((chunk) => (chunk.source === "EVENT") === (chunk.eventId !== undefined), {
    message: "Solo los fragmentos de la cronología llevan el id de su evento, y todos lo llevan",
    path: ["eventId"],
  });

export type KnowledgeChunk = z.infer<typeof KnowledgeChunkSchema>;

// Cómo se llama cada origen en las citas y en el texto que se convierte en vector.
export const KNOWLEDGE_SOURCE_NAMES: Record<KnowledgeSource, string> = {
  INTRODUCTION: "Introducción",
  KEY_FACT: "Dato clave",
  EVENT: "Cronología",
};

// Los fragmentos de un tema, en el orden en que los muestra la página: introducción, datos clave y
// cronología.
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

// Lo que se convierte en vector: el fragmento con el título y el resumen de su tema delante. Un párrafo
// rara vez repite el nombre del tema, y sin él una pregunta sobre "Julio César" no lo encontraría.
export function chunkEmbeddingText(topic: Pick<HistoricalTopic, "title" | "summary">, chunk: KnowledgeChunk): string {
  return `${topic.title}. ${topic.summary}\n${KNOWLEDGE_SOURCE_NAMES[chunk.source]}: ${chunk.content}`;
}
