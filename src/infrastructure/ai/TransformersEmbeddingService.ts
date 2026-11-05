import path from "node:path";
import { env, type FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";
import type { EmbeddingService } from "@/application/ports/EmbeddingService";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "./embeddingModel";

// The fragments go in small batches: the model runs on this machine's CPU and memory grows with the batch.
const BATCH_SIZE = 16;

// Embeddings computed inside Node with Transformers.js (ONNX): no external service, no API key, no cost,
// and the texts never leave the server. The model is downloaded from Hugging Face the first time and kept
// in .cache/transformers (ignored by Git); from then on it loads from disk.
export class TransformersEmbeddingService implements EmbeddingService {
  private extractor: Promise<FeatureExtractionPipeline> | null = null;

  constructor(private readonly cacheDir = path.join(process.cwd(), ".cache", "transformers")) {}

  // The E5 models were trained with these prefixes: without them the search is noticeably worse.
  async embedDocuments(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    for (let start = 0; start < texts.length; start += BATCH_SIZE) {
      vectors.push(...(await this.embed(texts.slice(start, start + BATCH_SIZE).map((text) => `passage: ${text}`))));
    }
    return vectors;
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embed([`query: ${text}`]);
    return vector;
  }

  private async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const extractor = await this.loadModel();
    // Mean pooling and normalized vectors, as the model card says: cosine similarity is then a dot product.
    const output = await extractor(texts, { pooling: "mean", normalize: true });
    const vectors = output.tolist() as number[][];
    if (vectors.some((vector) => vector.length !== EMBEDDING_DIMENSIONS)) {
      throw new Error(`El modelo de embeddings no devuelve vectores de ${EMBEDDING_DIMENSIONS} dimensiones`);
    }
    return vectors;
  }

  // Loaded once and shared; if loading fails (no connection the first time), the next call tries again.
  private loadModel(): Promise<FeatureExtractionPipeline> {
    if (!this.extractor) {
      env.cacheDir = this.cacheDir;
      // 8-bit weights: about a quarter of the size, nearly the same quality.
      this.extractor = pipeline("feature-extraction", EMBEDDING_MODEL, { dtype: "q8" }).catch((error: unknown) => {
        this.extractor = null;
        throw error;
      });
    }
    return this.extractor;
  }
}
