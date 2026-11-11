import type { GeneratedEvents, GeneratedQuiz } from "@/domain/entities/TopicDrafts";

// Lo único que recibe el modelo de un tema: su título y el texto que escribió el administrador.
export interface TopicSource {
  title: string;
  text: string;
}

// Propone una cronología o un quiz a partir del texto de un tema, y nada más. Falla si el modelo no está
// disponible o no devuelve un resultado válido.
export interface ContentDrafter {
  draftEvents(source: TopicSource): Promise<GeneratedEvents>;
  draftQuiz(source: TopicSource): Promise<GeneratedQuiz>;
}
