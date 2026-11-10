import type { GeneratedEvents, GeneratedQuiz } from "@/domain/entities/TopicDrafts";

export interface TopicSource {
  title: string;
  text: string;
}

// Proposes a timeline or a quiz from a topic's text, and nothing else. Rejects if the model is unavailable
// or does not return a valid result.
export interface ContentDrafter {
  draftEvents(source: TopicSource): Promise<GeneratedEvents>;
  draftQuiz(source: TopicSource): Promise<GeneratedQuiz>;
}
