import type { GeneratedAnswer } from "@/domain/entities/EncyclopediaAnswer";

// Un fragmento encontrado para la pregunta, numerado para que el modelo pueda citarlo como [1], [2]…
export interface AnswerSource {
  number: number;
  topicTitle: string;
  section: string;
  content: string;
}

// Redacta la respuesta usando solo los fragmentos recibidos. Detrás está Ollama en desarrollo y una API
// gratuita una vez desplegado. Falla si el modelo no está disponible o no devuelve una respuesta válida.
export interface AnswerGenerator {
  answer(question: string, sources: AnswerSource[]): Promise<GeneratedAnswer>;
}
