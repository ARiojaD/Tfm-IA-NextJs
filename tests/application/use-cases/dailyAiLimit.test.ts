import { describe, expect, it } from "vitest";
import type { AnswerGenerator } from "@/application/ports/AnswerGenerator";
import type { ContentDrafter } from "@/application/ports/ContentDrafter";
import type { ProposalDrafter } from "@/application/ports/ProposalDrafter";
import { AiDailyLimitReachedError } from "@/application/errors/AiDailyLimitReachedError";
import { withDailyAiLimit } from "@/application/use-cases/dailyAiLimit";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";

const clock = { now: () => new Date("2026-11-18T10:00:00Z") };
const source = { title: "Julio César", text: "Cruzó el Rubicón en el 49 a.C." };

// Modelos de mentira que cuentan cuántas veces se les llama.
function fakeModels() {
  const calls = { value: 0 };
  const answers: AnswerGenerator = {
    answer: () => {
      calls.value++;
      return Promise.resolve({ coverage: "FULL", answer: "En el 49 a.C. [1].", missing: "" });
    },
  };
  const drafter: ContentDrafter & ProposalDrafter = {
    draftEvents: () => {
      calls.value++;
      return Promise.resolve({ events: [] });
    },
    draftQuiz: () => {
      calls.value++;
      return Promise.resolve({ questions: [] });
    },
    draftEventProposal: () => {
      calls.value++;
      return Promise.resolve({ title: "", year: 0, era: "BC", description: "" });
    },
    draftNewTopicProposal: () => {
      calls.value++;
      return Promise.resolve({ title: "", summary: "", category: "CHARACTERS", startYear: 0, startEra: "BC", endYear: 0, endEra: "BC" });
    },
  } as unknown as ContentDrafter & ProposalDrafter;
  return { answers, drafter, calls };
}

describe("withDailyAiLimit (tope diario global de la IA)", () => {
  it("por debajo del tope, deja pasar las llamadas al modelo", async () => {
    const models = fakeModels();
    const limited = withDailyAiLimit(models, new InMemoryRateLimiter({ limit: 2, windowMs: 86_400_000 }, clock));

    await limited.answers.answer("¿Cuándo?", []);

    expect(models.calls.value).toBe(1);
  });

  it("el tope es uno solo para preguntar y para todas las propuestas con IA", async () => {
    const models = fakeModels();
    const limited = withDailyAiLimit(models, new InMemoryRateLimiter({ limit: 2, windowMs: 86_400_000 }, clock));

    await limited.answers.answer("¿Cuándo?", []);
    await limited.drafter.draftEvents(source);

    await expect(limited.drafter.draftEventProposal("un fragmento")).rejects.toBeInstanceOf(AiDailyLimitReachedError);
    await expect(limited.drafter.draftQuiz(source)).rejects.toBeInstanceOf(AiDailyLimitReachedError);
    await expect(limited.answers.answer("¿Y ahora?", [])).rejects.toBeInstanceOf(AiDailyLimitReachedError);
  });

  it("al superar el tope no llama al modelo", async () => {
    const models = fakeModels();
    const limited = withDailyAiLimit(models, new InMemoryRateLimiter({ limit: 1, windowMs: 86_400_000 }, clock));
    await limited.drafter.draftNewTopicProposal("un fragmento");

    await limited.answers.answer("¿Cuándo?", []).catch(() => undefined);

    expect(models.calls.value).toBe(1);
  });
});
