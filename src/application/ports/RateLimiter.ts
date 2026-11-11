// Cuántas veces puede un solicitante hacer una acción dentro de una ventana de tiempo (OWASP API4).
export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number };

// Lleva la cuenta de los intentos de cada solicitante (un usuario, una IP, un correo).
export interface RateLimiter {
  // Registra un intento para `key` y dice si se permite. Los intentos rechazados no gastan cupo.
  consume(key: string): Promise<RateLimitDecision>;
}
