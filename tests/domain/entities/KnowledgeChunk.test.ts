import { describe, expect, it } from "vitest";
import { buildTopicChunks, chunkEmbeddingText, KnowledgeChunkSchema } from "@/domain/entities/KnowledgeChunk";
import { anEvent, aTopic } from "../../fixtures/historicalTopics";

const caesar = aTopic({
  id: "topic-caesar",
  title: "Julio César",
  summary: "General y dictador que transformó la República romana.",
  introduction: ["Nació en el seno de la gens Julia.", "Conquistó las Galias entre el 58 y el 50 a.C."],
  keyFacts: [
    { label: "Nacimiento", value: "12 de julio del 100 a.C." },
    { label: "Muerte", value: "15 de marzo del 44 a.C." },
  ],
});

const ides = anEvent({
  id: "event-ides",
  topicId: "topic-caesar",
  title: "Idus de marzo",
  date: { year: -44, month: 3 },
  description: "Es asesinado en la Curia de Pompeyo.",
});
const rubicon = anEvent({
  id: "event-rubicon",
  topicId: "topic-caesar",
  title: "Cruce del Rubicón",
  date: { year: -49, month: 1 },
  description: "Desafía al Senado y comienza la guerra civil.",
});
const gaul = anEvent({
  id: "event-gaul",
  topicId: "topic-caesar",
  title: "Inicio de la guerra de las Galias",
  date: { year: -58 },
  description: "Primera campaña contra los helvecios.",
});

describe("buildTopicChunks", () => {
  it("crea un fragmento por cada párrafo de la introducción, en su orden", () => {
    const chunks = buildTopicChunks(caesar, []).filter((chunk) => chunk.source === "INTRODUCTION");

    expect(chunks).toEqual([
      { topicId: "topic-caesar", source: "INTRODUCTION", position: 0, content: "Nació en el seno de la gens Julia." },
      {
        topicId: "topic-caesar",
        source: "INTRODUCTION",
        position: 1,
        content: "Conquistó las Galias entre el 58 y el 50 a.C.",
      },
    ]);
  });

  it("crea un fragmento por cada dato clave, con su etiqueta", () => {
    const chunks = buildTopicChunks(caesar, []).filter((chunk) => chunk.source === "KEY_FACT");

    expect(chunks.map((chunk) => chunk.content)).toEqual([
      "Nacimiento: 12 de julio del 100 a.C.",
      "Muerte: 15 de marzo del 44 a.C.",
    ]);
    expect(chunks.map((chunk) => chunk.position)).toEqual([0, 1]);
  });

  it("crea un fragmento por evento, en orden cronológico, con la fecha escrita y el id del evento", () => {
    const chunks = buildTopicChunks(caesar, [ides, rubicon, gaul]).filter((chunk) => chunk.source === "EVENT");

    expect(chunks).toEqual([
      {
        topicId: "topic-caesar",
        source: "EVENT",
        position: 0,
        eventId: "event-gaul",
        content: "58 a.C. — Inicio de la guerra de las Galias. Primera campaña contra los helvecios.",
      },
      {
        topicId: "topic-caesar",
        source: "EVENT",
        position: 1,
        eventId: "event-rubicon",
        content: "enero de 49 a.C. — Cruce del Rubicón. Desafía al Senado y comienza la guerra civil.",
      },
      {
        topicId: "topic-caesar",
        source: "EVENT",
        position: 2,
        eventId: "event-ides",
        content: "marzo de 44 a.C. — Idus de marzo. Es asesinado en la Curia de Pompeyo.",
      },
    ]);
  });

  it("ignora los eventos de otros temas", () => {
    const otherTopic = anEvent({ id: "event-marathon", topicId: "topic-persian-wars" });

    expect(buildTopicChunks(caesar, [otherTopic]).some((chunk) => chunk.source === "EVENT")).toBe(false);
  });

  it("primero la introducción, luego los datos clave y por último la cronología", () => {
    const sources = buildTopicChunks(caesar, [rubicon]).map((chunk) => chunk.source);

    expect(sources).toEqual(["INTRODUCTION", "INTRODUCTION", "KEY_FACT", "KEY_FACT", "EVENT"]);
  });

  it("todos los fragmentos cumplen el esquema del dominio", () => {
    for (const chunk of buildTopicChunks(caesar, [ides, rubicon])) {
      expect(KnowledgeChunkSchema.safeParse(chunk).success).toBe(true);
    }
  });
});

describe("chunkEmbeddingText", () => {
  it("antepone el título y el resumen del tema y nombra la sección, para que la pregunta por el tema lo encuentre", () => {
    const [paragraph] = buildTopicChunks(caesar, []);

    expect(chunkEmbeddingText(caesar, paragraph)).toBe(
      "Julio César. General y dictador que transformó la República romana.\n" +
        "Introducción: Nació en el seno de la gens Julia.",
    );
  });

  it("nombra los datos clave y la cronología", () => {
    const chunks = buildTopicChunks(caesar, [rubicon]);
    const keyFact = chunks.find((chunk) => chunk.source === "KEY_FACT")!;
    const event = chunks.find((chunk) => chunk.source === "EVENT")!;

    expect(chunkEmbeddingText(caesar, keyFact)).toMatch(/\nDato clave: Nacimiento: 12 de julio del 100 a\.C\.$/);
    expect(chunkEmbeddingText(caesar, event)).toMatch(/\nCronología: enero de 49 a\.C\. — Cruce del Rubicón\./);
  });
});

describe("KnowledgeChunkSchema", () => {
  const paragraph = { topicId: "topic-caesar", source: "INTRODUCTION", position: 0, content: "Texto." };

  it("rechaza un fragmento vacío", () => {
    expect(KnowledgeChunkSchema.safeParse({ ...paragraph, content: "   " }).success).toBe(false);
  });

  it("rechaza una posición negativa", () => {
    expect(KnowledgeChunkSchema.safeParse({ ...paragraph, position: -1 }).success).toBe(false);
  });

  it("un evento necesita su id, para poder enlazarlo en la cronología", () => {
    expect(KnowledgeChunkSchema.safeParse({ ...paragraph, source: "EVENT" }).success).toBe(false);
    expect(KnowledgeChunkSchema.safeParse({ ...paragraph, source: "EVENT", eventId: "event-ides" }).success).toBe(true);
  });

  it("solo los eventos llevan id de evento", () => {
    expect(KnowledgeChunkSchema.safeParse({ ...paragraph, eventId: "event-ides" }).success).toBe(false);
  });
});
