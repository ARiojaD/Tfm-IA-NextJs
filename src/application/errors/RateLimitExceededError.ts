// Se ha superado un límite de peticiones (OWASP API4). `retryAfterSeconds` permite decirle al usuario
// cuándo puede volver a intentarlo.
export class RateLimitExceededError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super(`Demasiadas peticiones seguidas. Inténtalo de nuevo en ${retryAfterSeconds} s`);
    this.name = "RateLimitExceededError";
  }
}
