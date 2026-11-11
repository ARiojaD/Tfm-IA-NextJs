import type { EmbeddingService } from "@/application/ports/EmbeddingService";

// Doble de prueba: cada palabra suma en una posición del vector (feature hashing), así que los textos que
// comparten palabras se parecen. Sin modelo y sin descargas, para que los tests unitarios y el container
// en memoria funcionen en cualquier sitio. No entiende nada de significado ("guerra" y "batalla" no tienen
// nada en común): la aplicación usa `TransformersEmbeddingService`.
export class HashingEmbeddingService implements EmbeddingService {
  constructor(private readonly dimensions: number) {}

  embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.resolve(texts.map((text) => this.embed(text)));
  }

  embedQuery(text: string): Promise<number[]> {
    return Promise.resolve(this.embed(text));
  }

  private embed(text: string): number[] {
    const vector = Array.from({ length: this.dimensions }, () => 0);
    const words = text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? [];
    for (const word of words) {
      vector[hash(word) % this.dimensions] += 1;
    }
    // Sin palabras, una dirección fija: un vector de ceros no tiene similitud del coseno con nada.
    if (words.length === 0) vector[0] = 1;

    const length = Math.hypot(...vector);
    return vector.map((value) => value / length);
  }
}

// FNV-1a: pequeño, rápido y estable entre ejecuciones.
function hash(word: string): number {
  let value = 0x811c9dc5;
  for (let i = 0; i < word.length; i++) {
    value ^= word.charCodeAt(i);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}
