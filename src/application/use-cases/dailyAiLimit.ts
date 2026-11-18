import { AiDailyLimitReachedError } from "../errors/AiDailyLimitReachedError";
import type { AnswerGenerator } from "../ports/AnswerGenerator";
import type { ContentDrafter } from "../ports/ContentDrafter";
import type { ProposalDrafter } from "../ports/ProposalDrafter";
import type { RateLimiter } from "../ports/RateLimiter";

// La clave del límite global: todas las llamadas a la IA de la web cuentan juntas.
const GLOBAL_KEY = "toda-la-web";

interface AiModels {
  answers: AnswerGenerator;
  drafter: ContentDrafter & ProposalDrafter;
}

// Envuelve los modelos con un tope diario para toda la web (OWASP LLM10): el plan gratuito de Groq tiene
// un cupo diario de tokens, y los límites por usuario no impiden que muchos usuarios juntos lo agoten.
// Preguntar y cada propuesta con IA gastan del mismo cupo. Al agotarse, falla sin llamar al modelo, y los
// casos de uso ya saben qué hacer cuando el modelo falla (patrón decorator: no saben que el tope existe).
export function withDailyAiLimit({ answers, drafter }: AiModels, limiter: RateLimiter): AiModels {
  async function withinLimit<T>(call: () => Promise<T>): Promise<T> {
    const decision = await limiter.consume(GLOBAL_KEY);
    if (!decision.allowed) throw new AiDailyLimitReachedError();
    return call();
  }

  return {
    answers: { answer: (question, sources) => withinLimit(() => answers.answer(question, sources)) },
    drafter: {
      draftEvents: (source) => withinLimit(() => drafter.draftEvents(source)),
      draftQuiz: (source) => withinLimit(() => drafter.draftQuiz(source)),
      draftEventProposal: (fragment) => withinLimit(() => drafter.draftEventProposal(fragment)),
      draftNewTopicProposal: (fragment) => withinLimit(() => drafter.draftNewTopicProposal(fragment)),
    },
  };
}
