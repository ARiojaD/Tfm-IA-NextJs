import type { ContentDrafter } from "@/application/ports/ContentDrafter";
import type { GeneratedEvents, GeneratedQuiz } from "@/domain/entities/TopicDrafts";

// Test double for the in-memory container: proposes nothing. No model needed.
export class EmptyContentDrafter implements ContentDrafter {
  draftEvents(): Promise<GeneratedEvents> {
    return Promise.resolve({ events: [] });
  }

  draftQuiz(): Promise<GeneratedQuiz> {
    return Promise.resolve({ questions: [] });
  }
}
