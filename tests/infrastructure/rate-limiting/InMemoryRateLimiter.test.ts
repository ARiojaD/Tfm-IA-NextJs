import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { describeRateLimiterContract } from "../../application/ports/RateLimiter.contract";

describeRateLimiterContract("InMemoryRateLimiter", (policy, clock) => new InMemoryRateLimiter(policy, clock));
