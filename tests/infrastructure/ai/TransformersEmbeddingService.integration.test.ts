import { describe, expect, it } from "vitest";
import { EMBEDDING_DIMENSIONS } from "@/infrastructure/ai/embeddingModel";
import { TransformersEmbeddingService } from "@/infrastructure/ai/TransformersEmbeddingService";

const cosine = (a: number[], b: number[]) => a.reduce((sum, value, i) => sum + value * b[i], 0);

// El modelo real (se descarga en .cache/transformers la primera vez): comprueba que entiende el significado
// en castellano, más allá de compartir palabras.
describe("TransformersEmbeddingService (multilingual-e5-small)", { timeout: 120_000 }, () => {
  const embeddings = new TransformersEmbeddingService();

  it("devuelve vectores unitarios del tamaño de la columna de pgvector", async () => {
    const vectors = await embeddings.embedDocuments(["Julio César cruzó el Rubicón.", "Pericles gobernó Atenas."]);

    expect(vectors).toHaveLength(2);
    for (const vector of vectors) {
      expect(vector).toHaveLength(EMBEDDING_DIMENSIONS);
      expect(Math.hypot(...vector)).toBeCloseTo(1, 4);
    }
  });

  it("acerca la pregunta al fragmento que la responde aunque no compartan palabras", async () => {
    const question = await embeddings.embedQuery("¿Cómo murió el dictador romano?");
    const [murder, athens] = await embeddings.embedDocuments([
      "Julio César. Idus de marzo: fue apuñalado por un grupo de senadores en la Curia de Pompeyo.",
      "Pericles. Impulsó la construcción del Partenón en la Acrópolis de Atenas.",
    ]);

    expect(cosine(question, murder)).toBeGreaterThan(cosine(question, athens));
  });

  it("reparte en lotes muchos fragmentos y conserva el orden", async () => {
    const texts = [
      ...Array.from({ length: 19 }, (_, i) => `Fragmento número ${i}.`),
      "El Partenón se levantó en la Acrópolis de Atenas.",
    ];

    const vectors = await embeddings.embedDocuments(texts);

    expect(vectors).toHaveLength(20);
    // No exactamente iguales: en un lote los textos más cortos se rellenan, y eso mueve los últimos decimales.
    const [alone] = await embeddings.embedDocuments([texts[19]]);
    expect(cosine(vectors[19], alone)).toBeGreaterThan(0.99);
    expect(cosine(vectors[0], alone)).toBeLessThan(0.95);
  });
});
