import { describe, expect, it } from "vitest";
import { HashingEmbeddingService } from "@/infrastructure/ai/HashingEmbeddingService";

const cosine = (a: number[], b: number[]) => a.reduce((sum, value, i) => sum + value * b[i], 0);

describe("HashingEmbeddingService (doble de pruebas, sin modelo)", () => {
  const embeddings = new HashingEmbeddingService(64);

  it("devuelve un vector unitario del tamaño indicado por cada texto", async () => {
    const vectors = await embeddings.embedDocuments(["Julio César cruzó el Rubicón", "Pericles"]);

    expect(vectors).toHaveLength(2);
    for (const vector of vectors) {
      expect(vector).toHaveLength(64);
      expect(Math.hypot(...vector)).toBeCloseTo(1, 10);
    }
  });

  it("es determinista y trata igual la pregunta que el fragmento", async () => {
    const [document] = await embeddings.embedDocuments(["Cruce del Rubicón"]);

    expect(await embeddings.embedQuery("Cruce del Rubicón")).toEqual(document);
  });

  it("los textos que comparten palabras se parecen más, sin importar mayúsculas ni tildes", async () => {
    const question = await embeddings.embedQuery("¿Cuándo cruzó CESAR el rubicon?");
    const [related, unrelated] = await embeddings.embedDocuments([
      "Julio César cruzó el Rubicón en el 49 a.C.",
      "Pericles gobernó Atenas durante su edad de oro.",
    ]);

    expect(cosine(question, related)).toBeGreaterThan(cosine(question, unrelated));
  });

  it("un texto sin palabras también da un vector válido", async () => {
    const vector = await embeddings.embedQuery("¿?");

    expect(Math.hypot(...vector)).toBeCloseTo(1, 10);
  });
});
