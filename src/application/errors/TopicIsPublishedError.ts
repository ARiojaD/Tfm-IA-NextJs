// Solo se pueden borrar los borradores: un tema publicado tiene lectores (comentarios, bibliotecas), así
// que primero hay que despublicarlo. Dos pasos deliberados hacen mucho más difícil borrar uno por error.
export class TopicIsPublishedError extends Error {
  constructor() {
    super("Despublica el tema antes de borrarlo");
    this.name = "TopicIsPublishedError";
  }
}
