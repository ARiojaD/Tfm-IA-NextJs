import type { Clock } from "@/application/ports/Clock";
import type { RateLimitDecision, RateLimiter, RateLimitPolicy } from "@/application/ports/RateLimiter";

// Sliding-window log: keeps the timestamp of each allowed request per key and drops the ones
// older than the window. Only valid for a single server process: with several instances
// (serverless, multiple containers) the counters must live in a shared store such as Redis.
export class InMemoryRateLimiter implements RateLimiter {
  private readonly requestsByKey = new Map<string, number[]>();

  constructor(
    private readonly policy: RateLimitPolicy,
    private readonly clock: Clock,
  ) {}

  consume(key: string): Promise<RateLimitDecision> {
    const now = this.clock.now().getTime();
    const windowStart = now - this.policy.windowMs;
    const recent = (this.requestsByKey.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

    if (recent.length >= this.policy.limit) {
      this.requestsByKey.set(key, recent);
      const oldestExpiresAt = recent[0] + this.policy.windowMs;
      return Promise.resolve({ allowed: false, retryAfterSeconds: Math.ceil((oldestExpiresAt - now) / 1000) });
    }

    recent.push(now);
    this.requestsByKey.set(key, recent);
    return Promise.resolve({ allowed: true });
  }
}
