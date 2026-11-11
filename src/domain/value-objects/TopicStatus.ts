import { z } from "zod";

// Un tema nace como borrador (DRAFT: invisible para el público y puede estar incompleto) y un administrador
// lo publica (PUBLISHED) cuando está listo. Despublicarlo lo devuelve a borrador: desaparece de la web pero
// conserva sus datos.
export const TOPIC_STATUSES = ["DRAFT", "PUBLISHED"] as const;

export const TopicStatusSchema = z.enum(TOPIC_STATUSES);

export type TopicStatus = z.infer<typeof TopicStatusSchema>;
