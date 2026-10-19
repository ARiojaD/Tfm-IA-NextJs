export class TopicNotFoundError extends Error {
  constructor(readonly slug: string) {
    super(`No existe ningún tema histórico con el identificador "${slug}"`);
    this.name = "TopicNotFoundError";
  }
}
