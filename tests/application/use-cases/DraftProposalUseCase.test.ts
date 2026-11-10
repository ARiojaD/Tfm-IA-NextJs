import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidProposalError } from "@/application/errors/InvalidProposalError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import type { Clock } from "@/application/ports/Clock";
import type { ProposalDrafter } from "@/application/ports/ProposalDrafter";
import { DraftProposalUseCase } from "@/application/use-cases/DraftProposalUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";

const frozenClock: Clock = { now: () => new Date("2026-11-10T10:00:00Z") };
const FRAGMENT = "En el año 216 a.C. Aníbal aplastó a los romanos en la batalla de Cannas.";
const cannae = { found: true, title: "Batalla de Cannas", year: 216, era: "BC", month: 0, description: "Aníbal vence a Roma." } as const;
const hannibal = {
  found: true,
  title: "Aníbal",
  civilization: "ROMAN",
  category: "PEOPLE",
  summary: "General cartaginés.",
  startYear: 216,
  startEra: "BC",
  startMonth: 0,
  endYear: 0,
  endEra: "BC",
  endMonth: 0,
  description: "Venció a Roma.",
} as const;

describe("DraftProposalUseCase", () => {
  let auth: InMemoryAuthService;
  let drafter: {
    draftEventProposal: ReturnType<typeof vi.fn<ProposalDrafter["draftEventProposal"]>>;
    draftNewTopicProposal: ReturnType<typeof vi.fn<ProposalDrafter["draftNewTopicProposal"]>>;
  };
  let draft: DraftProposalUseCase;

  const signIn = () => auth.register({ name: "Livia", email: "livia@example.com", password: "la batalla de alesia" });

  beforeEach(() => {
    auth = new InMemoryAuthService();
    drafter = {
      draftEventProposal: vi.fn<ProposalDrafter["draftEventProposal"]>(),
      draftNewTopicProposal: vi.fn<ProposalDrafter["draftNewTopicProposal"]>(),
    };
    draft = new DraftProposalUseCase({
      auth,
      rateLimiter: new InMemoryRateLimiter({ limit: 2, windowMs: 60_000 }, frozenClock),
      drafter,
    });
  });

  it("sin sesión no llama al modelo", async () => {
    const result = await draft.execute({ kind: "EVENT", text: FRAGMENT });

    expect(result).toEqual({ success: false, error: expect.any(AuthenticationRequiredError) });
    expect(drafter.draftEventProposal).not.toHaveBeenCalled();
  });

  it("limita las peticiones por usuario", async () => {
    await signIn();
    drafter.draftEventProposal.mockResolvedValue(cannae);
    await draft.execute({ kind: "EVENT", text: FRAGMENT });
    await draft.execute({ kind: "EVENT", text: FRAGMENT });

    expect(await draft.execute({ kind: "EVENT", text: FRAGMENT })).toEqual({ success: false, error: expect.any(RateLimitExceededError) });
  });

  it.each([
    ["un fragmento muy corto", { kind: "EVENT", text: "Roma" }],
    ["un fragmento demasiado largo", { kind: "EVENT", text: "a".repeat(4001) }],
    ["un tipo sin relleno con IA", { kind: "CORRECTION", text: FRAGMENT }],
    ["campos de más", { kind: "EVENT", text: FRAGMENT, source: "Inventada" }],
    ["una entrada que no es texto", { kind: "EVENT", text: 42 }],
  ])("rechaza %s sin llamar al modelo", async (_name, input) => {
    await signIn();

    expect(await draft.execute(input)).toEqual({ success: false, error: expect.any(InvalidProposalError) });
    expect(drafter.draftEventProposal).not.toHaveBeenCalled();
  });

  it("rellena un evento a partir del fragmento", async () => {
    await signIn();
    drafter.draftEventProposal.mockResolvedValue(cannae);

    const result = await draft.execute({ kind: "EVENT", text: FRAGMENT });

    expect(drafter.draftEventProposal).toHaveBeenCalledWith(FRAGMENT);
    expect(result).toEqual({
      success: true,
      data: { kind: "EVENT", values: { title: "Batalla de Cannas", year: "216", era: "BC", month: "", description: "Aníbal vence a Roma." } },
    });
  });

  it("rellena un tema nuevo a partir del fragmento", async () => {
    await signIn();
    drafter.draftNewTopicProposal.mockResolvedValue(hannibal);

    const result = await draft.execute({ kind: "NEW_TOPIC", text: FRAGMENT });

    expect(result.success && result.data).toMatchObject({ kind: "NEW_TOPIC", values: { title: "Aníbal", civilization: "ROMAN", startYear: "216" } });
  });

  it("si el texto no contiene nada que proponer, lo indica", async () => {
    await signIn();
    drafter.draftEventProposal.mockResolvedValue({ ...cannae, found: false });

    expect(await draft.execute({ kind: "EVENT", text: "Receta de bizcocho con tres huevos y harina." })).toMatchObject({ error: { reason: "EMPTY" } });
  });

  it("si el modelo no está disponible, lo indica sin dar detalles", async () => {
    await signIn();
    drafter.draftNewTopicProposal.mockRejectedValue(new Error("detalle interno"));

    const result = await draft.execute({ kind: "NEW_TOPIC", text: FRAGMENT });

    expect(result).toMatchObject({ error: { reason: "UNAVAILABLE" } });
    expect(!result.success && result.error.message).not.toContain("detalle interno");
  });
});
