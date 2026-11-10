// The embedding model of the RAG, shared by its adapter and the database column (pgvector needs the size
// of the vectors). Changing the model means a new migration for the column and `npm run rag:index`.
// Multilingual E5 (small): runs inside Node with Transformers.js, free, and understands Spanish.
export const EMBEDDING_MODEL = "Xenova/multilingual-e5-small";
export const EMBEDDING_DIMENSIONS = 384;
// Below this, a fragment has nothing to do with the question. The similarities of E5 models are all high
// and close together, so this only filters what is clearly unrelated.
export const MIN_RELEVANT_SIMILARITY = 0.8;
