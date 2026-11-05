import type { EmbeddingService } from "@/application/ports/EmbeddingService";

// Test double: each word adds to one position of the vector (feature hashing), so texts that share words
// are similar. No model and no download, so the unit tests and the in-memory container run anywhere.
// It understands nothing of meaning ("guerra" and "batalla" have nothing in common): the app uses
// TransformersEmbeddingService.
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
    // Without words, a fixed direction: a zero vector has no cosine similarity with anything.
    if (words.length === 0) vector[0] = 1;

    const length = Math.hypot(...vector);
    return vector.map((value) => value / length);
  }
}

// FNV-1a: small, fast and stable between runs.
function hash(word: string): number {
  let value = 0x811c9dc5;
  for (let i = 0; i < word.length; i++) {
    value ^= word.charCodeAt(i);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}
