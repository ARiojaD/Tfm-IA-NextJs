// Caps how many times a requester may perform an action within a time window (OWASP API4).
export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export interface RateLimiter {
  // Records an attempt for `key` and says whether it is allowed. Rejected attempts do not use up quota.
  consume(key: string): Promise<RateLimitDecision>;
}
