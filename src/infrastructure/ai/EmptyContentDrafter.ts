import type { ContentDrafter } from "@/application/ports/ContentDrafter";
import type { ProposalDrafter } from "@/application/ports/ProposalDrafter";
import type { GeneratedEventProposal, GeneratedNewTopicProposal } from "@/domain/entities/ProposalDrafts";
import type { GeneratedEvents, GeneratedQuiz } from "@/domain/entities/TopicDrafts";

// Test double for the in-memory container: proposes nothing. No model needed.
export class EmptyContentDrafter implements ContentDrafter, ProposalDrafter {
  draftEvents(): Promise<GeneratedEvents> {
    return Promise.resolve({ events: [] });
  }

  draftQuiz(): Promise<GeneratedQuiz> {
    return Promise.resolve({ questions: [] });
  }

  draftEventProposal(): Promise<GeneratedEventProposal> {
    return Promise.reject(new Error("Sin modelo"));
  }

  draftNewTopicProposal(): Promise<GeneratedNewTopicProposal> {
    return Promise.reject(new Error("Sin modelo"));
  }
}
