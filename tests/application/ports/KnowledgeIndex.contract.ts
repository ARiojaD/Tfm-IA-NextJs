import { describe, expect, it } from "vitest";
import type { IndexedChunk, KnowledgeIndex } from "@/application/ports/KnowledgeIndex";
import type { KnowledgeChunk } from "@/domain/entities/KnowledgeChunk";

// `dimensions` is the size the implementation stores (pgvector's column has a fixed one).
export function describeKnowledgeIndexContract(
  name: string,
  createIndex: () => KnowledgeIndex | Promise<KnowledgeIndex>,
  dimensions: number,
) {
  // A unit vector along one axis, plus a little of a second one: similarity with each axis is known.
  const vector = (axis: number, lean: { axis: number; amount: number } | null = null): number[] => {
    const values = Array.from({ length: dimensions }, () => 0);
    values[axis] = 1;
    if (lean) values[lean.axis] = lean.amount;
    const length = Math.hypot(...values);
    return values.map((value) => value / length);
  };

  const paragraph = (topicId: string, position: number, content: string): KnowledgeChunk => ({
    topicId,
    source: "INTRODUCTION",
    position,
    content,
  });

  const rubicon: IndexedChunk = {
    chunk: { topicId: "topic-caesar", source: "EVENT", position: 0, eventId: "event-rubicon", content: "Cruce del Rubicón." },
    embedding: vector(0),
  };
  const gaul: IndexedChunk = { chunk: paragraph("topic-caesar", 0, "Conquista de las Galias."), embedding: vector(1) };
  const pericles: IndexedChunk = {
    chunk: paragraph("topic-pericles", 0, "Pericles gobernó Atenas."),
    embedding: vector(2, { axis: 0, amount: 0.5 }),
  };

  describe(`${name} cumple el contrato de KnowledgeIndex`, () => {
    it("sin fragmentos indexados no encuentra nada", async () => {
      const index = await createIndex();

      expect(await index.search(vector(0), 5)).toEqual([]);
    });

    it("devuelve primero el fragmento más parecido, con su similitud", async () => {
      const index = await createIndex();
      await index.replaceTopic("topic-caesar", [rubicon, gaul]);
      await index.replaceTopic("topic-pericles", [pericles]);

      const matches = await index.search(vector(0), 5);

      expect(matches.map((match) => match.chunk)).toEqual([rubicon.chunk, pericles.chunk, gaul.chunk]);
      expect(matches[0].similarity).toBeCloseTo(1, 5);
      expect(matches[1].similarity).toBeCloseTo(0.5 / Math.hypot(1, 0.5), 5);
      expect(matches[2].similarity).toBeCloseTo(0, 5);
    });

    it("devuelve como mucho `limit` fragmentos", async () => {
      const index = await createIndex();
      await index.replaceTopic("topic-caesar", [rubicon, gaul]);
      await index.replaceTopic("topic-pericles", [pericles]);

      expect(await index.search(vector(1), 2)).toHaveLength(2);
    });

    it("replaceTopic sustituye todos los fragmentos del tema", async () => {
      const index = await createIndex();
      await index.replaceTopic("topic-caesar", [rubicon, gaul]);
      const edited: IndexedChunk = { chunk: paragraph("topic-caesar", 0, "Las Galias, reescrito."), embedding: vector(1) };

      await index.replaceTopic("topic-caesar", [edited]);

      expect((await index.search(vector(1), 5)).map((match) => match.chunk)).toEqual([edited.chunk]);
    });

    it("replaceTopic no toca los fragmentos de otros temas", async () => {
      const index = await createIndex();
      await index.replaceTopic("topic-caesar", [rubicon]);
      await index.replaceTopic("topic-pericles", [pericles]);

      await index.replaceTopic("topic-caesar", []);

      expect((await index.search(vector(2), 5)).map((match) => match.chunk)).toEqual([pericles.chunk]);
    });

    it("removeTopic quita solo los fragmentos de ese tema", async () => {
      const index = await createIndex();
      await index.replaceTopic("topic-caesar", [rubicon, gaul]);
      await index.replaceTopic("topic-pericles", [pericles]);

      await index.removeTopic("topic-caesar");

      expect((await index.search(vector(0), 5)).map((match) => match.chunk)).toEqual([pericles.chunk]);
    });

    it("quitar un tema que no está indexado no falla", async () => {
      const index = await createIndex();

      await expect(index.removeTopic("topic-caesar")).resolves.toBeUndefined();
    });

    it("devuelve copias: modificar el resultado no altera el índice", async () => {
      const index = await createIndex();
      await index.replaceTopic("topic-caesar", [rubicon]);

      const [match] = await index.search(vector(0), 1);
      match.chunk.content = "Cambiado";

      expect((await index.search(vector(0), 1))[0].chunk.content).toBe("Cruce del Rubicón.");
    });
  });
}
