// El resultado de una operación que puede fallar de forma esperada, sin lanzar excepciones. Tiene la misma
// forma que el `safeParse` de Zod y que las respuestas `{ success, error }` de la API, y obliga a quien
// llama a tratar el error.
export type Result<T, E extends Error = Error> = { success: true; data: T } | { success: false; error: E };

export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function failure<E extends Error>(error: E): Result<never, E> {
  return { success: false, error };
}
