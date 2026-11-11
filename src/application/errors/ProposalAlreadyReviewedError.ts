// Una propuesta se revisa una sola vez: aprobarla dos veces añadiría dos veces su evento o su recomendación.
export class ProposalAlreadyReviewedError extends Error {
  constructor() {
    super("Esta propuesta ya se revisó");
    this.name = "ProposalAlreadyReviewedError";
  }
}
