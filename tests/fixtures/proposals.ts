import type { Proposal, ProposalKind } from "@/domain/entities/Proposal";

// A valid pending proposal of each kind; tests override only what matters to them.
export function aProposal(overrides: Partial<Proposal> & { kind: ProposalKind }): Proposal {
  const base = {
    id: "proposal-1",
    userId: "user-1",
    authorName: "Livia",
    source: "Suetonio, Vida de los doce césares",
    status: "PENDING" as const,
    createdAt: new Date("2026-11-04T10:00:00Z"),
  };

  const byKind: Record<ProposalKind, Proposal> = {
    EVENT: {
      ...base,
      kind: "EVENT",
      topicId: "topic-caesar",
      topicTitle: "Julio César",
      event: { title: "Batalla de Munda", date: { year: -45, month: 3 }, description: "Última victoria de César en Hispania." },
    },
    RECOMMENDATION: {
      ...base,
      kind: "RECOMMENDATION",
      topicId: "topic-caesar",
      topicTitle: "Julio César",
      recommendation: { type: "BOOK", title: "César", creator: "Adrian Goldsworthy", year: 2006, description: "Biografía muy completa." },
    },
    CORRECTION: {
      ...base,
      kind: "CORRECTION",
      topicId: "topic-caesar",
      topicTitle: "Julio César",
      message: "La batalla de Farsalia fue en agosto del 48 a.C., no en julio.",
    },
    NEW_TOPIC: {
      ...base,
      kind: "NEW_TOPIC",
      newTopic: {
        title: "Pompeyo",
        era: "ROMAN",
        category: "PEOPLE",
        summary: "Aliado y después rival de César.",
        period: { start: { year: -106 }, end: { year: -48 } },
        description: "Gneo Pompeyo Magno fue uno de los grandes generales de la República.",
      },
    },
  };

  return { ...byKind[overrides.kind], ...overrides } as Proposal;
}
