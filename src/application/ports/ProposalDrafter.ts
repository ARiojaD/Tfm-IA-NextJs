import type { GeneratedEventProposal, GeneratedNewTopicProposal } from "@/domain/entities/ProposalDrafts";

// Reads a fragment pasted by a user and proposes the fields of their proposal. Rejects if the model is
// unavailable or does not return a valid result.
export interface ProposalDrafter {
  draftEventProposal(fragment: string): Promise<GeneratedEventProposal>;
  draftNewTopicProposal(fragment: string): Promise<GeneratedNewTopicProposal>;
}
