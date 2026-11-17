// Cuánto razona un modelo antes de responder (`reasoning_effort` en el protocolo de OpenAI). Va en un archivo
// propio porque también lo importa la validación del entorno, que leen los scripts de base de datos: así no
// cargan el SDK del modelo.
export const REASONING_EFFORTS = ["low", "medium", "high"] as const;
export type ReasoningEffort = (typeof REASONING_EFFORTS)[number];
