import type { IdGenerator } from "@/application/ports/IdGenerator";

// Ids aleatorios (UUID v4) con el generador criptográfico de Node: imposibles de adivinar.
export class RandomUuidGenerator implements IdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}
