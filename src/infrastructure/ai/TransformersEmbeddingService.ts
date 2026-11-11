import path from "node:path";
import { env, type FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";
import type { EmbeddingService } from "@/application/ports/EmbeddingService";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "./embeddingModel";

// Los fragmentos van en lotes pequeños: el modelo se ejecuta en la CPU de esta máquina y la memoria crece
// con el lote.
const BATCH_SIZE = 16;

// Embeddings calculados dentro de Node con Transformers.js (ONNX): sin servicio externo, sin clave de API,
// sin coste, y los textos nunca salen del servidor. El modelo se descarga de Hugging Face la primera vez y
// se guarda en .cache/transformers (ignorado por Git); a partir de ahí se carga desde el disco.
export class TransformersEmbeddingService implements EmbeddingService {
  private extractor: Promise<FeatureExtractionPipeline> | null = null;

  constructor(private readonly cacheDir = path.join(process.cwd(), ".cache", "transformers")) {}

  // Los modelos E5 se entrenaron con estos prefijos ("passage:" y "query:"): sin ellos la búsqueda es
  // bastante peor.
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
    // Mean pooling y vectores normalizados, como indica la ficha del modelo: así la similitud del coseno es
    // un producto escalar.
    const output = await extractor(texts, { pooling: "mean", normalize: true });
    const vectors = output.tolist() as number[][];
    if (vectors.some((vector) => vector.length !== EMBEDDING_DIMENSIONS)) {
      throw new Error(`El modelo de embeddings no devuelve vectores de ${EMBEDDING_DIMENSIONS} dimensiones`);
    }
    return vectors;
  }

  // Se carga una vez y se comparte; si la carga falla (sin conexión la primera vez), la siguiente llamada lo
  // vuelve a intentar.
  private loadModel(): Promise<FeatureExtractionPipeline> {
    if (!this.extractor) {
      env.cacheDir = this.cacheDir;
      // Pesos de 8 bits: más o menos una cuarta parte del tamaño, con casi la misma calidad.
      this.extractor = pipeline("feature-extraction", EMBEDDING_MODEL, { dtype: "q8" }).catch((error: unknown) => {
        console.error(`No se pudo cargar el modelo de embeddings: ${error instanceof Error ? error.name : "error desconocido"}`);
        this.extractor = null;
        throw error;
      });
    }
    return this.extractor;
  }
}
