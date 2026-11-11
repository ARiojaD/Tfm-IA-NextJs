// La fuente de ids para las entidades nuevas. Se inyecta para que los tests tengan ids predecibles.
export interface IdGenerator {
  generate(): string;
}
