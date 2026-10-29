import type { BreachedPasswordChecker } from "@/application/ports/BreachedPasswordChecker";

// Test double: a fixed list of "leaked" passwords instead of an external service.
export class InMemoryBreachedPasswordChecker implements BreachedPasswordChecker {
  readonly checkedPasswords: string[] = [];

  constructor(private readonly breached: string[] = []) {}

  isBreached(password: string): Promise<boolean> {
    this.checkedPasswords.push(password);
    return Promise.resolve(this.breached.includes(password));
  }
}
