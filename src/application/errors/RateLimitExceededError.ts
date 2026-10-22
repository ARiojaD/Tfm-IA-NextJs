export class RateLimitExceededError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super(`Demasiadas peticiones seguidas. Inténtalo de nuevo en ${retryAfterSeconds} s`);
    this.name = "RateLimitExceededError";
  }
}
