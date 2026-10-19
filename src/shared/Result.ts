// Outcome of an operation that can fail in an expected way, without throwing.
// Same shape as Zod's safeParse and the API's { success, error } responses.
export type Result<T, E extends Error = Error> = { success: true; data: T } | { success: false; error: E };

export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function failure<E extends Error>(error: E): Result<never, E> {
  return { success: false, error };
}
