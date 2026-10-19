// Source of the current time. Injected so tests can freeze it.
export interface Clock {
  now(): Date;
}
