import type { AnswerGenerator, AnswerSource } from "@/application/ports/AnswerGenerator";
import type { GeneratedAnswer } from "@/domain/entities/EncyclopediaAnswer";

// Doble de prueba para el container en memoria: responde con su primer fragmento, citándolo. No necesita
// modelo.
export class EchoAnswerGenerator implements AnswerGenerator {
  answer(_question: string, sources: AnswerSource[]): Promise<GeneratedAnswer> {
    const [first] = sources;
    return Promise.resolve({ coverage: "FULL", answer: `${first.content} [${first.number}]`, missing: "" });
  }
}
