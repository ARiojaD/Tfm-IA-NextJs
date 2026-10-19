import type { IdGenerator } from "@/application/ports/IdGenerator";

export class RandomUuidGenerator implements IdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}
