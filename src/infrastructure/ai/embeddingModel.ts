// El modelo de embeddings del RAG, compartido por su adaptador y por la columna de la base de datos
// (pgvector necesita saber el tamaño de los vectores). Cambiar de modelo supone una migración nueva para la
// columna y `npm run rag:index`. Multilingual E5 (small): se ejecuta dentro de Node con Transformers.js,
// es gratuito y entiende castellano.
export const EMBEDDING_MODEL = "Xenova/multilingual-e5-small";
export const EMBEDDING_DIMENSIONS = 384;
// Por debajo de este valor, un fragmento no tiene nada que ver con la pregunta. Las similitudes de los
// modelos E5 son todas altas y muy juntas, así que esto solo filtra lo que claramente no tiene relación.
export const MIN_RELEVANT_SIMILARITY = 0.8;
