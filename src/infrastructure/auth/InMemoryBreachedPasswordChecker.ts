import type { BreachedPasswordChecker } from "@/application/ports/BreachedPasswordChecker";

// Doble de prueba: una lista fija de contraseñas "filtradas" en lugar de un servicio externo.
export class InMemoryBreachedPasswordChecker implements BreachedPasswordChecker {
  readonly checkedPasswords: string[] = [];

  constructor(private readonly breached: string[] = []) {}

  isBreached(password: string): Promise<boolean> {
    this.checkedPasswords.push(password);
    return Promise.resolve(this.breached.includes(password));
  }
}
