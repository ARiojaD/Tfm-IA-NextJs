import { TransformersEmbeddingService } from "@/infrastructure/ai/TransformersEmbeddingService";

// npm run model:download — deja el modelo de embeddings en .cache/transformers. Vercel lo ejecuta antes de
// compilar (vercel.json): así el modelo viaja dentro de las funciones que lo usan (next.config.ts) y no se
// descarga de Hugging Face en cada arranque en frío, donde además el disco es de solo lectura. Si ya está
// en la caché, no descarga nada.
async function main() {
  await new TransformersEmbeddingService().embedQuery("prueba");
  console.log("Modelo de embeddings listo en .cache/transformers.");
}

main().catch((error: unknown) => {
  console.error(`No se pudo descargar el modelo de embeddings: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
