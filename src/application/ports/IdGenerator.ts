// Source of new entity ids. Injected so tests get predictable ids.
export interface IdGenerator {
  generate(): string;
}
