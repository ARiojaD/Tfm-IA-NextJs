// Se ha agotado el tope diario de llamadas a la IA de toda la web. Los casos de uso lo tratan como un
// modelo no disponible: preguntar muestra los fragmentos encontrados y las propuestas con IA avisan.
export class AiDailyLimitReachedError extends Error {
  constructor() {
    super("Por hoy se ha alcanzado el límite de consultas a la IA.");
    this.name = "AiDailyLimitReachedError";
  }
}
