import type { AnswerGenerator, AnswerSource } from "@/application/ports/AnswerGenerator";
import type { GeneratedAnswer } from "@/domain/entities/EncyclopediaAnswer";

// Test double for the in-memory container: answers with its first fragment, citing it. No model needed.
export class EchoAnswerGenerator implements AnswerGenerator {
  answer(_question: string, sources: AnswerSource[]): Promise<GeneratedAnswer> {
    const [first] = sources;
    return Promise.resolve({ coverage: "FULL", answer: `${first.content} [${first.number}]`, missing: "" });
  }
}
