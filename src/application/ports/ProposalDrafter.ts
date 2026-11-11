import type { GeneratedEventProposal, GeneratedNewTopicProposal } from "@/domain/entities/ProposalDrafts";

// Lee un fragmento pegado por un usuario y propone los campos de su propuesta. Falla si el modelo no está
// disponible o no devuelve un resultado válido.
export interface ProposalDrafter {
  draftEventProposal(fragment: string): Promise<GeneratedEventProposal>;
  draftNewTopicProposal(fragment: string): Promise<GeneratedNewTopicProposal>;
}
