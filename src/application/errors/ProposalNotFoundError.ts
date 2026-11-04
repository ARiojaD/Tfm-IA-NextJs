export class ProposalNotFoundError extends Error {
  constructor(readonly proposalId: string) {
    super("Esta propuesta ya no existe");
    this.name = "ProposalNotFoundError";
  }
}
