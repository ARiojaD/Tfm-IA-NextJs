import type { ProposalKind, ProposalStatus } from "@/domain/entities/Proposal";

// Los nombres de los tipos y estados de las propuestas tal como los lee el usuario.
export const PROPOSAL_KIND_LABELS: Record<ProposalKind, string> = {
  EVENT: "Evento para la cronología",
  RECOMMENDATION: "Recomendación",
  CORRECTION: "Corrección",
  NEW_TOPIC: "Tema nuevo",
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};
