import { describe, expect, it } from "vitest";
import { ProposalSchema } from "@/domain/entities/Proposal";
import { aProposal } from "../../fixtures/proposals";

describe("ProposalSchema", () => {
  it.each([
    ["un evento para un tema", aProposal({ kind: "EVENT" })],
    ["una recomendación para un tema", aProposal({ kind: "RECOMMENDATION" })],
    ["una corrección de un tema", aProposal({ kind: "CORRECTION" })],
    ["un tema nuevo", aProposal({ kind: "NEW_TOPIC" })],
  ])("acepta %s", (_case, proposal) => {
    expect(ProposalSchema.parse(proposal)).toEqual(proposal);
  });

  it("rechaza un tipo de propuesta desconocido", () => {
    expect(ProposalSchema.safeParse({ ...aProposal({ kind: "CORRECTION" }), kind: "IMAGE" }).success).toBe(false);
  });

  it("una propuesta sobre un tema necesita el tema", () => {
    const withoutTopic: Record<string, unknown> = { ...aProposal({ kind: "CORRECTION" }) };
    delete withoutTopic.topicId;

    expect(ProposalSchema.safeParse(withoutTopic).success).toBe(false);
  });

  it("exige la fuente: toda propuesta dice de dónde sale", () => {
    expect(ProposalSchema.safeParse({ ...aProposal({ kind: "CORRECTION" }), source: " " }).success).toBe(false);
  });

  it("una propuesta rechazada necesita el motivo", () => {
    const rejected = { ...aProposal({ kind: "CORRECTION" }), status: "REJECTED", reviewedAt: new Date(), reviewedBy: "admin-1" };

    expect(ProposalSchema.safeParse(rejected).error?.issues[0].message).toBe("Una propuesta rechazada necesita el motivo");
    expect(ProposalSchema.safeParse({ ...rejected, reviewNote: "Sin fuente fiable." }).success).toBe(true);
  });

  it("una propuesta revisada guarda cuándo se revisó", () => {
    const approved = { ...aProposal({ kind: "CORRECTION" }), status: "APPROVED" };

    expect(ProposalSchema.safeParse(approved).success).toBe(false);
    expect(ProposalSchema.safeParse({ ...approved, reviewedAt: new Date() }).success).toBe(true);
  });
});
