import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";
import { HistoricalEraSchema } from "../value-objects/HistoricalEra";
import { compareHistoricalDates } from "../value-objects/HistoricalDate";
import { compareHistoricalPeriods, HistoricalPeriodSchema } from "../value-objects/HistoricalPeriod";
import { KeyFactSchema } from "../value-objects/KeyFact";
import { SlugSchema } from "../value-objects/Slug";
import { TopicCategorySchema } from "../value-objects/TopicCategory";
import { TopicImageSchema } from "../value-objects/TopicImage";
import { TopicStatusSchema } from "../value-objects/TopicStatus";

// La pieza central de la enciclopedia: un caso histórico (por ejemplo, "Julio César") dentro de una
// civilización y una categoría (personajes, batallas…). Cronología, quiz, comentarios y recomendaciones
// cuelgan de un tema, así que todas las páginas de tema comparten la misma estructura. La introducción es
// también el texto principal que indexa el RAG.
export const HistoricalTopicSchema = z
  .strictObject({
    id: EntityIdSchema,
    slug: SlugSchema,
    title: z.string().trim().min(1),
    era: HistoricalEraSchema,
    category: TopicCategorySchema,
    summary: z.string().trim().min(1),
    period: HistoricalPeriodSchema,
    // Puede estar vacía mientras el tema es un borrador; es obligatoria para publicar (ver más abajo).
    introduction: z.array(z.string().trim().min(1)),
    keyFacts: z.array(KeyFactSchema),
    image: TopicImageSchema.optional(),
    // Cada tema guarda sus enlaces en las dos direcciones (en PostgreSQL, una tabla intermedia).
    relatedTopicIds: z.array(EntityIdSchema),
    status: TopicStatusSchema,
  })
  // Lo que necesita un tema publicado para que su página esté completa. Un borrador se puede guardar a medias.
  .refine(({ status, introduction }) => status === "DRAFT" || introduction.length > 0, {
    message: "Escribe la introducción antes de publicar",
    path: ["introduction"],
  })
  .refine(({ status, keyFacts }) => status === "DRAFT" || keyFacts.length > 0, {
    message: "Añade al menos un dato clave antes de publicar",
    path: ["keyFacts"],
  })
  .refine(({ relatedTopicIds }) => new Set(relatedTopicIds).size === relatedTopicIds.length, {
    message: "Los temas relacionados no pueden repetirse",
    path: ["relatedTopicIds"],
  })
  .refine(({ id, relatedTopicIds }) => !relatedTopicIds.includes(id), {
    message: "Un tema no puede estar relacionado consigo mismo",
    path: ["relatedTopicIds"],
  });

export type HistoricalTopic = z.infer<typeof HistoricalTopicSchema>;

// La historia se lee en orden cronológico (Monarquía → República → Imperio, que el orden alfabético
// rompería). Si dos temas empiezan a la vez, va antes el que abarca más, para que una etapa salga delante
// de su subetapa (la República antes que su nacimiento). Los últimos empates se ordenan con la
// intercalación española, para que los títulos con tilde ("Ávila") queden donde los espera un lector.
export function compareTopicsChronologically(
  a: Pick<HistoricalTopic, "title" | "period">,
  b: Pick<HistoricalTopic, "title" | "period">,
): number {
  const endOf = (topic: Pick<HistoricalTopic, "period">) => topic.period.end ?? topic.period.start;
  return (
    compareHistoricalPeriods(a.period, b.period) ||
    compareHistoricalDates(endOf(b), endOf(a)) ||
    a.title.localeCompare(b.title, "es")
  );
}
