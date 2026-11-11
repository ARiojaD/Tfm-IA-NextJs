// La fuente de la hora actual. Se inyecta para que los tests puedan congelarla.
export interface Clock {
  now(): Date;
}
