import type { Clock } from "@/application/ports/Clock";

// La hora real del sistema. Los tests usan un reloj fijo en su lugar.
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
