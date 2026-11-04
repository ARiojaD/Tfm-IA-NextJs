// A proposal is reviewed once: approving it twice would add its event or recommendation twice.
export class ProposalAlreadyReviewedError extends Error {
  constructor() {
    super("Esta propuesta ya se revisó");
    this.name = "ProposalAlreadyReviewedError";
  }
}
