// Only drafts can be deleted: a published topic has readers (comments, libraries), so it must be
// unpublished first. Two deliberate steps make deleting one by mistake much harder.
export class TopicIsPublishedError extends Error {
  constructor() {
    super("Despublica el tema antes de borrarlo");
    this.name = "TopicIsPublishedError";
  }
}
